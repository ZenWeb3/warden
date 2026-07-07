# Bug Report — Block explorer serving stale chain state

**Category:** Bug Report / Product Feedback
**Severity:** High (blocks developer verification)

## Description
The mainnet block explorer at https://scan.botchain.ai renders state that is years
out of date. The latest block is timestamped several years ago and recent
transactions read as ~4 years old, while the price and activity figures appear
frozen. For a developer trying to verify a deployment or a transaction, this makes
the explorer unusable as a source of truth.

## Steps to reproduce
1. Open https://scan.botchain.ai
2. Observe the latest block timestamp (shows "~3y ago") and the most recent
   transactions (show "~4y ago").
3. Note the average block time and price fields appear static.

## Scope of impact
Every developer using the explorer to confirm a contract address or tx hash — i.e.
everyone submitting to this challenge, since the submission requires a verifiable
tx. Erodes trust in on-chain verification.

## Evidence
- URL: https://scan.botchain.ai (attach screenshot of the stale "latest block" panel)

## Proposed solution
Point the explorer's indexer at a live node / re-sync the Blockscout instance, or
clearly label whether the public explorer reflects mainnet vs a snapshot. If the
testnet explorer (scan.bohr.life) is the live one, link it prominently from the docs.

## Contact
- X: @zenonchain
- Wallet: <YOUR_WALLET>
