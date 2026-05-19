# Input validation helpers for the EquiGrant contract

from genlayer import *

from .errors import ERROR_EXPECTED, ERROR_EXTERNAL

# Deadline tolerance: validators may have minor clock drift.
# Deadlines are enforced with a 5-minute buffer to prevent consensus
# disagreements at exact boundary times.
# FIXME(mainnet): Replace datetime.utcnow() with gl.block.timestamp
# when the GenLayer SDK exposes it for deterministic time comparisons.
DEADLINE_TOLERANCE_SECONDS = 300  # 5 minutes

from datetime import datetime, timedelta, timezone


def _utcnow() -> datetime:
    """Get current UTC time. For mainnet, replace with gl.block.timestamp."""
    return datetime.now(timezone.utc)


def validate_bounty_criteria(criteria: str) -> None:
    """Validate bounty criteria string."""
    if not criteria or not isinstance(criteria, str):
        raise gl.UserError(f"{ERROR_EXPECTED} Criteria must be a non-empty string")
    if len(criteria) < 10:
        raise gl.UserError(f"{ERROR_EXPECTED} Criteria too short (minimum 10 characters)")
    if len(criteria) > 5000:
        raise gl.UserError(f"{ERROR_EXPECTED} Criteria too long (maximum 5000 characters)")


def validate_reward_pool(amount: u256) -> None:
    """Validate reward pool amount."""
    if amount <= u256(0):
        raise gl.UserError(f"{ERROR_EXPECTED} Reward pool must be greater than 0")


def validate_deadline(deadline: str) -> bool:
    """Validate deadline is a future ISO 8601 date with 5-min tolerance.
    Returns True if valid."""
    try:
        deadline_dt = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        min_allowed = _utcnow() - timedelta(seconds=DEADLINE_TOLERANCE_SECONDS)
        if deadline_dt <= min_allowed:
            raise gl.UserError(
                f"{ERROR_EXPECTED} Deadline must be in the future "
                f"(minimum {DEADLINE_TOLERANCE_SECONDS // 60} minutes from now)"
            )
        return True
    except (ValueError, TypeError):
        raise gl.UserError(
            f"{ERROR_EXPECTED} Invalid deadline format. "
            f"Use ISO 8601 (e.g., 2026-06-01T00:00:00Z)"
        )


def is_deadline_passed(deadline: str) -> bool:
    """Check if deadline has passed with tolerance buffer.
    Returns True if deadline is definitely in the past."""
    try:
        deadline_dt = datetime.fromisoformat(deadline.replace("Z", "+00:00"))
        # Must be at least 5 minutes past deadline to consider it passed
        return _utcnow() > deadline_dt + timedelta(seconds=DEADLINE_TOLERANCE_SECONDS)
    except (ValueError, TypeError):
        return False


def validate_min_stake(stake: u256) -> None:
    """Validate minimum stake amount."""
    if stake <= u256(0):
        raise gl.UserError(f"{ERROR_EXPECTED} Minimum stake must be greater than 0")


def validate_submission_input(
    bounty_id: str,
    github_urls: DynArray[str],
    demo_url: str,
    description: str,
) -> None:
    """Validate submission inputs."""
    if not bounty_id or not isinstance(bounty_id, str):
        raise gl.UserError(f"{ERROR_EXPECTED} Invalid bounty ID")

    if not github_urls or len(github_urls) == 0:
        raise gl.UserError(f"{ERROR_EXPECTED} At least one GitHub URL is required")

    if len(github_urls) > 10:
        raise gl.UserError(f"{ERROR_EXPECTED} Maximum 10 GitHub URLs allowed")

    for url in github_urls:
        if not url.startswith("https://github.com/"):
            raise gl.UserError(f"{ERROR_EXPECTED} Invalid GitHub URL: {url}")

    if demo_url and len(demo_url) > 0:
        if not (demo_url.startswith("http://") or demo_url.startswith("https://")):
            raise gl.UserError(f"{ERROR_EXPECTED} Invalid demo URL: {demo_url}")

    if not description or len(description) < 20:
        raise gl.UserError(f"{ERROR_EXPECTED} Description too short (minimum 20 characters)")

    if len(description) > 2000:
        raise gl.UserError(f"{ERROR_EXPECTED} Description too long (maximum 2000 characters)")


def validate_appeal_reason(reason: str) -> None:
    """Validate appeal reason string."""
    if not reason or len(reason) < 20:
        raise gl.UserError(f"{ERROR_EXPECTED} Appeal reason too short (minimum 20 characters)")
    if len(reason) > 1000:
        raise gl.UserError(f"{ERROR_EXPECTED} Appeal reason too long (maximum 1000 characters)")
