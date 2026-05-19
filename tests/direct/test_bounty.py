CONTRACT = "contracts/equigrant.py"
FUTURE_DEADLINE = "2027-12-31T23:59:59Z"


def deploy(direct_deploy):
    return direct_deploy(CONTRACT)


def test_create_bounty_valid(direct_deploy, direct_alice):
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build an open-source analytics dashboard for Web3 grant teams",
        5000,
        FUTURE_DEADLINE,
        10,
    )

    bounty = contract.get_bounty(bounty_id)

    assert bounty_id == "bounty_0"
    assert bounty["status"] == "active"
    assert bounty["creator"] == str(direct_alice) or bounty["creator"]
    assert bounty["reward_pool"] == "5000"
    assert bounty["remaining_pool"] == "5000"
    assert bounty["min_stake"] == "10"
    assert contract.get_bounty_count() == "1"


def test_create_bounty_rejects_empty_criteria(direct_deploy, direct_vm):
    contract = deploy(direct_deploy)

    with direct_vm.expect_revert("Criteria"):
        contract.create_bounty("", 5000, FUTURE_DEADLINE, 10)


def test_create_bounty_rejects_zero_reward(direct_deploy, direct_vm):
    contract = deploy(direct_deploy)

    with direct_vm.expect_revert("Reward pool"):
        contract.create_bounty(
            "Build something useful with enough detail for validation",
            0,
            FUTURE_DEADLINE,
            10,
        )


def test_create_bounty_rejects_zero_stake(direct_deploy, direct_vm):
    contract = deploy(direct_deploy)

    with direct_vm.expect_revert("Minimum stake"):
        contract.create_bounty(
            "Build something useful with enough detail for validation",
            1000,
            FUTURE_DEADLINE,
            0,
        )


def test_get_active_bounties_and_creator_filter(direct_deploy, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)

    contract.create_bounty(
        "Build bounty one with enough detail for testing active listings",
        1000,
        FUTURE_DEADLINE,
        5,
    )
    contract.create_bounty(
        "Build bounty two with enough detail for testing creator listings",
        2000,
        FUTURE_DEADLINE,
        7,
    )

    active = contract.get_active_bounties()
    creator_bounties = contract.get_creator_bounties(str(direct_alice).lower())

    assert len(active) == 2
    assert len(creator_bounties) == 2
    assert contract.get_bounty_count() == "2"


def test_delete_bounty_hides_from_active_list(direct_deploy, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)

    bounty_id = contract.create_bounty(
        "Build a temporary bounty that can be safely deleted",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    contract.delete_bounty(bounty_id)

    bounty = contract.get_bounty(bounty_id)
    active = contract.get_active_bounties()
    creator_bounties = contract.get_creator_bounties(str(direct_alice).lower())

    assert bounty["status"] == "deleted"
    assert active == []
    assert creator_bounties[0]["status"] == "deleted"


def test_delete_bounty_rejects_non_creator(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a creator-owned bounty that another wallet cannot delete",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the grant creator can delete"):
        contract.delete_bounty(bounty_id)


def test_delete_bounty_rejects_existing_submissions(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty that cannot be deleted after builders submit",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    direct_vm.sender = direct_bob
    contract.submit_work(
        bounty_id,
        ["https://github.com/example/equigrant-submission"],
        "https://demo.example.com",
        "This is a complete submission with enough detail for deletion protection testing.",
    )

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Bounties with submissions cannot be deleted"):
        contract.delete_bounty(bounty_id)


def test_pause_and_resume_bounty(direct_deploy, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty that can be paused and resumed by the creator",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    contract.pause_bounty(bounty_id)
    paused = contract.get_bounty(bounty_id)
    active = contract.get_active_bounties()

    assert paused["status"] == "paused"
    assert active == []

    contract.resume_bounty(bounty_id)
    resumed = contract.get_bounty(bounty_id)
    active_again = contract.get_active_bounties()

    assert resumed["status"] == "active"
    assert len(active_again) == 1


def test_pause_bounty_rejects_non_creator(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty that another wallet cannot pause",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    direct_vm.sender = direct_bob
    with direct_vm.expect_revert("Only the grant creator can pause"):
        contract.pause_bounty(bounty_id)


def test_extend_deadline(direct_deploy, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty with an extendable deadline",
        1000,
        "2027-06-30T23:59:59Z",
        5,
    )

    contract.extend_deadline(bounty_id, FUTURE_DEADLINE)
    bounty = contract.get_bounty(bounty_id)

    assert bounty["deadline"] == FUTURE_DEADLINE


def test_extend_deadline_rejects_earlier_deadline(direct_deploy, direct_vm):
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty with protected deadline extension rules",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    with direct_vm.expect_revert("New deadline must be after current deadline"):
        contract.extend_deadline(bounty_id, "2027-01-01T00:00:00Z")


def test_edit_bounty_terms(direct_deploy, direct_vm, direct_alice):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty that can be edited before submissions",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    contract.edit_bounty(
        bounty_id,
        "Build updated bounty criteria before any builder has submitted",
        1500,
        8,
    )
    bounty = contract.get_bounty(bounty_id)

    assert bounty["criteria"] == "Build updated bounty criteria before any builder has submitted"
    assert bounty["reward_pool"] == "1500"
    assert bounty["remaining_pool"] == "1500"
    assert bounty["min_stake"] == "8"


def test_edit_bounty_rejects_existing_submissions(direct_deploy, direct_vm, direct_alice, direct_bob):
    direct_vm.sender = direct_alice
    contract = deploy(direct_deploy)
    bounty_id = contract.create_bounty(
        "Build a bounty that cannot be edited after submissions",
        1000,
        FUTURE_DEADLINE,
        5,
    )

    direct_vm.sender = direct_bob
    contract.submit_work(
        bounty_id,
        ["https://github.com/example/equigrant-edit-protection"],
        "https://demo.example.com",
        "This submission protects already participating builders from bounty edits.",
    )

    direct_vm.sender = direct_alice
    with direct_vm.expect_revert("Bounties with submissions cannot be edited"):
        contract.edit_bounty(
            bounty_id,
            "Changed criteria after a builder submitted should fail",
            1500,
            8,
        )
