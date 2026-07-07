# Warden — frontend

Institutional-terminal UI for the Warden agent firewall. An autonomous agent
proposes one on-chain action; a seven-policy firewall screens it before any
signature exists; approved actions execute gaslessly via the paymaster; every
decision lands on the audit tape.

## Run

```bash
npm install
cp .env.example .env      # add VITE_GEMINI_API_KEY (optional)
npm run dev               # http://localhost:5173
```

## The brain: Gemini

Agent reasoning runs on **Gemini** (`gemini-2.5-flash` by default) via
`src/lib/agent.js`. Set `VITE_GEMINI_API_KEY` in `.env`. With no key it falls back
to a deterministic engine, so the demo never depends on a network call on stage.
Direct browser calls expose the key in the bundle — fine for a demo; route through
a small proxy for production.

## Demo beat

- **RUN AGENT** — an in-policy trade clears the gauntlet, signed gaslessly.
- **INJECT** — an untrusted feed tells the agent to drain funds; the tripwire +
  chain-lock gates withhold the signature. The money shot.

## Structure (modular)

```
src/
├── main.jsx                entry
├── Warden.jsx              orchestrator (state + run loop only)
├── Warden.css              all styles
├── config.js               CHAIN + POLICY constants
├── lib/
│   ├── utils.js            id / format helpers
│   ├── firewall.js         evaluate() — policy engine (mirrors WardenGuard)
│   └── agent.js            think() — Gemini brain + deterministic fallback
└── components/
    ├── CommandBar.jsx      top status ticker
    ├── MarketStrip.jsx     live B DEX sparklines
    ├── KpiRow.jsx          KPI cells
    ├── BudgetAxis.jsx      session-key budget meter
    ├── PanelHeader.jsx     shared panel header
    ├── AgentPanel.jsx      panel A — charter + mandate
    ├── FirewallPanel.jsx   panel B — screening (hero)
    └── AuditTape.jsx       panel C — blob audit trail
```

## Wiring to the live contract (next step)

On-chain calls are simulated in the UI. To go live, point the "execute" path at your
deployed `WardenGuard.screenAndExecute(...)` (see `../contracts`) and route the tx
through the EOA Paymaster via `pm_isSponsorable`.
