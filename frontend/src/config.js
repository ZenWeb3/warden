// Central config — chain + firewall policy. Everything imports from here.

export const CHAIN = {
  id: 968,
  name: "BOT CHAIN TESTNET",
  rpc: "rpc.bohr.life",
  explorer: "https://scan.bohr.life",
  baseBlock: 8988736,
};

export const POLICY = {
  spendCapPerTx: 25,
  dailyCap: 60,
  allowlist: ["WBOT", "USDC", "wETH"],
  chainLock: 968,
  cooldownMs: 8000,
  maxSlippageBps: 150,
};

export const AXIS_TICKS = [0, 15, 30, 45, 60];
