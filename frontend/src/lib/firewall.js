import { POLICY } from "../config";

/**
 * The pre-sign firewall / trust boundary. Screens one proposed action against
 * every policy and returns a per-check breakdown plus an overall allow flag.
 * Pass an effective `policy` (e.g. read from the on-chain WardenGuard) so the UI
 * screening matches what the contract will enforce; defaults to the static POLICY.
 */
export function evaluate(action, ctx, policy = POLICY) {
  const checks = [];
  const push = (id, label, pass, detail) =>
    checks.push({ id, label, pass, detail });
  const val = Number(action.value) || 0;

  push(
    "cap",
    "SPEND CAP / TX",
    val <= policy.spendCapPerTx,
    `${val.toFixed(2)} ≤ ${policy.spendCapPerTx.toFixed(2)}`,
  );

  push(
    "daily",
    "DAILY BUDGET",
    ctx.spentToday + val <= policy.dailyCap,
    `${(ctx.spentToday + val).toFixed(2)} ≤ ${policy.dailyCap.toFixed(2)}`,
  );

  const tokOk =
    policy.allowlist.includes(action.tokenIn) &&
    policy.allowlist.includes(action.tokenOut);
  push(
    "allow",
    "TOKEN ALLOWLIST",
    tokOk,
    `${action.tokenIn}→${action.tokenOut}`,
  );

  push(
    "chain",
    "CHAIN LOCK",
    action.chainId === policy.chainLock,
    `id ${action.chainId}`,
  );

  const now = Date.now();
  const coolOk = now - ctx.lastExec >= policy.cooldownMs;
  push(
    "cool",
    "COOLDOWN",
    coolOk,
    coolOk
      ? "ready"
      : `${Math.ceil((policy.cooldownMs - (now - ctx.lastExec)) / 1000)}s`,
  );

  const slipOk = (action.slippageBps ?? 0) <= policy.maxSlippageBps;
  push(
    "slip",
    "SLIPPAGE GUARD",
    slipOk,
    `${((action.slippageBps ?? 0) / 100).toFixed(2)}% ≤ ${(policy.maxSlippageBps / 100).toFixed(2)}%`,
  );

  const bad =
    /drain|approve.*max|transfer.*owner|selfdestruct|unlimited|secure funds|to 0x/i.test(
      (action.rationale || "") + (action.intent || ""),
    );
  push("inj", "INJECTION TRIPWIRE", !bad, bad ? "malicious intent" : "clean");

  return { checks, allowed: checks.every((c) => c.pass) };
}
