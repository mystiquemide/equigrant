# Scoring helpers for the EquiGrant evaluation engine
# Consensus tolerance and LLM response parsing

from genlayer import *

from .errors import ERROR_LLM, ERROR_EXPECTED

# Consensus tolerance: validators accept scores within ±10 points of leader
SCORE_TOLERANCE = 10


def parse_llm_score(analysis) -> int:
    """Extract numeric score from LLM response, handling common variations.

    Expects a dict with a 'score' key (0-100 integer).
    Returns max(0, min(100, parsed_score)).
    """
    if not isinstance(analysis, dict):
        raise gl.UserError(f"{ERROR_LLM} Non-dict response: {type(analysis)}")

    raw = analysis.get("score")

    # Key aliasing — LLMs sometimes use alternate names
    if raw is None:
        for alt in ("rating", "points", "value", "result", "final_score"):
            if alt in analysis:
                raw = analysis[alt]
                break

    if raw is None:
        raise gl.UserError(
            f"{ERROR_LLM} Missing 'score' field. Available keys: {list(analysis.keys())}"
        )

    # Coerce aggressively — handles int, float, "3", "3.5", etc.
    try:
        score = int(round(float(str(raw).strip())))
        return max(0, min(100, score))
    except (ValueError, TypeError):
        raise gl.UserError(f"{ERROR_LLM} Non-numeric score value: {raw}")


def parse_llm_reasoning(analysis) -> str:
    """Extract reasoning text from LLM response."""
    if not isinstance(analysis, dict):
        return str(analysis)
    return str(analysis.get("reasoning", analysis.get("analysis", "")))


def parse_llm_passed(analysis) -> bool:
    """Extract passed/failed boolean from LLM response."""
    if not isinstance(analysis, dict):
        return False
    passed = analysis.get("passed", analysis.get("pass", False))
    if isinstance(passed, bool):
        return passed
    if isinstance(passed, str):
        return passed.lower() in ("true", "yes", "pass")
    return bool(passed)


def parse_llm_plagiarism(analysis) -> bool:
    """Extract plagiarism flag from LLM response."""
    if not isinstance(analysis, dict):
        return False
    flag = analysis.get("plagiarism_flag", analysis.get("plagiarism", False))
    if isinstance(flag, bool):
        return flag
    if isinstance(flag, str):
        return flag.lower() in ("true", "yes", "detected")
    return bool(flag)


def clean_llm_json(text: str) -> dict:
    """Clean JSON from LLM output — strip wrapping text, fix common issues."""
    import json
    import re

    # Find the outermost JSON object
    first = text.find("{")
    last = text.rfind("}")
    if first == -1 or last == -1:
        raise gl.UserError(f"{ERROR_LLM} No JSON object found in LLM response")

    text = text[first : last + 1]

    # Remove trailing commas (common LLM mistake)
    text = re.sub(r",(\s*[}\]])", r"\1", text)

    # Remove comments if present
    text = re.sub(r"//[^\n]*", "", text)

    return json.loads(text)


def validate_consensus(leader_score: int, validator_score: int,
                       leader_passed: bool, validator_passed: bool,
                       leader_plagiarism: bool, validator_plagiarism: bool) -> bool:
    """Check if validator agrees with leader within tolerance.

    Consensus conditions:
    1. Scores within ±10 points
    2. Pass/fail verdict matches
    3. Plagiarism flag matches
    """
    if leader_plagiarism != validator_plagiarism:
        return False

    if leader_passed != validator_passed:
        return False

    if abs(leader_score - validator_score) > SCORE_TOLERANCE:
        return False

    return True


def compute_score_distribution(score: int) -> str:
    """Return a human-readable score tier."""
    if score >= 80:
        return "Excellent"
    elif score >= 60:
        return "Good"
    elif score >= 40:
        return "Average"
    elif score >= 20:
        return "Below Average"
    else:
        return "Poor"
