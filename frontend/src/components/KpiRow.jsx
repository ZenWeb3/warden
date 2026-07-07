import { POLICY } from "../config";
import { fmt } from "../lib/utils";

function Kpi({ code, k, v, sub, tone }) {
  return (
    <div className={`kpi ${tone}`}>
      <span className="kpi-code mono">{code}</span>
      <span className="kpi-v mono">{v}</span>
      <span className="kpi-k">{k}</span>
      <span className="kpi-sub">{sub}</span>
    </div>
  );
}

export default function KpiRow({ executed, blocked, spentToday, pct, sigStatus, proposal, policy = POLICY }) {
  return (
    <div className="kpis rise" style={{ animationDelay: ".14s" }}>
      <Kpi code="01" k="SPONSORED" v={executed} sub="passed all 7" tone="ok" />
      <Kpi code="02" k="WITHHELD" v={blocked} sub="signature denied" tone="no" />
      <Kpi code="03" k="USER GAS" v="0.00" sub="paymaster-sponsored" tone="dim" />
      <Kpi code="04" k="SESSION SPEND" v={fmt(spentToday)} sub={`of ${policy.dailyCap} tBOT cap`} tone={pct > 80 ? "no" : "dim"} />
      <Kpi code="05" k="SIG STATUS" v={sigStatus} sub={proposal?.action?.live === false ? "sim engine" : "agent"}
        tone={sigStatus === "WITHHELD" ? "no" : sigStatus === "SIGNED" ? "ok" : "amber"} />
    </div>
  );
}