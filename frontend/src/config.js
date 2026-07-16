// Central config — chain + firewall policy. Everything imports from here.

export const CHAIN = {
  id: 677,
  name: "BOT CHAIN",
  rpc: "rpc.botchain.ai",
  explorer: "https://scan.botchain.ai",
  baseBlock: 16311786,
};

export const POLICY = {
  spendCapPerTx: 25,
  dailyCap: 60,
  allowlist: ["WBOT", "USDC", "wETH"],
  chainLock: 677,
  cooldownMs: 8000,
  maxSlippageBps: 150,
};

export const AXIS_TICKS = [0, 15, 30, 45, 60];
