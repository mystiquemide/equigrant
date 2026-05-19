export interface BountyData {
  id: string;
  creator: string;
  criteria: string;
  reward_pool: string;
  remaining_pool: string;
  deadline: string;
  min_stake: string;
  status: "active" | "paused" | "evaluating" | "resolved" | "deleted";
  submission_count: string;
  winners: string[];
  created_at: string;
}

export interface SubmissionData {
  id: string;
  bounty_id: string;
  submitter: string;
  github_urls: string[];
  demo_url: string;
  description: string;
  stake_amount: string;
  status: "submitted" | "evaluating" | "evaluated" | "appealed";
  evaluated_at: string;
  submitted_at: string;
}

export interface EvaluationData {
  bounty_id: string;
  submission_id: string;
  score: number;
  reasoning: string;
  passed: boolean;
  plagiarism_flag: boolean;
  leaders: string[];
  consensus_reached: boolean;
  evaluated_at: string;
  round: number;
}

export interface AppealData {
  bounty_id: string;
  submission_id: string;
  appellant: string;
  bond_amount: string;
  reason: string;
  status: "pending" | "re_evaluating" | "resolved";
  original_result: string;
  new_result: string;
  created_at: string;
}

export type TransactionStatus =
  | "idle"
  | "signing"
  | "pending"
  | "confirmed"
  | "failed";

export type WalletState = "disconnected" | "connecting" | "connected";
