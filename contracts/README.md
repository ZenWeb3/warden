# Warden — contracts

`WardenGuard.sol` is the on-chain policy firewall. It custodies the agent's session
budget (native tBOT) and is the **only** path the agent can move value through. Every
proposed action is screened on-chain against:

- per-tx spend cap
- rolling 24h daily budget
- destination allowlist
- cooldown between actions
- slippage ceiling
- session balance

…and **every decision — allowed or refused — is emitted as a `Decision` event**, the
on-chain audit tape. Policy violations are recorded and refused (funds don't move)
rather than reverted, so blocked attempts stay on the permanent log. Non-agent
callers revert.

## Setup

```bash
npm install
cp .env.example .env      # then fill PRIVATE_KEY
```

Get testnet tBOT from https://faucet.botchain.ai/basic before deploying.

## Build & test

```bash
npm run compile
npm run test              # local enforcement + logging tests
```

## Deploy to BOT Chain testnet (chain 968)

```bash
npm run deploy
```

Copy the printed `GUARD_ADDRESS` and `ALLOWED_DEST` into `.env`.

## Produce the on-chain proof for submission

```bash
npm run screen            # one honest action → SIGNED Decision + tx hash
npm run screen:inject     # one over-cap "attack" → WITHHELD Decision (funds don't move)
```

Each prints an explorer link (`https://scan.bohr.life/tx/<hash>`). Those tx hashes and
the contract address are what the submission form asks for.

## Network

| | |
|---|---|
| Chain ID | 968 |
| RPC | https://rpc.bohr.life |
| Explorer | https://scan.bohr.life |
| Faucet | https://faucet.botchain.ai/basic |

> The `ipv4first` DNS fix is baked into the scripts to avoid IPv6 routing timeouts.
