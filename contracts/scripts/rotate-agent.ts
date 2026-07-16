// Lagos/undici IPv6 routing fix — must run before any network I/O.
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { ethers, network } from "hardhat";

/**
 * Rotates the on-chain agent (session key) away from the owner key.
 * Run with the OWNER's PRIVATE_KEY in .env — never the new agent's key.
 *
 * Required env: GUARD_ADDRESS, NEW_AGENT_ADDRESS
 */
async function main() {
  const guardAddr = req("GUARD_ADDRESS");
  const newAgent = req("NEW_AGENT_ADDRESS");

  const guard = await ethers.getContractAt("WardenGuard", guardAddr);
  const [owner] = await ethers.getSigners();

  const currentOwner = await guard.owner();
  if (currentOwner.toLowerCase() !== owner.address.toLowerCase()) {
    throw new Error(`Signer ${owner.address} is not the contract owner (${currentOwner}).`);
  }

  const currentAgent = await guard.agent();
  console.log("Network      :", network.name);
  console.log("Guard        :", guardAddr);
  console.log("Current agent:", currentAgent);
  console.log("New agent    :", newAgent);

  const tx = await guard.setAgent(newAgent);
  const rc = await tx.wait();
  console.log("\nAgent rotated · tx", tx.hash);
  console.log("Block        :", rc!.blockNumber);

  console.log("\n── next step ──");
  console.log("Put the NEW agent's private key in frontend/.env as VITE_AGENT_PRIVATE_KEY.");
  console.log("Never put the owner's PRIVATE_KEY in the frontend.");
}

function req(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k} — e.g. NEW_AGENT_ADDRESS=0x... GUARD_ADDRESS=0x... npm run rotate-agent`);
  return v;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
