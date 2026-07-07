# Submission — BOT Chain Builder Challenge #1

**Deadline:** Jul 8, 2026, 23:59 UTC+8

## Two required actions
- [ ] X showcase tweet tagging **@BOTChain_ai** (draft in `docs/X-post.md`)
- [ ] Submission form: https://forms.gle/ZEU6B4SDXvZAjs9T8

## Project fields
| Field | Value |
|---|---|
| Project name | **Warden** |
| Track | **AI Agent** |
| Summary | A gasless, policy-gated agent firewall on BOT Chain. An autonomous agent proposes on-chain actions; a seven-policy firewall (`WardenGuard`) screens each one on-chain before any signature exists; approved actions execute gaslessly via the EOA Paymaster; every decision is recorded as an on-chain `Decision` event. |
| Demo video | `<VIDEO_LINK>` |
| Live demo | `<OPTIONAL_HOSTED_URL>` |
| GitHub repo | `<GITHUB_LINK>` |
| Contract address | `<GUARD_ADDRESS>` (from `npm run deploy`) |
| Tx hash / on-chain proof | `<SCREEN_TX_HASH>` (from `npm run screen`) |
| Technical write-up | see below |
| Next steps | see below |
| X showcase link | `<TWEET_LINK>` |

## Technical write-up (paste-ready)
Warden addresses the biggest open risk in autonomous on-chain agents: a compromised
or prompt-injected agent signing a harmful transaction. Instead of trusting the
model, Warden puts the trust boundary on-chain. `WardenGuard` custodies the agent's
session budget and is the only path the agent can move value through. Each proposed
action is screened against a per-tx cap, a rolling 24h budget, a destination
allowlist, a cooldown, and a slippage ceiling — enforced in the contract, not the
UI. Approved actions execute gaslessly through the EOA Paymaster (`pm_isSponsorable`),
so the end user never holds gas. Every decision, allowed or refused, is emitted as a
`Decision` event, giving a tamper-evident on-chain audit trail (blocked attempts are
recorded, not reverted, so nothing is lost). The frontend is an institutional risk
terminal where you can watch the agent reason, screen, and — on the INJECT button —
get its malicious signature withheld in real time.

**BOT Chain integration:** native EOA Paymaster for gasless execution, deployed and
verified on chain 968, on-chain policy enforcement + audit events as the core
mechanism (not a cosmetic deploy).

## Next steps
- Wire the frontend "execute" path to the live `WardenGuard` + route via the paymaster.
- Anchor decision batches to the Blob API for cheaper long-term audit storage.
- ERC-20 support (token allowlist) alongside native value.
- Multi-agent sessions with per-agent budgets.

## Stacked bounty submissions (independent prize category)
Filed separately via the Bounty form — see `docs/bounties/`:
1. Stale block explorer state
2. Advertised vs measured block time
3. EOA Paymaster `pm_isSponsorable` / `gm_sponsorable` doc contradiction

## Pre-submit checklist
- [ ] Testnet confirmed live (faucet tx lands on scan.bohr.life)
- [ ] `npm run test` passes
- [ ] Deployed; `GUARD_ADDRESS` saved
- [ ] `npm run screen` produced a verifiable tx hash
- [ ] Demo video recorded (RUN + INJECT)
- [ ] Tweet posted, tagging @BOTChain_ai
- [ ] Form submitted
