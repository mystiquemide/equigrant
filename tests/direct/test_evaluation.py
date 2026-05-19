import json

from helpers import address_text


CONTRACT = "contracts/equigrant.py"
FUTURE_DEADLINE = "2027-12-31T23:59:59Z"


def setup_submission(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = contract.create_bounty(
        "Build an open source project with clear value proposition and tests",
        5000,
        FUTURE_DEADLINE,
        5,
    )

    direct_vm.sender = direct_bob
    submission_id = contract.submit_work(
        bounty_id,
        ["https://github.com/user/repo"],
        "https://demo.example.com",
        "Built a fully functional project with documentation and tests.",
    )
    return contract, bounty_id, submission_id


def mock_successful_ai(direct_vm):
    direct_vm.mock_web(
        r".*github\.com/user/repo.*",
        {"status": 200, "body": "README, source code, tests, and deployment notes"},
    )
    direct_vm.mock_llm(
        r".*substantial plagiarism.*",
        json.dumps(
            {
                "plagiarism_flag": False,
                "originality_score": 91,
                "evidence": "No substantial copying detected.",
                "sources": [],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*expert grant evaluator.*",
        json.dumps(
            {
                "score": 88,
                "reasoning": "Strong match against criteria with clear implementation and tests.",
                "passed": True,
                "plagiarism_flag": False,
            }
        ),
    )


def mock_failed_ai(direct_vm):
    direct_vm.mock_web(
        r".*github\.com/user/repo.*",
        {"status": 200, "body": "Small prototype with limited implementation"},
    )
    direct_vm.mock_llm(
        r".*substantial plagiarism.*",
        json.dumps(
            {
                "plagiarism_flag": False,
                "originality_score": 75,
                "evidence": "No substantial copying detected.",
                "sources": [],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*expert grant evaluator.*",
        json.dumps(
            {
                "score": 41,
                "reasoning": "The submission is incomplete and does not satisfy the main criteria.",
                "passed": False,
                "plagiarism_flag": False,
            }
        ),
    )


def test_evaluation_successful(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract, bounty_id, submission_id = setup_submission(direct_deploy, direct_vm, direct_alice, direct_bob)
    mock_successful_ai(direct_vm)

    contract.evaluate(bounty_id, submission_id)
    result = contract.get_evaluation(bounty_id, submission_id)

    assert result["score"] == 88
    assert result["passed"] is True
    assert result["plagiarism_flag"] is False
    assert result["consensus_reached"] is True
    assert direct_vm.run_validator() is True


def test_appeal_flow_for_failed_submission(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract, bounty_id, submission_id = setup_submission(direct_deploy, direct_vm, direct_alice, direct_bob)
    mock_failed_ai(direct_vm)

    contract.evaluate(bounty_id, submission_id)

    direct_vm.sender = direct_bob
    contract.appeal(
        bounty_id,
        submission_id,
        "The evaluation did not properly consider the submitted documentation and test coverage.",
    )

    appeal = contract.get_appeal(bounty_id, submission_id)
    assert appeal["status"] == "pending"
    assert appeal["appellant"].lower() == address_text(direct_bob).lower()


def test_plagiarism_forces_failure(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract, bounty_id, submission_id = setup_submission(direct_deploy, direct_vm, direct_alice, direct_bob)
    direct_vm.mock_web(
        r".*github\.com/user/repo.*",
        {"status": 200, "body": "Copied source code"},
    )
    direct_vm.mock_llm(
        r".*substantial plagiarism.*",
        json.dumps(
            {
                "plagiarism_flag": True,
                "originality_score": 12,
                "evidence": "Substantial copying detected.",
                "sources": ["https://github.com/original/project"],
            }
        ),
    )
    direct_vm.mock_llm(
        r".*expert grant evaluator.*",
        json.dumps(
            {
                "score": 90,
                "reasoning": "Technically complete but originality check failed.",
                "passed": True,
                "plagiarism_flag": False,
            }
        ),
    )

    contract.evaluate(bounty_id, submission_id)
    result = contract.get_evaluation(bounty_id, submission_id)

    assert result["score"] == 90
    assert result["plagiarism_flag"] is True
    assert result["passed"] is False
