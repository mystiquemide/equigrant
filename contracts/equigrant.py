# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

"""EquiGrant intelligent contract.

EquiGrant is an AI-governed grant and bounty platform on GenLayer. Grant
creators define natural-language criteria, builders submit proof of work, and
AI validators evaluate submissions through leader-based consensus with a +/-10
score tolerance.
"""

import json
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from genlayer import *

try:
    from genlayer import allow_storage
except ImportError:
    def allow_storage(value):
        return value


ERROR_EXPECTED = "[EXPECTED]"
ERROR_EXTERNAL = "[EXTERNAL]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_LLM = "[LLM_ERROR]"

SCORE_TOLERANCE = 10
DEADLINE_TOLERANCE_SECONDS = 300


EVALUATE_PROMPT = """You are an expert grant evaluator for EquiGrant on GenLayer.

Return only JSON with this exact shape:
{{
  "score": <integer 0-100>,
  "reasoning": "<concise but specific explanation>",
  "passed": <true or false>,
  "plagiarism_flag": <true or false>
}}

Scoring guidance:
- 90-100: exceptional
- 75-89: strong
- 60-74: adequate
- 40-59: needs work
- 0-39: insufficient

The submission passes only when score is at least 60 and no plagiarism is found.

Grant criteria:
{criteria}

Project description:
{description}

GitHub repositories:
{github_urls}

Demo URL:
{demo_url}

Repository context:
{repo_context}
"""


PLAGIARISM_PROMPT = """You are checking a grant submission for substantial plagiarism.

Return only JSON with this exact shape:
{{
  "plagiarism_flag": <true or false>,
  "originality_score": <integer 0-100>,
  "evidence": "<brief evidence summary>",
  "sources": ["<source url if any>"]
}}

Using open-source libraries is allowed when the project adds meaningful original work.

GitHub repositories:
{github_urls}

Project description:
{description}
"""


@allow_storage
@dataclass
class Bounty:
    id: str
    creator: str
    criteria: str
    reward_pool: u256
    remaining_pool: u256
    deadline: str
    min_stake: u256
    status: str
    submission_count: u256
    winners: DynArray[str]
    created_at: str


@allow_storage
@dataclass
class Submission:
    id: str
    bounty_id: str
    submitter: str
    github_urls: DynArray[str]
    demo_url: str
    description: str
    stake_amount: u256
    status: str
    evaluated_at: str
    submitted_at: str


@allow_storage
@dataclass
class Evaluation:
    bounty_id: str
    submission_id: str
    score: u256
    reasoning: str
    passed: bool
    plagiarism_flag: bool
    leaders: DynArray[str]
    consensus_reached: bool
    evaluated_at: str
    round: u256


@allow_storage
@dataclass
class Appeal:
    bounty_id: str
    submission_id: str
    appellant: str
    bond_amount: u256
    reason: str
    status: str
    original_result: str
    new_result: str
    created_at: str


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _now_iso() -> str:
    return _utcnow().isoformat().replace("+00:00", "Z")


def _sender() -> str:
    return str(getattr(gl.message, "sender_address", getattr(gl.message, "sender_account", "")))


def _normalize_address(value) -> str:
    text = str(value)
    if text.startswith('Address("') and text.endswith('")'):
        text = text[9:-2]
    if text.startswith("Address('") and text.endswith("')"):
        text = text[9:-2]
    if text.startswith('"') and text.endswith('"'):
        text = text[1:-1]
    if text.startswith("'") and text.endswith("'"):
        text = text[1:-1]
    return text.lower()


def _parse_deadline(deadline: str) -> datetime:
    try:
        return datetime.fromisoformat(deadline.replace("Z", "+00:00"))
    except (ValueError, TypeError):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Invalid deadline format. Use ISO 8601.")


def _validate_bounty(criteria: str, reward_pool: u256, deadline: str, min_stake: u256) -> None:
    if not criteria or not isinstance(criteria, str):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria must be a non-empty string")
    if len(criteria) < 10:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria too short. Minimum 10 characters.")
    if len(criteria) > 12000:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria too long. Maximum 12000 characters.")
    if reward_pool <= u256(0):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Reward pool must be greater than 0")
    if min_stake <= u256(0):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Minimum stake must be greater than 0")

    deadline_dt = _parse_deadline(deadline)
    min_allowed = _utcnow() - timedelta(seconds=DEADLINE_TOLERANCE_SECONDS)
    if deadline_dt <= min_allowed:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Deadline must be in the future")


