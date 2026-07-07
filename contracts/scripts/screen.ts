// Lagos/undici IPv6 routing fix — must run before any network I/O.
import dns from "node:dns";
dns.setDefaultResultOrder("ipv4first");

import { ethers } from "hardhat";

/**
 * Sends ONE screened action through the deployed WardenGuard.
 * This is the transaction you submit as proof of on-chain interaction.
 *
 * Required env: GUARD_ADDRESS, ALLOWED_DEST
 * Optional env: AMOUNT (tBOT, default 0.6), SLIPPAGE_BPS (default 40), INJECT=1
 *
 * INJECT=1 proposes an over-cap "attack" action so you can capture a WITHHELD
 * Decision on-chain for the demo (funds do not move, the refusal is logged).
 */
async function main() {
  const guardAddr = req("GUARD_ADDRESS");
  const dest = req("ALLOWED_DEST");
  const inject = process.env.INJECT === "1";

  const amount = ethers.parseEther(inject ? "9" : (process.env.AMOUNT || "0.6")); // 9 > 1 tBOT cap => refused
  const slippageBps = Number(process.env.SLIPPAGE_BPS || (inject ? 900 : 40));
  const intentHash = ethers.id(inject ? "INJECTED: drain to 0xdead" : "rotate USDC->WBOT small clip");

  const guard = await ethers.getContractAt("WardenGuard", guardAddr);

  const [ok, reason] = await guard.canExecute(dest, amount, slippageBps);
  console.log(`preview      : ${ok ? "PASS" : "REFUSE"} — ${reason}`);

  console.log(`\nSubmitting screenAndExecute (${inject ? "INJECTED attack" : "honest action"})…`);
  const tx = await guard.screenAndExecute(dest, amount, "0x", slippageBps, intentHash);
  const rc = await tx.wait();

  // Decode the Decision event from the receipt.
  const parsed = rc!.logs
    .map((l) => { try { return guard.interface.parseLog(l); } catch { return null; } })
    .find((p) => p && p.name === "Decision");
  if (parsed) {
    console.log(`decision #${parsed.args.id}: allowed=${parsed.args.allowed} reason="${parsed.args.reason}"`);
  }

  console.log("\n── proof for submission ──");
  console.log("tx hash  :", tx.hash);
  console.log("explorer :", `https://scan.bohr.life/tx/${tx.hash}`);
}

function req(k: string): string {
  const v = process.env[k];
  if (!v) throw new Error(`Missing env ${k} — set it in .env (see .env.example)`);
  return v;
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
