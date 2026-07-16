// Lagos/undici IPv6 routing fix — must run before any network I/O.
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { ethers, network } from "hardhat";

const isMainnet = network.name === "botMainnet";
const tokenLabel = isMainnet ? "BOT" : "tBOT";
const explorerBase = isMainnet ? "https://scan.botchain.ai" : "https://scan.bohr.life";

async function main() {
  const [deployer] = await ethers.getSigners();
  const bal = await ethers.provider.getBalance(deployer.address);
  console.log("Network   :", network.name);
  console.log("Deployer  :", deployer.address);
  console.log("Balance   :", ethers.formatEther(bal), tokenLabel);
  if (bal === 0n) {
    console.log(
      isMainnet
        ? "\n⚠  Zero balance. Fund this address with real BOT before deploying.\n"
        : "\n⚠  Zero balance. Get testnet tBOT from https://faucet.botchain.ai/basic first.\n"
    );
  }

  // For the demo the agent (session key) defaults to the deployer. In production this
  // is a separate key the agent process holds — never the owner key.
  const agent = process.env.AGENT_ADDRESS || deployer.address;

  const policy = {
    spendCapPerTx: ethers.parseEther("1"), // 1 tBOT per action
    dailyCap: ethers.parseEther("5"),      // 5 tBOT per rolling 24h
    cooldown: 8,                           // seconds between executed actions
    maxSlippageBps: 150,                   // 1.5%
  };

  console.log("\nDeploying WardenGuard…");
  const Guard = await ethers.getContractFactory("WardenGuard");
  const guard = await Guard.deploy(agent, policy);
  await guard.waitForDeployment();
  const addr = await guard.getAddress();
  console.log("WardenGuard:", addr);

  // Allowlist one destination the agent may route to (a test payee or the B DEX router).
  const dest = process.env.ALLOWED_DEST || deployer.address;
  const t1 = await guard.setAllowedDest(dest, true);
  await t1.wait();
  console.log("Allowlisted:", dest, "· tx", t1.hash);

  // Seed the session with a little native BOT so the agent can act.
  if (process.env.SKIP_FUND === "1") {
    console.log("Skipping auto-fund (SKIP_FUND=1) — fund the contract manually when ready.");
  } else {
    const fundAmount = process.env.FUND_AMOUNT || "2";
    const t2 = await deployer.sendTransaction({ to: addr, value: ethers.parseEther(fundAmount) });
    await t2.wait();
    console.log(`Funded ${fundAmount} ${tokenLabel} · tx`, t2.hash);
  }

  console.log("\n── save these for your submission ──");
  console.log("GUARD_ADDRESS =", addr);
  console.log("ALLOWED_DEST  =", dest);
  console.log("Explorer      :", `${explorerBase}/address/${addr}`);
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
