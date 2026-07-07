// Small pure helpers used across the UI.

export const hexId = (len = 64) => {
  let s = "0x";
  for (let i = 0; i < len; i++) s += "0123456789abcdef"[(Math.random() * 16) | 0];
  return s;
};

export const short = (h) => (h ? h.slice(0, 6) + "…" + h.slice(-4) : "");

export const pad2 = (n) => String(n).padStart(2, "0");

export const fmt = (n) =>
  typeof n === "number" ? n.toLocaleString(undefined, { maximumFractionDigits: 2 }) : n;
