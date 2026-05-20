     1|# Error classification prefixes for GenLayer consensus on failure paths
     2|# These must match exactly across validators for deterministic errors
     3|
     4|ERROR_EXPECTED = "[EXPECTED]"    # Business logic (deterministic) , exact match required
     5|ERROR_EXTERNAL = "[EXTERNAL]"    # External API 4xx (deterministic) , exact match required
     6|ERROR_TRANSIENT = "[TRANSIENT]"  # Network/5xx (non-deterministic) , agree if both transient
     7|ERROR_LLM = "[LLM_ERROR]"        # LLM misbehavior , always disagree, force rotation
     8|
     9|
    10|def handle_leader_error(leaders_res, leader_fn):
    11|    """Canonical error handler for validator functions.
    12|
    13|    Returns True (agree) or False (disagree) based on error classification.
    14|    """
    15|    leader_msg = ""
    16|    if hasattr(leaders_res, "message"):
    17|        leader_msg = str(leaders_res.message)
    18|    elif hasattr(leaders_res, "calldata"):
    19|        # Try to extract message from calldata
    20|        cd = leaders_res.calldata
    21|        if isinstance(cd, dict):
    22|            leader_msg = cd.get("error", cd.get("message", ""))
    23|
    24|    try:
    25|        leader_fn()
    26|        return False  # Leader errored, validator succeeded , disagree
    27|    except Exception as e:
    28|        validator_msg = str(e)
    29|
    30|        # Deterministic errors: must match exactly
    31|        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
    32|            return validator_msg == leader_msg
    33|
    34|        # Transient: agree if both hit transient failure
    35|        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
    36|            return True
    37|
    38|        # LLM or unknown: disagree , forces consensus retry
    39|        return False
    40|
