import { POLICY } from "../config";

export default function BudgetAxis({ spentToday, pct, policy = POLICY }) {
  const cap = policy.dailyCap;
  const dp = cap < 10 ? 1 : 0;
  const ticks = Array.from({ length: 5 }, (_, i) => +((cap * i) / 4).toFixed(dp));
  return (
    <div className="axis rise" style={{ animationDelay: ".2s" }}>
      <div className="axis-head">
        <span className="axis-title">SESSION-KEY BUDGET · cryptographically capped</span>
        <span className="axis-val mono">
          {spentToday.toFixed(2)}<i> / {cap.toFixed(2)} tBOT</i>
        </span>
      </div>
      <div className="axis-track">
        <div className="axis-fill" style={{ width: `${pct}%` }} />
        {ticks.map((t, i) => (
          <div key={i} className="axis-tick" style={{ left: `${(t / cap) * 100}%` }}>
            <span className="axis-num mono">{t}</span>
          </div>
        ))}
        <div className="axis-cap" />
      </div>
    </div>
  );
}