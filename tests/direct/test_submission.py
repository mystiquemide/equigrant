CONTRACT = "contracts/equigrant.py"
FUTURE_DEADLINE = "2027-12-31T23:59:59Z"


def create_bounty(contract):
    return contract.create_bounty(
        "Build an analytics dashboard with metrics, reporting, and documentation",
        5000,
        FUTURE_DEADLINE,
        10,
    )


def test_submit_valid(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    submission_id = contract.submit_work(
        bounty_id,
        ["https://github.com/user/repo"],
        "https://demo.example.com",
        "Built an analytics dashboard with real-time metrics, charts, and documentation.",
    )

    submissions = contract.get_submissions(bounty_id)

    assert submission_id == "submission_0"
    assert len(submissions) == 1
    assert submissions[0]["status"] == "submitted"
    assert submissions[0]["submitter"] == str(direct_bob)


def test_submit_rejects_empty_github_urls(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("GitHub URL"):
        contract.submit_work(
            bounty_id,
            [],
            "",
            "A sufficient description with enough detail for testing.",
        )


def test_submit_rejects_invalid_github_url(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Invalid GitHub URL"):
        contract.submit_work(
            bounty_id,
            ["https://example.com/not-github"],
            "",
            "A sufficient description with enough detail for testing.",
        )


def test_submit_rejects_short_description(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Description too short"):
        contract.submit_work(
            bounty_id,
            ["https://github.com/user/repo"],
            "",
            "Short",
        )


def test_submit_rejects_duplicate_submitter(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    contract.submit_work(
        bounty_id,
        ["https://github.com/user/repo"],
        "",
        "A complete project submission with adequate description length.",
    )

    with direct_vm.expect_revert("already submitted"):
        contract.submit_work(
            bounty_id,
            ["https://github.com/user/repo-two"],
            "",
            "Another complete project submission with adequate description length.",
        )


def test_get_submitter_submissions(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = direct_deploy(CONTRACT)
    bounty_id = create_bounty(contract)

    direct_vm.sender = direct_bob
    contract.submit_work(
        bounty_id,
        ["https://github.com/user/repo"],
        "",
        "A well-built submission with enough detail for consideration.",
    )

    submissions = contract.get_submitter_submissions(str(direct_bob).lower())
    assert len(submissions) == 1
    assert submissions[0]["bounty_id"] == bounty_id
