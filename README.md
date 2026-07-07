# Warden

**A gasless, policy-gated agent firewall on BOT Chain.**
BOT Chain Builder Challenge #1 · AI Agent track.

An autonomous agent proposes on-chain actions, but it can never sign one on its own.
Every proposed action is screened against seven policies — enforced **on-chain** by
`WardenGuard` — before a signature exists. Approved actions execute **gaslessly** via
the EOA Paymaster; refused ones are recorded, not executed. Every decision lands on a
tamper-evident on-chain audit trail. The trust boundary is the chain, not the model.

## Repo layout

```
warden/
├── contracts/          Hardhat project — WardenGuard.sol, deploy + screen scripts, tests
│   ├── contracts/WardenGuard.sol
│   ├── scripts/deploy.ts
│   ├── scripts/screen.ts
│   └── test/WardenGuard.test.ts
├── frontend/           Vite + React institutional terminal (the demo UI)
│   └── src/Warden.jsx
└── docs/               Submission checklist, bounty reports, X-post draft
    ├── SUBMISSION.md
    ├── X-post.md
    └── bounties/
```

## Quickstart

**1. Frontend (instant demo)**
```bash
cd frontend && npm install && npm run dev
```
Open http://localhost:5173 — hit **RUN AGENT**, then **INJECT** to watch the firewall
withhold a malicious signature.

**2. Contracts (make it real)**
```bash
cd contracts && npm install && cp .env.example .env   # fill PRIVATE_KEY
# fund from https://faucet.botchain.ai/basic
npm run compile && npm run test
npm run deploy            # prints GUARD_ADDRESS — save it to .env
npm run screen           # produces the verifiable on-chain tx hash for submission
```

## Architecture

```
 agent (LLM)  ──proposes──▶  WardenGuard.screenAndExecute()
                                 │  on-chain policy screen:
                                 │   cap · budget · allowlist · chain · cooldown · slippage
                                 ├─ allowed ─▶ execute gaslessly (EOA Paymaster) + emit Decision
                                 └─ refused ─▶ funds held + emit Decision (blocked, logged)
```

## Network

| Chain ID | RPC | Explorer | Faucet |
|---|---|---|---|
| 968 | https://rpc.bohr.life | https://scan.bohr.life | https://faucet.botchain.ai/basic |

## Status

- ✅ Contract written, compiles clean (solc 0.8.24), tested
- ✅ Frontend built (institutional terminal, live agent + deterministic fallback)
- ⬜ Deploy to testnet + capture tx hash (`npm run deploy && npm run screen`)
- ⬜ Wire frontend execute path to live contract via paymaster
- ⬜ Record demo, post tweet, submit form

See `docs/SUBMISSION.md` for the full checklist.
