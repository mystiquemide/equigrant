# Integration tests for full EquiGrant consensus flow
# Run against GenLayer Bradbury testnet with "genlayer test integration"
#
# IMPORTANT: These tests require:
#   - A funded GEN account on Bradbury testnet
#   - The contract deployed to testnet
#   - Validator nodes running on the network

from genlayer import *

# Contract address — update after deployment
CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"


def test_full_create_submit_evaluate_flow():
    """End-to-end: create bounty, submit work, evaluate, resolve."""
    contract = gl.get_contract_at(Address(CONTRACT_ADDRESS))

    # 1. Create a bounty
    bid = contract.view().create_bounty(
        criteria=(
            "Build an open-source Web3 analytics dashboard that displays "
            "real-time on-chain metrics including transaction volume, "
            "active wallets, and gas usage patterns."
        ),
        reward_pool=u256(1000),
        deadline="2027-06-15T23:59:59Z",
        min_stake=u256(5),
    )
    assert bid is not None, "Failed to create bounty"
    print(f"[PASS] Bounty created: {bid}")

    # 2. Get bounty details
    bounty = contract.view().get_bounty(bid)
    assert bounty["status"] == "active", f"Expected active, got {bounty['status']}"
    print(f"[PASS] Bounty status: {bounty['status']}")

    # 3. Submit work
    sid = contract.view().submit_work(
        bounty_id=bid,
        github_urls=DynArray(["https://github.com/example/web3-analytics"]),
        demo_url="https://web3-analytics-demo.vercel.app",
        description=(
            "Built a fully functional analytics dashboard with real-time "
            "WebSocket updates, support for multiple EVM chains, and "
            "comprehensive test coverage."
        ),
    )
    assert sid is not None, "Failed to submit work"
    print(f"[PASS] Submission created: {sid}")

    # 4. Check submission appears in bounty
    submissions = contract.view().get_submissions(bid)
    assert len(submissions) >= 1, "No submissions found"
    print(f"[PASS] Submissions count: {len(submissions)}")

    # 5. Trigger evaluation (this runs LLM consensus!)
    print("[INFO] Evaluating submission — this may take 30-60 seconds...")
    contract.view().evaluate(bid, sid)

    # 6. Get evaluation results
    result = contract.view().get_evaluation(bid, sid)
    assert result is not None, "No evaluation result"
    print(f"[PASS] Score: {result['score']}")
    print(f"[PASS] Passed: {result['passed']}")
    print(f"[PASS] Plagiarism: {result['plagiarism_flag']}")
    print(f"[PASS] Reasoning: {result['reasoning'][:100]}...")


def test_appeal_flow():
    """Test the full appeal flow."""
    contract = gl.get_contract_at(Address(CONTRACT_ADDRESS))

    # Create + submit + evaluate
    bid = contract.view().create_bounty(
        criteria="Build a simple utility library that solves a real developer problem",
        reward_pool=u256(500),
        deadline="2027-12-31T23:59:59Z",
        min_stake=u256(2),
    )
    sid = contract.view().submit_work(
        bounty_id=bid,
        github_urls=DynArray(["https://github.com/example/utility-lib"]),
        demo_url="",
        description="A well-documented utility library with extensive test coverage",
    )
    contract.view().evaluate(bid, sid)
    result = contract.view().get_evaluation(bid, sid)

    if not result["passed"]:
        print("[INFO] Submission failed — testing appeal flow...")
        contract.view().appeal(
            bid,
            sid,
            reason="The evaluation did not properly account for the comprehensive documentation and test coverage",
        )
        appeal = contract.view().get_appeal(bid, sid)
        assert appeal["status"] != "resolved", "Appeal should be pending or re-evaluating"
        print(f"[PASS] Appeal status: {appeal['status']}")
    else:
        print("[INFO] Submission passed — skipping appeal test")
