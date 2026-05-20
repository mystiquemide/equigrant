     1|# Scoring helpers for the EquiGrant evaluation engine
     2|# Consensus tolerance and LLM response parsing
     3|
     4|from genlayer import *
     5|
     6|from .errors import ERROR_LLM, ERROR_EXPECTED
     7|
     8|# Consensus tolerance: validators accept scores within ±10 points of leader
     9|SCORE_TOLERANCE = 10
    10|
    11|
    12|def parse_llm_score(analysis) -> int:
    13|    """Extract numeric score from LLM response, handling common variations.
    14|
    15|    Expects a dict with a 'score' key (0-100 integer).
    16|    Returns max(0, min(100, parsed_score)).
    17|    """
    18|    if not isinstance(analysis, dict):
    19|        raise gl.UserError(f"{ERROR_LLM} Non-dict response: {type(analysis)}")
    20|
    21|    raw = analysis.get("score")
    22|
    23|    # Key aliasing , LLMs sometimes use alternate names
    24|    if raw is None:
    25|        for alt in ("rating", "points", "value", "result", "final_score"):
    26|            if alt in analysis:
    27|                raw = analysis[alt]
    28|                break
    29|
    30|    if raw is None:
    31|        raise gl.UserError(
    32|            f"{ERROR_LLM} Missing 'score' field. Available keys: {list(analysis.keys())}"
    33|        )
    34|
    35|    # Coerce aggressively , handles int, float, "3", "3.5", etc.
    36|    try:
    37|        score = int(round(float(str(raw).strip())))
    38|        return max(0, min(100, score))
    39|    except (ValueError, TypeError):
    40|        raise gl.UserError(f"{ERROR_LLM} Non-numeric score value: {raw}")
    41|
    42|
    43|def parse_llm_reasoning(analysis) -> str:
    44|    """Extract reasoning text from LLM response."""
    45|    if not isinstance(analysis, dict):
    46|        return str(analysis)
    47|    return str(analysis.get("reasoning", analysis.get("analysis", "")))
    48|
    49|
    50|def parse_llm_passed(analysis) -> bool:
    51|    """Extract passed/failed boolean from LLM response."""
    52|    if not isinstance(analysis, dict):
    53|        return False
    54|    passed = analysis.get("passed", analysis.get("pass", False))
    55|    if isinstance(passed, bool):
    56|        return passed
    57|    if isinstance(passed, str):
    58|        return passed.lower() in ("true", "yes", "pass")
    59|    return bool(passed)
    60|
    61|
    62|def parse_llm_plagiarism(analysis) -> bool:
    63|    """Extract plagiarism flag from LLM response."""
    64|    if not isinstance(analysis, dict):
    65|        return False
    66|    flag = analysis.get("plagiarism_flag", analysis.get("plagiarism", False))
    67|    if isinstance(flag, bool):
    68|        return flag
    69|    if isinstance(flag, str):
    70|        return flag.lower() in ("true", "yes", "detected")
    71|    return bool(flag)
    72|
    73|
    74|def clean_llm_json(text: str) -> dict:
    75|    """Clean JSON from LLM output , strip wrapping text, fix common issues."""
    76|    import json
    77|    import re
    78|
    79|    # Find the outermost JSON object
    80|    first = text.find("{")
    81|    last = text.rfind("}")
    82|    if first == -1 or last == -1:
    83|        raise gl.UserError(f"{ERROR_LLM} No JSON object found in LLM response")
    84|
    85|    text = text[first : last + 1]
    86|
    87|    # Remove trailing commas (common LLM mistake)
    88|    text = re.sub(r",(\s*[}\]])", r"\1", text)
    89|
    90|    # Remove comments if present
    91|    text = re.sub(r"//[^\n]*", "", text)
    92|
    93|    return json.loads(text)
    94|
    95|
    96|def validate_consensus(leader_score: int, validator_score: int,
    97|                       leader_passed: bool, validator_passed: bool,
    98|                       leader_plagiarism: bool, validator_plagiarism: bool) -> bool:
    99|    """Check if validator agrees with leader within tolerance.
   100|
   101|    Consensus conditions:
   102|    1. Scores within ±10 points
   103|    2. Pass/fail verdict matches
   104|    3. Plagiarism flag matches
   105|    """
   106|    if leader_plagiarism != validator_plagiarism:
   107|        return False
   108|
   109|    if leader_passed != validator_passed:
   110|        return False
   111|
   112|    if abs(leader_score - validator_score) > SCORE_TOLERANCE:
   113|        return False
   114|
   115|    return True
   116|
   117|
   118|def compute_score_distribution(score: int) -> str:
   119|    """Return a human-readable score tier."""
   120|    if score >= 80:
   121|        return "Excellent"
   122|    elif score >= 60:
   123|        return "Good"
   124|    elif score >= 40:
   125|        return "Average"
   126|    elif score >= 20:
   127|        return "Below Average"
   128|    else:
   129|        return "Poor"
   130|
