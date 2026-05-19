# Error classification prefixes for GenLayer consensus on failure paths
# These must match exactly across validators for deterministic errors

ERROR_EXPECTED = "[EXPECTED]"    # Business logic (deterministic) — exact match required
ERROR_EXTERNAL = "[EXTERNAL]"    # External API 4xx (deterministic) — exact match required
ERROR_TRANSIENT = "[TRANSIENT]"  # Network/5xx (non-deterministic) — agree if both transient
ERROR_LLM = "[LLM_ERROR]"        # LLM misbehavior — always disagree, force rotation


def handle_leader_error(leaders_res, leader_fn):
    """Canonical error handler for validator functions.

    Returns True (agree) or False (disagree) based on error classification.
    """
    leader_msg = ""
    if hasattr(leaders_res, "message"):
        leader_msg = str(leaders_res.message)
    elif hasattr(leaders_res, "calldata"):
        # Try to extract message from calldata
        cd = leaders_res.calldata
        if isinstance(cd, dict):
            leader_msg = cd.get("error", cd.get("message", ""))

    try:
        leader_fn()
        return False  # Leader errored, validator succeeded — disagree
    except Exception as e:
        validator_msg = str(e)

        # Deterministic errors: must match exactly
        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
            return validator_msg == leader_msg

        # Transient: agree if both hit transient failure
        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
            return True

        # LLM or unknown: disagree — forces consensus retry
        return False
