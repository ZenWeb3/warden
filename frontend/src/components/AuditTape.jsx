import { CHAIN } from "../config";
import { fmt, short } from "../lib/utils";
import PanelHeader from "./PanelHeader";

export default function AuditTape({ feed, scrollRef }) {
  return (
    <section className="panel rise" style={{ animationDelay: ".34s" }}>
      <PanelHeader code="C" title="BLOB AUDIT TAPE" tag="TAMPER-EVIDENT" tagTone="dim" />
      <div className="pad tape" ref={scrollRef}>
        {feed.length === 0 && (
          <div className="empty-sm mono">
            // no records. every decision — signed or withheld — is recorded on {CHAIN.id}.
          </div>
        )}
        {feed.map((e) => (
          <div key={e.id} className={`tape-row ${e.status}`}>
            <div className="tr-h">
              <span className={`tr-badge ${e.status}`}>{e.status === "executed" ? "SIGNED" : "WITHHELD"}</span>
              {e.injected && <span className="tr-inj">INJ</span>}
              <span className="tr-t mono">{e.time}</span>
            </div>
            <div className="tr-swap mono">{e.action.tokenIn} → {e.action.tokenOut} · {fmt(e.action.value)} tBOT</div>
            {e.status === "blocked" && e.reasons?.length > 0 && <div className="tr-why mono">✕ {e.reasons.join(" · ")}</div>}
            <div className="tr-meta mono">
              {e.tx && (
                <a href={`${CHAIN.explorer}/tx/${e.tx}`} target="_blank" rel="noreferrer">tx {short(e.tx)}</a>
              )}
              {e.blob && <span className="tr-blob">blob {short(e.blob)}</span>}
              {e.onchain && <span className="tr-gasless">ON-CHAIN</span>}
              {e.sponsored && <span className="tr-gasless">GASLESS</span>}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}