def _validate_bounty_terms(criteria: str, reward_pool: u256, min_stake: u256) -> None:
    if not criteria or not isinstance(criteria, str):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria must be a non-empty string")
    if len(criteria) < 10:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria too short. Minimum 10 characters.")
    if len(criteria) > 12000:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Criteria too long. Maximum 12000 characters.")
    if reward_pool <= u256(0):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Reward pool must be greater than 0")
    if min_stake <= u256(0):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Minimum stake must be greater than 0")


def _deadline_passed(deadline: str) -> bool:
    deadline_dt = _parse_deadline(deadline)
    return _utcnow() > deadline_dt + timedelta(seconds=DEADLINE_TOLERANCE_SECONDS)


def _validate_submission(
    bounty_id: str,
    github_urls: DynArray[str],
    demo_url: str,
    description: str,
) -> None:
    if not bounty_id:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Invalid bounty ID")
    if not github_urls or len(github_urls) == 0:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} At least one GitHub URL is required")
    if len(github_urls) > 10:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Maximum 10 GitHub URLs allowed")

    for url in github_urls:
        if not url.startswith("https://github.com/"):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Invalid GitHub URL: {url}")

    if demo_url and not (demo_url.startswith("https://") or demo_url.startswith("http://")):
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Invalid demo URL: {demo_url}")
    if not description or len(description) < 20:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Description too short. Minimum 20 characters.")
    if len(description) > 2000:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Description too long. Maximum 2000 characters.")


def _validate_appeal(reason: str) -> None:
    if not reason or len(reason) < 20:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Appeal reason too short. Minimum 20 characters.")
    if len(reason) > 1000:
        raise gl.vm.UserError(f"{ERROR_EXPECTED} Appeal reason too long. Maximum 1000 characters.")


def _parse_json_response(value) -> dict:
    if isinstance(value, dict):
        return value
    if not isinstance(value, str):
        raise gl.vm.UserError(f"{ERROR_LLM} LLM returned unsupported response type: {type(value)}")

    first = value.find("{")
    last = value.rfind("}")
    if first < 0 or last < first:
        raise gl.vm.UserError(f"{ERROR_LLM} LLM returned non-JSON text")

    text = value[first : last + 1]
    text = text.replace(",}", "}").replace(",]", "]")
    try:
        return json.loads(text)
    except Exception:
        raise gl.vm.UserError(f"{ERROR_LLM} LLM returned invalid JSON")


def _parse_score(analysis: dict) -> int:
    raw = analysis.get("score")
    if raw is None:
        for key in ("rating", "points", "value", "result", "final_score"):
            if key in analysis:
                raw = analysis[key]
                break
    if raw is None:
        raise gl.vm.UserError(f"{ERROR_LLM} Missing score field")
    try:
        score = int(round(float(str(raw).strip())))
        return max(0, min(100, score))
    except (ValueError, TypeError):
        raise gl.vm.UserError(f"{ERROR_LLM} Score is not numeric")


def _parse_bool(analysis: dict, primary: str, fallback: str, default: bool = False) -> bool:
    value = analysis.get(primary, analysis.get(fallback, default))
    if isinstance(value, bool):
        return value
    if isinstance(value, str):
        return value.strip().lower() in ("true", "yes", "pass", "passed", "detected")
    return bool(value)


def _error_message(result) -> str:
    if hasattr(result, "message"):
        return str(result.message)
    if hasattr(result, "calldata") and isinstance(result.calldata, dict):
        return str(result.calldata.get("message", result.calldata.get("error", "")))
    return ""


def _handle_leader_error(leaders_res, leader_fn) -> bool:
    leader_msg = _error_message(leaders_res)
    try:
        leader_fn()
        return False
    except Exception as error:
        validator_msg = str(error)
        if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
            return validator_msg == leader_msg
        if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
            return True
        return False


