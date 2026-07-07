import { CHAIN } from "../config";

function Tk({ k, v, live, ok }) {
  return (
    <div className="tk">
      <span className="tk-k">{k}</span>
      <span className={`tk-v mono ${ok ? "tk-ok" : ""} ${live ? "tk-live" : ""}`}>
        {live && <i className="tk-dot" />}
        {v}
      </span>
    </div>
  );
}

export default function CommandBar({ blockHeight, clock }) {
  return (
    <div className="cmd rise" style={{ animationDelay: ".02s" }}>
      <div className="cmd-l">
        <span className="mark">WARDEN</span>
        <span className="mark-sub">AGENT&nbsp;FIREWALL</span>
      </div>
      <div className="ticker">
        <Tk k="NET" v={CHAIN.name} />
        <Tk k="CHAIN" v={CHAIN.id} />
        <Tk k="BLOCK" v={`#${blockHeight.toLocaleString()}`} live />
        <Tk k="PAYMASTER" v="ONLINE" ok />
        <Tk k="RPC" v={CHAIN.rpc} />
        <Tk k="UTC" v={clock || "—"} />
      </div>
    </div>
  );
}
