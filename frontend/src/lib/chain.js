import {
  JsonRpcProvider,
  Wallet,
  Contract,
  parseEther,
  formatEther,
  id,
  isAddress,
} from "ethers";

/**
 * Live on-chain bridge to the deployed WardenGuard.
 * Configure via frontend .env:
 *   VITE_RPC, VITE_GUARD_ADDRESS, VITE_ALLOWED_DEST, VITE_AGENT_PRIVATE_KEY
 * If unset, isConfigured() is false and the app runs in simulation mode.
 *
 * NOTE: the agent key sits in the client bundle so the agent can auto-sign.
 * Use a THROWAWAY testnet key only.
 */
export const RPC = import.meta.env.VITE_RPC || "https://rpc.bohr.life";
export const GUARD_ADDRESS = import.meta.env.VITE_GUARD_ADDRESS || "";
export const ALLOWED_DEST = import.meta.env.VITE_ALLOWED_DEST || "";
const AGENT_KEY = import.meta.env.VITE_AGENT_PRIVATE_KEY || "";

const ABI = [
  "function policy() view returns (uint128 spendCapPerTx, uint128 dailyCap, uint32 cooldown, uint16 maxSlippageBps)",
  "function previewSpent() view returns (uint256)",
  "function remainingBudget() view returns (uint256)",
  "function decisionCount() view returns (uint256)",
  "function canExecute(address dest, uint256 amount, uint16 slippageBps) view returns (bool ok, string reason)",
  "function screenAndExecute(address dest, uint256 amount, bytes data, uint16 slippageBps, bytes32 intentHash) returns (bool allowed)",
  "event Decision(uint256 indexed id, address indexed agent, bool allowed, string reason, address dest, uint256 amount, uint16 slippageBps, bytes32 intentHash, uint256 timestamp)",
];

export function isConfigured() {
  return Boolean(GUARD_ADDRESS && AGENT_KEY && isAddress(GUARD_ADDRESS));
}

let _guard = null;
let _provider = null;
function guard() {
  if (_guard) return _guard;
  _provider = new JsonRpcProvider(RPC);
  const signer = new Wallet(AGENT_KEY, _provider);
  _guard = new Contract(GUARD_ADDRESS, ABI, signer);
  return _guard;
}

/** Read the enforced policy from chain (human units). */
export async function readPolicy() {
  const p = await guard().policy();
  return {
    spendCapPerTx: Number(formatEther(p.spendCapPerTx)),
    dailyCap: Number(formatEther(p.dailyCap)),
    cooldownMs: Number(p.cooldown) * 1000,
    maxSlippageBps: Number(p.maxSlippageBps),
  };
}

/** Read live accounting (human units). */
export async function readState() {
  const g = guard();
  const [spentWei, remWei, count, bal] = await Promise.all([
    g.previewSpent(),
    g.remainingBudget(),
    g.decisionCount(),
    _provider.getBalance(GUARD_ADDRESS),
  ]);
  return {
    spent: Number(formatEther(spentWei)),
    remaining: Number(formatEther(remWei)),
    decisionCount: Number(count),
    balance: Number(formatEther(bal)),
  };
}

/** Best-effort load of recent Decision events → tape entries. */
export async function readDecisions(maxBlocks = 9000) {
  try {
    const g = guard();
    const latest = await _provider.getBlockNumber();
    const from = Math.max(0, latest - maxBlocks);
    const logs = await g.queryFilter(g.filters.Decision(), from, latest);
    return logs.reverse().map((l) => {
      const a = l.args;
      const executed = a.allowed;
      return {
        id: `${l.transactionHash}-${a.id}`,
        time: "on-chain",
        onchain: true,
        status: executed ? "executed" : "blocked",
        tx: l.transactionHash,
        reasons: executed ? [] : [a.reason],
        action: {
          tokenIn: "tBOT",
          tokenOut: shortAddr(a.dest),
          value: Number(formatEther(a.amount)),
        },
      };
    });
  } catch (e) {
    console.warn("readDecisions failed (non-fatal):", e?.message || e);
    return [];
  }
}

/** Off-chain preview (no gas). */
export async function preview(dest, amount, slippageBps) {
  const [ok, reason] = await guard().canExecute(
    dest,
    parseEther(String(amount)),
    slippageBps,
  );
  return { ok, reason };
}

/**
 * Send ONE real screenAndExecute. Returns the tx hash and the authoritative
 * on-chain verdict decoded from the Decision event.
 */
export async function execute(dest, amount, slippageBps, intentString) {
  const g = guard();
  const intentHash = id(intentString || "warden action");
  const tx = await g.screenAndExecute(
    dest,
    parseEther(String(amount)),
    "0x",
    slippageBps,
    intentHash,
  );
  const rc = await tx.wait();
  let allowed = false;
  let reason = "unknown";
  for (const log of rc.logs) {
    try {
      const parsed = g.interface.parseLog(log);
      if (parsed && parsed.name === "Decision") {
        allowed = parsed.args.allowed;
        reason = parsed.args.reason;
        break;
      }
    } catch {
      /* not our event */
    }
  }
  return { txHash: tx.hash, allowed, reason };
}

function shortAddr(a) {
  return a ? a.slice(0, 6) + "…" + a.slice(-4) : "";
}
