# Documentation Bug — EOA Paymaster RPC method name contradiction

**Category:** Documentation Improvement
**Severity:** Medium (breaks integration on first attempt)

## Description
The EOA Paymaster documentation is internally inconsistent about the sponsorship
check method. The method is defined as `pm_isSponsorable`, but the Wallet
Integration steps instruct developers to call `gm_sponsorable`. A developer copying
the integration steps verbatim will call a non-existent method and fail to get
gasless transactions working.

## Steps to reproduce
1. Open the EOA Paymaster page in the developer docs.
2. Note the method is specified as `pm_isSponsorable` in the method reference.
3. Note the Wallet Integration section says to call `gm_sponsorable`.
4. The two names disagree.

## Scope of impact
Every developer integrating gasless transactions via the paymaster — a headline
feature. First-attempt integration failure with no obvious cause.

## Proposed solution
Standardize on `pm_isSponsorable` throughout the docs (or whichever the node
actually exposes) and correct the Wallet Integration snippet. Add a minimal working
request/response example.

## Contact
- X: @zenonchain
- Wallet: <YOUR_WALLET>
