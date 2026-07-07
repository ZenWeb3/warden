import { expect } from "chai";
import { ethers } from "hardhat";

const E = (n: string) => ethers.parseEther(n);

async function deploy() {
  const [owner, agent, payee, stranger] = await ethers.getSigners();
  const policy = { spendCapPerTx: E("1"), dailyCap: E("5"), cooldown: 0, maxSlippageBps: 150 };
  const Guard = await ethers.getContractFactory("WardenGuard");
  const guard = await Guard.deploy(agent.address, policy);
  await guard.waitForDeployment();
  await guard.setAllowedDest(payee.address, true);
  await owner.sendTransaction({ to: await guard.getAddress(), value: E("10") });
  return { guard, owner, agent, payee, stranger };
}

const H = ethers.id("test-intent");

describe("WardenGuard", () => {
  it("executes an in-policy action, moves funds, logs allowed=true", async () => {
    const { guard, agent, payee } = await deploy();
    const before = await ethers.provider.getBalance(payee.address);
    await expect(guard.connect(agent).screenAndExecute(payee.address, E("0.6"), "0x", 40, H))
      .to.emit(guard, "Decision")
      .withArgs(1n, agent.address, true, "ok", payee.address, E("0.6"), 40, H, anyUint());
    const after = await ethers.provider.getBalance(payee.address);
    expect(after - before).to.equal(E("0.6"));
    expect(await guard.previewSpent()).to.equal(E("0.6"));
  });

  it("refuses an over-cap action, moves NO funds, logs allowed=false", async () => {
    const { guard, agent, payee } = await deploy();
    const before = await ethers.provider.getBalance(payee.address);
    const tx = await guard.connect(agent).screenAndExecute(payee.address, E("9"), "0x", 40, H);
    await expect(tx).to.emit(guard, "Decision"); // allowed=false, reason "spend cap exceeded"
    const after = await ethers.provider.getBalance(payee.address);
    expect(after).to.equal(before); // funds did not move
    expect(await guard.previewSpent()).to.equal(0n); // budget untouched
  });

  it("refuses a non-allowlisted destination", async () => {
    const { guard, agent, stranger } = await deploy();
    const [ok, reason] = await guard.canExecute(stranger.address, E("0.5"), 40);
    expect(ok).to.equal(false);
    expect(reason).to.equal("destination not allowlisted");
  });

  it("reverts when a non-agent calls", async () => {
    const { guard, stranger, payee } = await deploy();
    await expect(
      guard.connect(stranger).screenAndExecute(payee.address, E("0.5"), "0x", 40, H)
    ).to.be.revertedWithCustomError(guard, "NotAgent");
  });

  it("enforces the rolling daily budget across actions", async () => {
    const { guard, agent, payee } = await deploy();
    for (let i = 0; i < 5; i++) {
      await guard.connect(agent).screenAndExecute(payee.address, E("1"), "0x", 40, H);
    }
    expect(await guard.previewSpent()).to.equal(E("5"));
    // 6th action would push over the 5 tBOT daily cap → refused, no spend
    await guard.connect(agent).screenAndExecute(payee.address, E("1"), "0x", 40, H);
    expect(await guard.previewSpent()).to.equal(E("5"));
  });
});

// helper: match any uint (timestamp) in withArgs
function anyUint() {
  const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
  return anyValue;
}
