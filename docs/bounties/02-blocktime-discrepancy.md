# Product Feedback — Advertised block time does not match measured block time

**Category:** Documentation / Product Feedback
**Severity:** Medium

## Description
Marketing on https://www.botchain.ai/ states ~0.75s block times and sub-second
finality. The public explorer, however, reports an average block time of ~14.3s.
The two figures contradict each other, which undermines the performance claims a
developer would build against.

## Steps to reproduce
1. Read the block-time / finality claim on https://www.botchain.ai/
2. Open https://scan.botchain.ai and read the reported average block time.
3. Compare: ~0.75s (claim) vs ~14.3s (explorer).

## Scope of impact
Anyone sizing latency-sensitive UX (agents, trading, real-time apps) against the
advertised numbers. Also a credibility issue for the pitch.

## Proposed solution
Reconcile the figures: publish the measured mainnet/testnet block time, and if 0.75s
is a target or testnet-only number, label it as such. Ideally surface a live
"current avg block time" metric sourced from the node.

## Contact
- X: @zenonchain
- Wallet: <YOUR_WALLET>
