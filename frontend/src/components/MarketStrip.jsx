import { useState, useEffect } from "react";
import { fmt } from "../lib/utils";

const INSTR = [
  { s: "WBOT", p: 2.41, v: 0.06 },
  { s: "wETH", p: 3418, v: 42 },
  { s: "USDC", p: 1.0, v: 0.001 },
];

export default function MarketStrip() {
  const [series, setSeries] = useState(() =>
    INSTR.map((i) => ({ ...i, hist: Array.from({ length: 44 }, () => i.p) }))
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSeries((prev) =>
        prev.map((i) => {
          const last = i.hist[i.hist.length - 1];
          const next = Math.max(i.p * 0.9, Math.min(i.p * 1.1, last + (Math.random() - 0.5) * i.v));
          return { ...i, hist: [...i.hist.slice(1), +next.toFixed(i.p > 100 ? 1 : 3)] };
        })
      );
    }, 1100);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="market rise" style={{ animationDelay: ".08s" }}>
      <span className="mk-lbl">B&nbsp;DEX&nbsp;·&nbsp;LIVE</span>
      {series.map((i) => {
        const first = i.hist[0];
        const last = i.hist[i.hist.length - 1];
        const d = ((last - first) / first) * 100;
        const up = d >= 0;
        const min = Math.min(...i.hist);
        const max = Math.max(...i.hist);
        const rng = max - min || 1;
        const pts = i.hist
          .map((v, idx) => `${(idx / (i.hist.length - 1)) * 100},${26 - ((v - min) / rng) * 22 - 2}`)
          .join(" ");
        return (
          <div className="mk" key={i.s}>
            <span className="mk-s">{i.s}</span>
            <svg className="mk-spark" viewBox="0 0 100 28" preserveAspectRatio="none">
              <polyline points={pts} fill="none" stroke={up ? "var(--ok)" : "var(--no)"}
                strokeWidth="1.2" vectorEffect="non-scaling-stroke" opacity="0.85" />
            </svg>
            <span className="mk-p mono">{fmt(last)}</span>
            <span className={`mk-d mono ${up ? "u" : "dn"}`}>{up ? "+" : ""}{d.toFixed(2)}%</span>
          </div>
        );
      })}
    </div>
  );
}
