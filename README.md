# Warden

**A gasless, policy-gated firewall for autonomous on-chain agents — enforced on BOT Chain, not in a prompt.**

BOT Chain Builder Challenge #1 · AI Agent track

An LLM agent can *propose* an on-chain action. It can never sign one on its own.
Every proposed action is screened by `WardenGuard` — six policies, checked in the
EVM, before a signature exists. Actions that pass execute gaslessly through the EOA
Paymaster; actions that fail are refused and recorded, not just rejected client-side.
Every decision, allowed or blocked, is written on-chain as a `Decision` event — a
tamper-evident audit tape. The trust boundary is the chain, not the model.

## Why

Prompt injection, jailbreaks, and compromised tool outputs are all ways to make an
agent *want* to do something harmful. Warden doesn't try to make the agent immune to
that — it makes the wanting irrelevant. The agent never holds a key that can move
value unilaterally; it can only call `screenAndExecute`, and the contract — not the
agent, not the frontend — decides whether the action happens.

## How it works

```
 agent (LLM)  ──proposes──▶  WardenGuard.screenAndExecute(dest, amount, data, slippageBps, intentHash)
                                 │
                                 │  on-chain policy screen (every check enforced in the EVM):
                                 │    per-tx spend cap · rolling 24h budget · destination allowlist
                                 │    · cooldown between actions · slippage ceiling · session balance
                                 │
                                 ├─ passes ──▶ execute, gaslessly, via the EOA Paymaster
                                 │             emit Decision(allowed=true)
                                 │
                                 └─ fails ───▶ funds don't move, call does NOT revert
                                               emit Decision(allowed=false, reason)
```

Refusals are **recorded, not reverted** — a hard revert would enforce the policy but
throw away the log of the attempt (reverted transactions emit no persistent events).
Refuse-and-record keeps both guarantees: value can never move against policy, and
every attempt — allowed or blocked — stays on the permanent chain history. Only
access-control failures (a non-agent caller) revert.

## Repo layout

```
warden/
├── contracts/                Hardhat project
│   ├── contracts/WardenGuard.sol   the firewall
│   ├── scripts/deploy.ts           deploy + seed a session
│   ├── scripts/screen.ts           produce a real screened tx (+ screen:inject for a blocked one)
│   ├── scripts/rotate-agent.ts     rotate the session key without redeploying
│   └── test/WardenGuard.test.ts
├── frontend/                  Vite + React "institutional terminal" demo UI
│   └── src/Warden.jsx
└── docs/                      Submission checklist, bounty reports, X-post draft
```

## Quickstart

**1. Frontend (instant demo, no wallet needed)**
```bash
cd frontend && npm install && cp .env.example .env
npm run dev
```
Open http://localhost:5173 — click **RUN AGENT** for an in-policy action cleared
gaslessly, then **INJECT** to watch a malicious instruction get its signature
withheld in real time.

**2. Contracts (make it real, on testnet)**
```bash
cd contracts && npm install && cp .env.example .env   # fill PRIVATE_KEY
# fund the deployer from https://faucet.botchain.ai/basic
npm run compile && npm run test
npm run deploy            # prints GUARD_ADDRESS — save it to .env
npm run screen            # one honest action → allowed Decision + tx hash
npm run screen:inject     # one over-cap "attack" → refused Decision, funds untouched
```

Both produce an explorer link (`https://scan.bohr.life/tx/<hash>`) — that tx hash
and `GUARD_ADDRESS` are the on-chain proof for submission.

## Policy model

`WardenGuard` custodies the agent's session funds and is the **only** path the agent
can move value through. Each proposed action is checked against:

| Policy | Enforced as |
|---|---|
| Per-tx spend cap | `amount <= policy.spendCapPerTx` |
| Rolling 24h budget | cumulative spend in the current window `<= policy.dailyCap` |
| Destination allowlist | `dest` must be explicitly allowlisted by the owner |
| Cooldown | minimum seconds between executed actions |
| Slippage ceiling | `slippageBps <= policy.maxSlippageBps` |
| Session balance | `amount <= address(this).balance` |

The owner (not the agent) controls `setPolicy`, `setAllowedDest`, `setAgent`, and
`withdraw`. The agent (a separate session key, rotatable via
`npm run rotate-agent`) can only call `screenAndExecute` — it never holds the owner
key, and in production the two should never be the same address.

## Networks

| | Testnet (`botTestnet`) | Mainnet (`botMainnet`) |
|---|---|---|
| Chain ID | 968 | 677 |
| RPC | https://rpc.bohr.life | https://rpc.botchain.ai |
| Explorer | https://scan.bohr.life | https://scan.botchain.ai |
| Native token | tBOT | BOT |
| Faucet | https://faucet.botchain.ai/basic | — |

Deploy to mainnet with `npm run deploy:mainnet` once you're ready to move real BOT —
see `contracts/README.md`.

## Status

- ✅ Contract written, compiles clean (solc 0.8.24), tested
- ✅ Frontend built (institutional terminal, live agent + deterministic fallback)
- ✅ Testnet deploy + mainnet deploy scripts, agent-rotation script
- ⬜ Wire frontend execute path to the live contract via the paymaster
- ⬜ Record demo, post tweet, submit form

See `docs/SUBMISSION.md` for the full submission checklist, `contracts/README.md`
and `frontend/README.md` for setup details specific to each half of the repo.
