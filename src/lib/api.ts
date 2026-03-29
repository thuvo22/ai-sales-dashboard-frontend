/**
 * API client utilities for the AI Sales Dashboard backend.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "";
const BACKEND_BASE = process.env.NEXT_PUBLIC_BACKEND_URL || API_BASE;

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API ${res.status}: ${body}`);
  }
  return res.json();
}

// ── Types ──
export interface DashboardStats {
  total_leads: number;
  won_count: number;
  lost_count: number;
  pending_count: number;
  win_rate: number;
  total_revenue: number;
  total_claude_cost: number;
  followup_converted_count: number;
  followup_attributed_revenue: number;
}

export interface ContactMemory {
  id: string;
  customer_name: string;
  phone_number: string;
  service_requested: string | null;
  deal_status: "WON" | "LOST" | "PENDING" | "NOT_A_VALID_LEAD";
  rejection_reason: string | null;
  rejection_category: string | null;
  notes: string | null;
  tags: string[] | null;
  lead_source: string | null;
  revenue: number | null;
  latest_summary: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
}

export interface SalesPlaybookEntry {
  id: string;
  scenario: string;
  successful_tactic: string;
  contact_id: string | null;
  created_at: string;
}

export interface ConversationMessage {
  direction: string;
  sender: string;
  body: string;
  msg_type: string;
  timestamp: string;
}

export interface ContactConversationDetail {
  contact_id: string;
  ghl_contact_id: string | null;
  customer_name: string;
  phone_number: string;
  service_requested: string | null;
  deal_status: "WON" | "LOST" | "PENDING" | "NOT_A_VALID_LEAD";
  rejection_reason: string | null;
  rejection_category: string | null;
  notes: string | null;
  tags: string[] | null;
  lead_source: string | null;
  revenue: number | null;
  latest_summary: Record<string, unknown> | null;
  messages: ConversationMessage[];
  created_at: string;
  updated_at: string;
  last_activity_at: string | null;
}

export interface RejectionReason {
  reason: string;
  count: number;
}

export interface DealsChartDay {
  date: string;
  won: number;
  lost: number;
}

export interface SyncResult {
  contacts_fetched: number;
  contacts_audited: number;
  skipped: number;
  errors: string[];
}

export interface SyncStatus {
  running: boolean;
  finished: boolean;
  progress: string;
  contacts_fetched: number;
  contacts_audited: number;
  skipped: number;
  already_processed: number;
  re_audited: number;
  skip_no_phone: number;
  skip_no_conversation: number;
  skip_thumbtack: number;
  errors: string[];
}

export interface SyncStartResult {
  status: string;
  progress: string;
}

// ── Training Data Types ──
export interface TrainingDataEntry {
  id: string;
  category: "technical_knowledge" | "winning_tactics" | "lost_lessons";
  title: string;
  content: string;
  source_contacts: string[] | null;
  metadata: Record<string, unknown> | null;
  created_at: string | null;
}

export interface TrainingStatus {
  running: boolean;
  finished: boolean;
  progress: string;
  technical_entries: number;
  winning_entries: number;
  lost_entries: number;
  total_leads_analyzed: number;
  won_leads_analyzed: number;
  lost_leads_analyzed: number;
  errors: string[];
}

// ── API calls ──
export const api = {
  getStats: () => apiFetch<DashboardStats>("/api/dashboard/stats"),

  getRecentCalls: (limit = 10) =>
    apiFetch<ContactMemory[]>(`/api/dashboard/recent-calls?limit=${limit}`),

  getRejectionReasons: () =>
    apiFetch<RejectionReason[]>("/api/dashboard/rejection-reasons"),

  getPlaybook: (limit = 20) =>
    apiFetch<SalesPlaybookEntry[]>(`/api/dashboard/playbook?limit=${limit}`),

  getDealsChart: (days = 7) =>
    apiFetch<DealsChartDay[]>(`/api/dashboard/deals-chart?days=${days}`),

  syncGHL: (limit?: number, forceRefresh = false, forceAll = false) => {
    const params = new URLSearchParams();
    if (limit) params.set("limit", String(limit));
    if (forceRefresh) params.set("force_refresh", "true");
    if (forceAll) params.set("force_all", "true");
    const qs = params.toString();
    return apiFetch<SyncStartResult>(
      `/api/ghl/sync${qs ? `?${qs}` : ""}`,
      { method: "POST" }
    );
  },

  getSyncStatus: () =>
    apiFetch<SyncStatus>("/api/ghl/sync-status"),

  getContactConversations: (contactId: string) =>
    apiFetch<ContactConversationDetail>(
      `/api/dashboard/contact/${contactId}/conversations`
    ),

  getLeads: (status?: string, limit = 100, search?: string) =>
    apiFetch<ContactMemory[]>(
      `/api/dashboard/leads?limit=${limit}${status ? `&status=${status}` : ""}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    ),

  updateContact: (contactId: string, data: { deal_status?: string; notes?: string; revenue?: number | null }) =>
    apiFetch<{ id: string; deal_status: string; notes: string | null; revenue: number | null; rejection_reason: string | null; rejection_category: string | null; updated_at: string }>(
      `/api/dashboard/contact/${contactId}`,
      { method: "PATCH", body: JSON.stringify(data) }
    ),

  // ── Training Data ──
  generateTrainingData: () =>
    apiFetch<SyncStartResult>("/api/admin/generate-training", { method: "POST" }),

  getTrainingStatus: () =>
    apiFetch<TrainingStatus>("/api/admin/training-status"),

  getTrainingData: (category?: string) =>
    apiFetch<TrainingDataEntry[]>(
      `/api/dashboard/training-data${category ? `?category=${category}` : ""}`
    ),

  // ── Call Analysis Reports ──
  getReports: (search = "", limit = 50) =>
    apiFetch<CallAnalysisReport[]>(
      `/api/reports?limit=${limit}${search ? `&search=${encodeURIComponent(search)}` : ""}`
    ),

  getReportHtmlUrl: (reportId: string) =>
    `${API_BASE}/reports/${reportId}/html`,

  // ── Follow-Up Attribution ──
  getFollowUpAttribution: () =>
    apiFetch<FollowUpAttributionStats>("/api/admin/followup-attribution"),

  // ── Unified Contact ──
  getUnifiedContact: (identifier: string) =>
    apiFetch<UnifiedContact>(
      `/api/contacts/${encodeURIComponent(identifier)}/unified`
    ),
};

// ── Report Types ──
export interface CallAnalysisReport {
  id: string;
  ghl_contact_id: string;
  contact_name: string;
  call_date: string | null;
  call_duration: string | null;
  telegram_sent: boolean;
  created_at: string | null;
  call_status: string | null;
  project_type: string | null;
  lead_quality: string | null;
  total_score: number | null;
  score_rating: string | null;
}

// ── Unified Contact Types ──
export interface UnifiedTimelineItem {
  source: string;
  type: string;
  direction: string;
  sender: string;
  body: string;
  timestamp: string;
}

export interface UnifiedContactRecord {
  id: string;
  ghl_contact_id: string | null;
  name: string;
  phone: string;
  source: string | null;
  deal_status: string | null;
  service_requested: string | null;
  revenue: number | null;
  tags: string[] | null;
  notes: string | null;
  created_at: string;
}

export interface UnifiedMongoLead {
  id: string;
  source: string | null;
  status: string | null;
  wins: string | null;
  quoted_amount: number | null;
  convo_summary: string | null;
  created_at: string;
}

export interface UnifiedThumbtackMeta {
  url: string | null;
  service: string | null;
  location: string | null;
  status: string | null;
}

export interface UnifiedContactMeta {
  ghl_message_count: number;
  zelle_payment_count: number;
  has_thumbtack: boolean;
  mongo_error: string | null;
}

export interface UnifiedContact {
  contact: UnifiedContactRecord;
  mongodb_lead: UnifiedMongoLead | null;
  shadow_context: string | null;
  thumbtack_conversation: string | null;
  thumbtack_meta: UnifiedThumbtackMeta | null;
  timeline: UnifiedTimelineItem[];
  meta: UnifiedContactMeta;
}

// ── Follow-Up Attribution Types ──
export interface FollowUpAttributedContact {
  id: string;
  customer_name: string;
  phone_number: string;
  service_requested: string | null;
  revenue: number | null;
  followup_count: number;
  last_followup_sent_at: string | null;
  deal_closed_at: string;
  created_at: string;
  lead_source: string | null;
  attribution_confidence: "high" | "medium";
}

export interface FollowUpAttributionStats {
  total_followup_conversions: number;
  high_confidence_count: number;
  medium_confidence_count: number;
  total_attributed_revenue: number;
  high_confidence_revenue: number;
  conversion_rate: number;
  total_leads_followed_up: number;
  contacts: FollowUpAttributedContact[];
}
