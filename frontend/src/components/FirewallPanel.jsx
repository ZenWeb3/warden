import { fmt, pad2 } from "../lib/utils";
import PanelHeader from "./PanelHeader";

export default function FirewallPanel({ phase, proposal, sigStatus, active }) {
  return (
    <section className={`panel hero rise ${active ? "hot" : ""}`} style={{ animationDelay: ".3s" }}>
      <PanelHeader
        code="B"
        title="FIREWALL · SCREENING"
        tag={sigStatus}
        tagTone={sigStatus === "WITHHELD" ? "no" : sigStatus === "SIGNED" ? "ok" : "amber"}
      />
      <div className="pad stage">
        {!proposal && phase === "idle" && (
          <div className="empty">
            <div className="empty-mono">// awaiting proposal</div>
            <p>The agent proposes one action. Every proposal is screened against seven policies here before a signature is ever produced.</p>
          </div>
        )}

        {phase === "thinking" && (
          <div className="empty think">
            <div className="scan" />
            <div className="empty-mono">reasoning over market snapshot<span className="dots"><i>.</i><i>.</i><i>.</i></span></div>
          </div>
        )}

        {proposal && (
          <>
            <div className={`rec ${proposal.injected ? "danger" : ""}`}>
              {proposal.injected && <span className="rec-flag">UNTRUSTED FEED INJECTED</span>}
              <div className="rec-row">
                <span className="rec-k">PROPOSED</span>
                <span className="rec-swap mono">{proposal.action.tokenIn} → {proposal.action.tokenOut}</span>
                <span className="rec-amt mono">{fmt(proposal.action.value)} BOT</span>
              </div>
              <div className="rec-row sub">
                <span className="rec-k">PARAMS</span>
                <span className="mono dim">
                  chain {proposal.action.chainId} · slip {((proposal.action.slippageBps ?? 0) / 100).toFixed(2)}% · {proposal.action.live ? "live" : "sim"}
                </span>
              </div>
              <p className="rec-r">“{proposal.action.rationale || proposal.action.intent}”</p>
            </div>

            <div className={`checks ${phase === "screening" ? "screening" : ""}`}>
              {phase === "screening" && <div className="beam" />}
              {proposal.verdict.checks.map((c, i) => (
                <div key={c.id} className={`chk ${c.pass ? "ok" : "no"}`} style={{ animationDelay: `${i * 0.08}s` }}>
                  <span className="chk-i mono">{pad2(i + 1)}</span>
                  <span className="chk-g">{c.pass ? "PASS" : "BLOCK"}</span>
                  <span className="chk-l">{c.label}</span>
                  <span className="chk-d mono">{c.detail}</span>
                </div>
              ))}
            </div>

            {phase === "done" && (
              <div className={`verdict ${proposal.verdict.allowed ? "pass" : "fail"}`}>
                <div className="v-l">
                  <span className="v-status mono">{proposal.verdict.allowed ? "SIGNED · GASLESS" : "SIGNATURE WITHHELD"}</span>
                  <span className="v-sub mono">
                    {proposal.verdict.allowed
                      ? "pm_isSponsorable → true · user paid 0 gas"
                      : `${proposal.verdict.checks.filter((c) => !c.pass).length} policy violation(s) · no signature produced`}
                  </span>
                </div>
                <span className="v-mark">{proposal.verdict.allowed ? "✓" : "✕"}</span>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
