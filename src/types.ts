export type Platform = "twitter" | "reddit" | "linkedin";

export type LeadStatus = "new" | "engage" | "skip";

export interface Lead {
  id: string;
  platform: Platform;
  url: string;
  author: string;
  text: string;
  foundAt: string;
  status: LeadStatus;
  strategistReasoning?: string;
}

export type DraftStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "ready_to_post";

export interface DesignSpec {
  needed: boolean;
  prompt?: string;
  rationale?: string;
}

export interface Draft {
  id: string;
  leadId: string;
  platform: Platform;
  url: string;
  text: string;
  status: DraftStatus;
  createdAt: string;
  design?: DesignSpec;
}

export interface Post {
  id: string;
  draftId: string;
  platform: Platform;
  url: string;
  text: string;
  postedAt: string;
}

export interface Metric {
  postId: string;
  likes?: number;
  replies?: number;
  reposts?: number;
  clicks?: number;
  conversions?: number;
  recordedAt: string;
}
