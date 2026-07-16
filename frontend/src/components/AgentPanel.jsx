import { POLICY } from "../config";
import PanelHeader from "./PanelHeader";

export default function AgentPanel({
  goal,
  setGoal,
  running,
  redTeam,
  onRun,
  onInject,
  coolLeft,
  policy = POLICY,
}) {
  return (
    <section className="panel rise" style={{ animationDelay: ".26s" }}>
      <PanelHeader code="A" title="AGENT · CHARTER" tag="ENFORCED" />
      <div className="pad">
        <p className="note">
          The agent pursues your goal but can never exceed the charter. The
          firewall holds the keys — not the model.
        </p>
        <table className="spec">
          <tbody>
            <tr>
              <td>spend / tx</td>
              <td className="mono r">
                ≤ {policy.spendCapPerTx.toFixed(2)} BOT
              </td>
            </tr>
            <tr>
              <td>daily budget</td>
              <td className="mono r">≤ {policy.dailyCap.toFixed(2)} BOT</td>
            </tr>
            <tr>
              <td>allowlist</td>
              <td className="mono r">{policy.allowlist.join(" · ")}</td>
            </tr>
            <tr>
              <td>chain lock</td>
              <td className="mono r">{policy.chainLock}</td>
            </tr>
            <tr>
              <td>cooldown</td>
              <td className="mono r">{policy.cooldownMs / 1000}s</td>
            </tr>
            <tr>
              <td>max slippage</td>
              <td className="mono r">{policy.maxSlippageBps / 100}%</td>
            </tr>
          </tbody>
        </table>

        <div className="lbl">
          MANDATE
          <span className="caret" />
        </div>
        <textarea
          className="goal"
          rows={3}
          value={goal}
          spellCheck={false}
          onChange={(e) => setGoal(e.target.value)}
        />

        <div className="btns">
          <button className="btn go" disabled={running} onClick={onRun}>
            {running && !redTeam ? "WORKING…" : "RUN AGENT"}
          </button>
          <button className="btn atk" disabled={running} onClick={onInject}>
            INJECT
          </button>
        </div>
        {coolLeft > 0 && (
          <div className="cool mono">
            COOLDOWN · {Math.ceil(coolLeft / 1000)}s TO NEXT SIGN
          </div>
        )}
      </div>
    </section>
  );
}