def _within_consensus(
    leader_score: int,
    validator_score: int,
    leader_passed: bool,
    validator_passed: bool,
    leader_plagiarism: bool,
    validator_plagiarism: bool,
) -> bool:
    if leader_passed != validator_passed:
        return False
    if leader_plagiarism != validator_plagiarism:
        return False
    return abs(leader_score - validator_score) <= SCORE_TOLERANCE


class EquiGrant(gl.Contract):
    bounties: TreeMap[str, Bounty]
    submissions: TreeMap[str, Submission]
    evaluations: TreeMap[str, Evaluation]
    appeals: TreeMap[str, Appeal]
    bounty_order: DynArray[str]
    submission_order: TreeMap[str, DynArray[str]]
    bounty_count: u256
    submission_count: u256

    def __init__(self):
        self.bounty_count = u256(0)
        self.submission_count = u256(0)

    @gl.public.write
    def create_bounty(self, criteria: str, reward_pool: u256, deadline: str, min_stake: u256) -> str:
        _validate_bounty(criteria, reward_pool, deadline, min_stake)

        bounty_id = f"bounty_{str(self.bounty_count)}"
        self.bounty_count += u256(1)

        self.bounties[bounty_id] = Bounty(
            id=bounty_id,
            creator=_sender(),
            criteria=criteria,
            reward_pool=reward_pool,
            remaining_pool=reward_pool,
            deadline=deadline,
            min_stake=min_stake,
            status="active",
            submission_count=u256(0),
            winners=[],
            created_at=_now_iso(),
        )
        self.bounty_order.append(bounty_id)
        return bounty_id

    def _require_creator(self, bounty: Bounty, action: str) -> None:
        if _normalize_address(_sender()) != _normalize_address(bounty.creator):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only the grant creator can {action}")

    def _require_mutable_bounty(self, bounty: Bounty) -> None:
        if bounty.status == "deleted":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Deleted bounties cannot be modified")
        if bounty.status == "resolved":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Resolved bounties cannot be modified")

    @gl.public.write
    def edit_bounty(self, bounty_id: str, criteria: str, reward_pool: u256, min_stake: u256) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        self._require_creator(bounty, "edit")
        self._require_mutable_bounty(bounty)
        if bounty.submission_count > u256(0):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounties with submissions cannot be edited")

        _validate_bounty_terms(criteria, reward_pool, min_stake)
        bounty.criteria = criteria
        bounty.reward_pool = reward_pool
        bounty.remaining_pool = reward_pool
        bounty.min_stake = min_stake

    @gl.public.write
    def extend_deadline(self, bounty_id: str, deadline: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        self._require_creator(bounty, "extend")
        self._require_mutable_bounty(bounty)

        new_deadline = _parse_deadline(deadline)
        current_deadline = _parse_deadline(bounty.deadline)
        if new_deadline <= current_deadline:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} New deadline must be after current deadline")
        if new_deadline <= _utcnow():
            raise gl.vm.UserError(f"{ERROR_EXPECTED} New deadline must be in the future")

        bounty.deadline = deadline

    @gl.public.write
    def pause_bounty(self, bounty_id: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        self._require_creator(bounty, "pause")
        self._require_mutable_bounty(bounty)
        if bounty.status == "paused":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty already paused")
        if bounty.status != "active":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only active bounties can be paused")

        bounty.status = "paused"

    @gl.public.write
    def resume_bounty(self, bounty_id: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        self._require_creator(bounty, "resume")
        self._require_mutable_bounty(bounty)
        if bounty.status != "paused":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only paused bounties can be resumed")
        if _deadline_passed(bounty.deadline):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Cannot resume a bounty after its deadline")

        bounty.status = "active"

    @gl.public.write
    def submit_work(
        self,
        bounty_id: str,
        github_urls: DynArray[str],
        demo_url: str,
        description: str,
    ) -> str:
        _validate_submission(bounty_id, github_urls, demo_url, description)

        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        if bounty.status != "active":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty is not accepting submissions")
        if _deadline_passed(bounty.deadline):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission deadline has passed")

        submitter = _sender()
        existing_ids = self.submission_order.get(bounty_id, [])
        for submission_id in existing_ids:
            existing = self.submissions.get(submission_id)
            if existing and _normalize_address(existing.submitter) == _normalize_address(submitter):
                raise gl.vm.UserError(f"{ERROR_EXPECTED} You have already submitted to this bounty")

        submission_id = f"submission_{str(self.submission_count)}"
        self.submission_count += u256(1)

        self.submissions[submission_id] = Submission(
            id=submission_id,
            bounty_id=bounty_id,
            submitter=submitter,
            github_urls=github_urls,
            demo_url=demo_url,
            description=description,
            stake_amount=bounty.min_stake,
            status="submitted",
            evaluated_at="",
            submitted_at=_now_iso(),
        )

        if self.submission_order.get(bounty_id) is None:
            self.submission_order[bounty_id] = []
        self.submission_order[bounty_id].append(submission_id)
        bounty.submission_count += u256(1)

        return submission_id

    @gl.public.write
    def evaluate(self, bounty_id: str, submission_id: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")

        submission = self.submissions.get(submission_id)
        if submission is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission not found: {submission_id}")
        if submission.bounty_id != bounty_id:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission does not belong to bounty")
        if submission.status in ("evaluating", "evaluated"):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission already evaluated or evaluating")

        submission.status = "evaluating"
        result = self._run_evaluation(bounty, submission)

        leaders = []
        leaders.append(_sender())
        evaluation = Evaluation(
            bounty_id=bounty_id,
            submission_id=submission_id,
            score=u256(result["score"]),
            reasoning=result["reasoning"],
            passed=result["passed"],
            plagiarism_flag=result["plagiarism_flag"],
            leaders=leaders,
            consensus_reached=True,
            evaluated_at=_now_iso(),
            round=u256(1),
        )
        self.evaluations[f"{bounty_id}:{submission_id}"] = evaluation
        submission.status = "evaluated"
        submission.evaluated_at = evaluation.evaluated_at

    @gl.public.write
    def resolve(self, bounty_id: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        if bounty.status == "resolved":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty already resolved")
        self._require_creator(bounty, "resolve")
        if bounty.status == "deleted":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Deleted bounties cannot be resolved")
        if not _deadline_passed(bounty.deadline):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Deadline not yet passed")

        qualified_ids = []
        best_scores = []
        for submission_id in self.submission_order.get(bounty_id, []):
            evaluation = self.evaluations.get(f"{bounty_id}:{submission_id}")
            if evaluation and evaluation.passed and not evaluation.plagiarism_flag:
                qualified_ids.append(submission_id)
                best_scores.append(evaluation.score)

        if len(qualified_ids) == 0:
            bounty.status = "resolved"
            return

        payout_count = min(len(qualified_ids), 3)
        share = bounty.remaining_pool // u256(payout_count)
        paid = u256(0)

        selected = []
        while len(selected) < payout_count:
            best_index = -1
            best_score = u256(0)
            for idx in range(len(qualified_ids)):
                candidate_id = qualified_ids[idx]
                already_selected = False
                for selected_id in selected:
                    if selected_id == candidate_id:
                        already_selected = True
                if (best_index < 0 or best_scores[idx] > best_score) and not already_selected:
                    best_score = best_scores[idx]
                    best_index = idx

            winner_submission_id = qualified_ids[best_index]
            selected.append(winner_submission_id)
            submission = self.submissions.get(winner_submission_id)
            if submission:
                bounty.winners.append(submission.submitter)
                paid += share

        if paid >= bounty.remaining_pool:
            bounty.remaining_pool = u256(0)
        else:
            bounty.remaining_pool -= paid

        bounty.status = "resolved"

    @gl.public.write
    def delete_bounty(self, bounty_id: str) -> None:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        self._require_creator(bounty, "delete")
        if bounty.status == "deleted":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty already deleted")
        if bounty.status == "resolved":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Resolved bounties cannot be deleted")
        if bounty.submission_count > u256(0):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounties with submissions cannot be deleted")

        bounty.status = "deleted"

    @gl.public.write
    def appeal(self, bounty_id: str, submission_id: str, reason: str) -> None:
        _validate_appeal(reason)

        submission = self.submissions.get(submission_id)
        if submission is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission not found: {submission_id}")
        if submission.bounty_id != bounty_id:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Submission does not belong to bounty")
        if _normalize_address(submission.submitter) != _normalize_address(_sender()):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only the original submitter can appeal")
        if submission.status != "evaluated":
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Can only appeal evaluated submissions")

        evaluation = self.evaluations.get(f"{bounty_id}:{submission_id}")
        if evaluation is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} No evaluation found to appeal")
        if evaluation.passed:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Cannot appeal a passing evaluation")

        appeal_key = f"{bounty_id}:{submission_id}"
        existing = self.appeals.get(appeal_key)
        if existing and existing.status in ("pending", "re_evaluating"):
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Appeal already in progress")

        self.appeals[appeal_key] = Appeal(
            bounty_id=bounty_id,
            submission_id=submission_id,
            appellant=submission.submitter,
            bond_amount=submission.stake_amount * u256(2),
            reason=reason,
            status="pending",
            original_result=json.dumps(
                {
                    "score": int(str(evaluation.score)),
                    "reasoning": evaluation.reasoning,
                    "passed": evaluation.passed,
                    "plagiarism_flag": evaluation.plagiarism_flag,
                    "round": int(str(evaluation.round)),
                }
            ),
            new_result="",
            created_at=_now_iso(),
        )
        submission.status = "appealed"

    @gl.public.view
    def get_bounty(self, bounty_id: str) -> dict:
        bounty = self.bounties.get(bounty_id)
        if bounty is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Bounty not found: {bounty_id}")
        return self._bounty_to_dict(bounty, False)

    @gl.public.view
    def get_active_bounties(self) -> list[dict]:
        results = []
        for bounty_id in self.bounty_order:
            bounty = self.bounties.get(bounty_id)
            if bounty and bounty.status == "active":
                results.append(self._bounty_to_dict(bounty, True))
        return results

    @gl.public.view
    def get_submissions(self, bounty_id: str) -> list[dict]:
        results = []
        for submission_id in self.submission_order.get(bounty_id, []):
            submission = self.submissions.get(submission_id)
            if submission:
                results.append(self._submission_to_dict(submission, False))
        return results

    @gl.public.view
    def get_evaluation(self, bounty_id: str, submission_id: str) -> dict:
        evaluation = self.evaluations.get(f"{bounty_id}:{submission_id}")
        if evaluation is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} No evaluation found for submission {submission_id}")
        return {
            "bounty_id": evaluation.bounty_id,
            "submission_id": evaluation.submission_id,
            "score": int(str(evaluation.score)),
            "reasoning": evaluation.reasoning,
            "passed": evaluation.passed,
            "plagiarism_flag": evaluation.plagiarism_flag,
            "leaders": [leader for leader in evaluation.leaders],
            "consensus_reached": evaluation.consensus_reached,
            "evaluated_at": evaluation.evaluated_at,
            "round": int(str(evaluation.round)),
        }

    @gl.public.view
    def get_submitter_submissions(self, address: str) -> list[dict]:
        results = []
        for bounty_id in self.bounty_order:
            for submission_id in self.submission_order.get(bounty_id, []):
                submission = self.submissions.get(submission_id)
                if submission and _normalize_address(submission.submitter) == _normalize_address(address):
                    results.append(self._submission_to_dict(submission, False))
        return results

    @gl.public.view
    def get_creator_bounties(self, address: str) -> list[dict]:
        results = []
        for bounty_id in self.bounty_order:
            bounty = self.bounties.get(bounty_id)
            if bounty and _normalize_address(bounty.creator) == _normalize_address(address):
                results.append(self._bounty_to_dict(bounty, True))
        return results

    @gl.public.view
    def get_appeal(self, bounty_id: str, submission_id: str) -> dict:
        appeal = self.appeals.get(f"{bounty_id}:{submission_id}")
        if appeal is None:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} No appeal found for submission {submission_id}")
        return {
            "bounty_id": appeal.bounty_id,
            "submission_id": appeal.submission_id,
            "appellant": appeal.appellant,
            "bond_amount": str(appeal.bond_amount),
            "reason": appeal.reason,
            "status": appeal.status,
            "original_result": appeal.original_result,
            "new_result": appeal.new_result,
            "created_at": appeal.created_at,
        }

    @gl.public.view
    def get_bounty_count(self) -> str:
        return str(self.bounty_count)

    def _run_evaluation(self, bounty: Bounty, submission: Submission) -> dict:
        def leader_fn() -> dict:
            repo_context = self._fetch_repo_context(submission.github_urls)
            plagiarism = self._check_plagiarism(submission.github_urls, submission.description)
            analysis = gl.nondet.exec_prompt(
                EVALUATE_PROMPT.format(
                    criteria=bounty.criteria,
                    description=submission.description,
                    github_urls="\n".join(submission.github_urls),
                    demo_url=submission.demo_url or "Not provided",
                    repo_context=repo_context,
                ),
                response_format="json",
            )
            parsed = _parse_json_response(analysis)
            score = _parse_score(parsed)
            plagiarism_flag = _parse_bool(parsed, "plagiarism_flag", "plagiarism", False)
            if plagiarism.get("plagiarism_flag", False):
                plagiarism_flag = True
            passed = _parse_bool(parsed, "passed", "pass", score >= 60) and score >= 60
            if plagiarism_flag:
                passed = False

            reasoning = str(parsed.get("reasoning", parsed.get("analysis", "")))
            if not reasoning:
                reasoning = "Submission evaluated against grant criteria."

            return {
                "score": score,
                "reasoning": reasoning[:1200],
                "passed": passed,
                "plagiarism_flag": plagiarism_flag,
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return _handle_leader_error(leaders_res, leader_fn)

            try:
                validator_result = leader_fn()
            except Exception:
                return _handle_leader_error(leaders_res, leader_fn)

            leader = leaders_res.calldata
            return _within_consensus(
                int(leader.get("score", 0)),
                validator_result["score"],
                bool(leader.get("passed", False)),
                validator_result["passed"],
                bool(leader.get("plagiarism_flag", False)),
                validator_result["plagiarism_flag"],
            )

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    def _fetch_repo_context(self, github_urls: DynArray[str]) -> str:
        parts = []
        for url in github_urls:
            try:
                response = gl.nondet.web_fetch(url)
                if response and hasattr(response, "body"):
                    body = response.body.decode("utf-8", errors="replace")
                    parts.append(f"{url}\n{body[:4000]}")
                else:
                    parts.append(f"{url}\n[No readable response]")
            except Exception:
                parts.append(f"{url}\n[Repository fetch failed]")
        return "\n\n".join(parts) if parts else "No repository context fetched."

    def _check_plagiarism(self, github_urls: DynArray[str], description: str) -> dict:
        try:
            result = gl.nondet.exec_prompt(
                PLAGIARISM_PROMPT.format(
                    github_urls="\n".join(github_urls),
                    description=description,
                ),
                response_format="json",
            )
            parsed = _parse_json_response(result)
            return {
                "plagiarism_flag": _parse_bool(parsed, "plagiarism_flag", "plagiarism", False),
                "originality_score": _parse_score({"score": parsed.get("originality_score", 50)}),
                "evidence": str(parsed.get("evidence", "")),
            }
        except Exception:
            return {
                "plagiarism_flag": False,
                "originality_score": 50,
                "evidence": "Plagiarism check could not be completed.",
            }

    def _bounty_to_dict(self, bounty: Bounty, truncate_criteria: bool) -> dict:
        criteria = bounty.criteria
        if truncate_criteria and len(criteria) > 240:
            criteria = criteria[:240] + "..."
        return {
            "id": bounty.id,
            "creator": bounty.creator,
            "criteria": criteria,
            "reward_pool": str(bounty.reward_pool),
            "remaining_pool": str(bounty.remaining_pool),
            "deadline": bounty.deadline,
            "min_stake": str(bounty.min_stake),
            "status": bounty.status,
            "submission_count": str(bounty.submission_count),
            "winners": [winner for winner in bounty.winners],
            "created_at": bounty.created_at,
        }

    def _submission_to_dict(self, submission: Submission, truncate_description: bool) -> dict:
        description = submission.description
        if truncate_description and len(description) > 240:
            description = description[:240] + "..."
        return {
            "id": submission.id,
            "bounty_id": submission.bounty_id,
            "submitter": submission.submitter,
            "github_urls": [url for url in submission.github_urls],
            "demo_url": submission.demo_url,
            "description": description,
            "stake_amount": str(submission.stake_amount),
            "status": submission.status,
            "evaluated_at": submission.evaluated_at,
            "submitted_at": submission.submitted_at,
        }
