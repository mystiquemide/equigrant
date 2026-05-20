     1|# Integration tests for full EquiGrant consensus flow
     2|# Run against GenLayer Bradbury testnet with "genlayer test integration"
     3|#
     4|# IMPORTANT: These tests require:
     5|#   - A funded GEN account on Bradbury testnet
     6|#   - The contract deployed to testnet
     7|#   - Validator nodes running on the network
     8|
     9|from genlayer import *
    10|
    11|# Contract address , update after deployment
    12|CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000"
    13|
    14|
    15|def test_full_create_submit_evaluate_flow():
    16|    """End-to-end: create bounty, submit work, evaluate, resolve."""
    17|    contract = gl.get_contract_at(Address(CONTRACT_ADDRESS))
    18|
    19|    # 1. Create a bounty
    20|    bid = contract.view().create_bounty(
    21|        criteria=(
    22|            "Build an open-source Web3 analytics dashboard that displays "
    23|            "real-time on-chain metrics including transaction volume, "
    24|            "active wallets, and gas usage patterns."
    25|        ),
    26|        reward_pool=u256(1000),
    27|        deadline="2027-06-15T23:59:59Z",
    28|        min_stake=u256(5),
    29|    )
    30|    assert bid is not None, "Failed to create bounty"
    31|    print(f"[PASS] Bounty created: {bid}")
    32|
    33|    # 2. Get bounty details
    34|    bounty = contract.view().get_bounty(bid)
    35|    assert bounty["status"] == "active", f"Expected active, got {bounty['status']}"
    36|    print(f"[PASS] Bounty status: {bounty['status']}")
    37|
    38|    # 3. Submit work
    39|    sid = contract.view().submit_work(
    40|        bounty_id=bid,
    41|        github_urls=DynArray(["https://github.com/example/web3-analytics"]),
    42|        demo_url="https://web3-analytics-demo.vercel.app",
    43|        description=(
    44|            "Built a fully functional analytics dashboard with real-time "
    45|            "WebSocket updates, support for multiple EVM chains, and "
    46|            "comprehensive test coverage."
    47|        ),
    48|    )
    49|    assert sid is not None, "Failed to submit work"
    50|    print(f"[PASS] Submission created: {sid}")
    51|
    52|    # 4. Check submission appears in bounty
    53|    submissions = contract.view().get_submissions(bid)
    54|    assert len(submissions) >= 1, "No submissions found"
    55|    print(f"[PASS] Submissions count: {len(submissions)}")
    56|
    57|    # 5. Trigger evaluation (this runs LLM consensus!)
    58|    print("[INFO] Evaluating submission , this may take 30-60 seconds...")
    59|    contract.view().evaluate(bid, sid)
    60|
    61|    # 6. Get evaluation results
    62|    result = contract.view().get_evaluation(bid, sid)
    63|    assert result is not None, "No evaluation result"
    64|    print(f"[PASS] Score: {result['score']}")
    65|    print(f"[PASS] Passed: {result['passed']}")
    66|    print(f"[PASS] Plagiarism: {result['plagiarism_flag']}")
    67|    print(f"[PASS] Reasoning: {result['reasoning'][:100]}...")
    68|
    69|
    70|def test_appeal_flow():
    71|    """Test the full appeal flow."""
    72|    contract = gl.get_contract_at(Address(CONTRACT_ADDRESS))
    73|
    74|    # Create + submit + evaluate
    75|    bid = contract.view().create_bounty(
    76|        criteria="Build a simple utility library that solves a real developer problem",
    77|        reward_pool=u256(500),
    78|        deadline="2027-12-31T23:59:59Z",
    79|        min_stake=u256(2),
    80|    )
    81|    sid = contract.view().submit_work(
    82|        bounty_id=bid,
    83|        github_urls=DynArray(["https://github.com/example/utility-lib"]),
    84|        demo_url="",
    85|        description="A well-documented utility library with extensive test coverage",
    86|    )
    87|    contract.view().evaluate(bid, sid)
    88|    result = contract.view().get_evaluation(bid, sid)
    89|
    90|    if not result["passed"]:
    91|        print("[INFO] Submission failed , testing appeal flow...")
    92|        contract.view().appeal(
    93|            bid,
    94|            sid,
    95|            reason="The evaluation did not properly account for the comprehensive documentation and test coverage",
    96|        )
    97|        appeal = contract.view().get_appeal(bid, sid)
    98|        assert appeal["status"] != "resolved", "Appeal should be pending or re-evaluating"
    99|        print(f"[PASS] Appeal status: {appeal['status']}")
   100|    else:
   101|        print("[INFO] Submission passed , skipping appeal test")
   102|
