// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @title WardenGuard
/// @notice On-chain policy firewall for an autonomous agent's session on BOT Chain.
/// The guard custodies the session budget (native tBOT). The agent may move value
/// ONLY through {screenAndExecute}. Every proposed action is screened on-chain
/// against a per-tx cap, a rolling 24h budget, a cooldown, a slippage ceiling and a
/// destination allowlist — and EVERY decision, allowed or refused, is recorded as a
/// {Decision} event (the on-chain audit tape).
///
/// Design note: policy violations are *recorded and refused* (funds don't move),
/// not reverted. A hard revert would enforce the cap but discard the blocked-attempt
/// log, since reverted txs emit no persistent events. Refuse-and-record keeps the
/// enforcement guarantee (value cannot move against policy) AND a complete audit
/// trail. Access-control failures (wrong caller) still revert.
contract WardenGuard {
    // ── roles ──────────────────────────────────────────────────────────────
    address public owner; // the user who owns the session and its funds
    address public agent; // the session key / agent allowed to propose actions
    bool private _locked; // reentrancy latch

    // ── policy ─────────────────────────────────────────────────────────────
    struct Policy {
        uint128 spendCapPerTx; // max value per action (wei)
        uint128 dailyCap; // max cumulative value per rolling 24h (wei)
        uint32 cooldown; // min seconds between executed actions
        uint16 maxSlippageBps; // ceiling for routed swaps (basis points)
    }
    Policy public policy;

    mapping(address => bool) public allowedDest; // e.g. B DEX router / allowlisted payees

    // ── accounting ─────────────────────────────────────────────────────────
    uint256 public spentInWindow; // value executed in the current window
    uint256 public windowStart; // start timestamp of the current 24h window
    uint256 public lastExec; // timestamp of the last executed action
    uint256 public decisionCount; // total decisions recorded (allowed + refused)

    // ── events ─────────────────────────────────────────────────────────────
    event AgentSet(address indexed agent);
    event PolicySet(
        uint128 spendCapPerTx,
        uint128 dailyCap,
        uint32 cooldown,
        uint16 maxSlippageBps
    );
    event DestAllowed(address indexed dest, bool allowed);
    event Funded(address indexed from, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event Decision(
        uint256 indexed id,
        address indexed agent,
        bool allowed,
        string reason,
        address dest,
        uint256 amount,
        uint16 slippageBps,
        bytes32 intentHash,
        uint256 timestamp
    );

    // ── errors ─────────────────────────────────────────────────────────────
    error NotOwner();
    error NotAgent();
    error Reentrancy();
    error ExecFailed();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }
    modifier nonReentrant() {
        if (_locked) revert Reentrancy();
        _locked = true;
        _;
        _locked = false;
    }

    constructor(address _agent, Policy memory _policy) {
        if (_agent == address(0)) revert ZeroAddress();
        owner = msg.sender;
        agent = _agent;
        policy = _policy;
        windowStart = block.timestamp;
        emit AgentSet(_agent);
        emit PolicySet(
            _policy.spendCapPerTx,
            _policy.dailyCap,
            _policy.cooldown,
            _policy.maxSlippageBps
        );
    }

    // ── funding ────────────────────────────────────────────────────────────
    receive() external payable {
        emit Funded(msg.sender, msg.value);
    }

    function fund() external payable {
        emit Funded(msg.sender, msg.value);
    }

    // ── admin (owner only) ─────────────────────────────────────────────────
    function setAgent(address _agent) external onlyOwner {
        if (_agent == address(0)) revert ZeroAddress();
        agent = _agent;
        emit AgentSet(_agent);
    }

    function setPolicy(Policy calldata _p) external onlyOwner {
        policy = _p;
        emit PolicySet(
            _p.spendCapPerTx,
            _p.dailyCap,
            _p.cooldown,
            _p.maxSlippageBps
        );
    }

    function setAllowedDest(address dest, bool ok) external onlyOwner {
        allowedDest[dest] = ok;
        emit DestAllowed(dest, ok);
    }

    function withdraw(address to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) revert ExecFailed();
        emit Withdrawn(to, amount);
    }

    // ── the firewall ───────────────────────────────────────────────────────
    /// @notice Screen ONE proposed action on-chain and, if it passes every policy,
    /// execute it (forward `amount` native tBOT + optional `data` to `dest`).
    /// Records a {Decision} either way. Reverts only on non-agent callers or a
    /// failed execution of an *allowed* action.
    /// @return allowed whether the action passed all policies and executed.
    function screenAndExecute(
        address dest,
        uint256 amount,
        bytes calldata data,
        uint16 slippageBps,
        bytes32 intentHash
    ) external nonReentrant returns (bool allowed) {
        if (msg.sender != agent) revert NotAgent();

        // rolling 24h window reset (computed locally; committed only on execute)
        uint256 spent = spentInWindow;
        uint256 wStart = windowStart;
        if (block.timestamp >= wStart + 1 days) {
            spent = 0;
            wStart = block.timestamp;
        }

        string memory reason = "ok";
        allowed = true;

        if (amount > policy.spendCapPerTx) {
            allowed = false;
            reason = "spend cap exceeded";
        } else if (spent + amount > policy.dailyCap) {
            allowed = false;
            reason = "daily budget exceeded";
        } else if (!allowedDest[dest]) {
            allowed = false;
            reason = "destination not allowlisted";
        } else if (block.timestamp - lastExec < policy.cooldown) {
            allowed = false;
            reason = "cooldown active";
        } else if (slippageBps > policy.maxSlippageBps) {
            allowed = false;
            reason = "slippage over ceiling";
        } else if (amount > address(this).balance) {
            allowed = false;
            reason = "insufficient session balance";
        }

        uint256 id = ++decisionCount;
        emit Decision(
            id,
            agent,
            allowed,
            reason,
            dest,
            amount,
            slippageBps,
            intentHash,
            block.timestamp
        );

        if (allowed) {
            windowStart = wStart;
            spentInWindow = spent + amount;
            lastExec = block.timestamp;
            (bool ok, ) = dest.call{value: amount}(data);
            if (!ok) revert ExecFailed();
        }
    }

    // ── views ──────────────────────────────────────────────────────────────
    function previewSpent() public view returns (uint256) {
        if (block.timestamp >= windowStart + 1 days) return 0;
        return spentInWindow;
    }

    function remainingBudget() external view returns (uint256) {
        uint256 s = previewSpent();
        return s >= policy.dailyCap ? 0 : policy.dailyCap - s;
    }

    /// @notice Off-chain preview of a decision without spending gas or moving funds.
    function canExecute(
        address dest,
        uint256 amount,
        uint16 slippageBps
    ) external view returns (bool ok_, string memory reason) {
        if (amount > policy.spendCapPerTx) return (false, "spend cap exceeded");
        if (previewSpent() + amount > policy.dailyCap)
            return (false, "daily budget exceeded");
        if (!allowedDest[dest]) return (false, "destination not allowlisted");
        if (block.timestamp - lastExec < policy.cooldown)
            return (false, "cooldown active");
        if (slippageBps > policy.maxSlippageBps)
            return (false, "slippage over ceiling");
        if (amount > address(this).balance)
            return (false, "insufficient session balance");
        return (true, "ok");
    }
}
