"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Phone,
  MessageSquare,
  PhoneCall,
  Search,
  Ban,
} from "lucide-react";
import {
  api,
  type ContactMemory,
  type ContactConversationDetail,
} from "@/lib/api";
import ConversationModal from "./ConversationModal";

type StatusFilter = "ALL" | "WON" | "LOST" | "PENDING" | "NOT_A_VALID_LEAD";

const tabs: { label: string; value: StatusFilter; icon: React.ElementType; color: string }[] = [
  { label: "All Leads", value: "ALL", icon: Users, color: "text-gray-400 border-gray-500" },
  { label: "Won", value: "WON", icon: CheckCircle, color: "text-emerald-400 border-emerald-500" },
  { label: "Lost", value: "LOST", icon: XCircle, color: "text-red-400 border-red-500" },
  { label: "Pending", value: "PENDING", icon: Clock, color: "text-amber-400 border-amber-500" },
  { label: "Invalid", value: "NOT_A_VALID_LEAD", icon: Ban, color: "text-gray-500 border-gray-600" },
];

const statusBadge: Record<string, string> = {
  WON: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  LOST: "bg-red-500/10 text-red-400 border-red-500/20",
  PENDING: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  NOT_A_VALID_LEAD: "bg-gray-500/10 text-gray-400 border-gray-500/20",
};

export default function LeadStatusBoard() {
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [leads, setLeads] = useState<ContactMemory[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedDetail, setSelectedDetail] =
    useState<ContactConversationDetail | null>(null);
  const [loadingContactId, setLoadingContactId] = useState<string | null>(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchLeads = useCallback(async (status: StatusFilter, search?: string) => {
    setLoading(true);
    try {
      const data = await api.getLeads(
        status === "ALL" ? undefined : status,
        5000,
        search || undefined,
      );
      setLeads(data);
    } catch (err) {
      console.error("Failed to load leads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeads(filter, debouncedSearch);
  }, [filter, debouncedSearch, fetchLeads]);

  const handleLeadClick = async (lead: ContactMemory) => {
    setLoadingContactId(lead.id);
    try {
      const detail = await api.getContactConversations(lead.id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoadingContactId(null);
    }
  };

  // Count per status for tab badges
  const counts = {
    ALL: leads.length,
    WON: leads.filter((l) => l.deal_status === "WON").length,
    LOST: leads.filter((l) => l.deal_status === "LOST").length,
    PENDING: leads.filter((l) => l.deal_status === "PENDING").length,
    NOT_A_VALID_LEAD: leads.filter((l) => l.deal_status === "NOT_A_VALID_LEAD").length,
  };

  // Get summary snippet for hover
  const getSummarySnippet = (lead: ContactMemory): string | null => {
    const s = lead.latest_summary as Record<string, string> | null;
    return s?.summary || s?.customer_problem || null;
  };

  return (
    <>
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
        {/* Section Header */}
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Users className="h-4 w-4 text-brand-400" />
          Lead Status Board
          <span className="ml-auto text-xs font-normal normal-case text-gray-600">
            Click a lead to view SMS &amp; call history
          </span>
        </h3>

        {/* Filter Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = filter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all ${
                  active
                    ? `bg-[#1a1a28] ${tab.color} border`
                    : "border border-transparent text-gray-500 hover:text-gray-400"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
                {filter === "ALL" && (
                  <span className="ml-1 rounded-full bg-[#1e1e2e] px-1.5 py-0.5 text-[10px]">
                    {counts[tab.value]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by lead name…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-[#1e1e2e] bg-[#0a0a0f] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500 hover:text-gray-300"
            >
              Clear
            </button>
          )}
        </div>

        {/* Leads List */}
        {loading ? (
          <div className="flex h-40 items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-brand-400" />
          </div>
        ) : leads.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-600">
            No leads found
          </div>
        ) : (
          <div className="max-h-[500px] space-y-2 overflow-y-auto pr-1">
            {leads.map((lead) => {
              const snippet = getSummarySnippet(lead);
              const isLoading = loadingContactId === lead.id;
              return (
                <button
                  key={lead.id}
                  onClick={() => handleLeadClick(lead)}
                  disabled={isLoading}
                  className="group flex w-full items-center gap-3 rounded-lg border border-[#1e1e2e]/60 bg-[#0d0d14] p-3 text-left transition-all hover:border-brand-500/30 hover:bg-[#111120]"
                >
                  {/* Status Dot */}
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                      statusBadge[lead.deal_status] ?? statusBadge.PENDING
                    }`}
                  >
                    {lead.deal_status === "WON" && (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    {lead.deal_status === "LOST" && (
                      <XCircle className="h-4 w-4" />
                    )}
                    {lead.deal_status === "PENDING" && (
                      <Clock className="h-4 w-4" />
                    )}
                    {lead.deal_status === "NOT_A_VALID_LEAD" && (
                      <Ban className="h-4 w-4" />
                    )}
                  </div>

                  {/* Lead Info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-medium text-white">
                        {lead.customer_name}
                      </span>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                          statusBadge[lead.deal_status] ??
                          statusBadge.PENDING
                        }`}
                      >
                        {lead.deal_status}
                      </span>
                      {lead.tags?.includes("Bad Lead") && (
                        <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400">
                          Bad Lead
                        </span>
                      )}
                      {lead.lead_source && (
                        <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                          {lead.lead_source}
                        </span>
                      )}
                      {lead.deal_status === "WON" && lead.revenue != null && (
                        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          ${lead.revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                      {lead.deal_status === "WON" && lead.revenue == null && (
                        <span className="rounded-full border border-gray-600/30 bg-gray-600/10 px-2 py-0.5 text-[10px] text-gray-500">
                          no revenue set
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {lead.phone_number}
                      </span>
                      {lead.service_requested && (
                        <span className="truncate">
                          {lead.service_requested}
                        </span>
                      )}
                      {lead.deal_status !== "WON" && lead.revenue != null && (
                        <span className="font-semibold text-emerald-400">
                          ${lead.revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                        </span>
                      )}
                    </div>
                    {snippet && (
                      <p className="mt-1 truncate text-xs text-gray-600">
                        {snippet}
                      </p>
                    )}
                  </div>

                  {/* Right side — date + icons */}
                  <div className="flex flex-shrink-0 flex-col items-end gap-1">
                    <span className="text-[10px] text-gray-600">
                      {new Date(lead.last_activity_at || lead.updated_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-1 text-gray-600">
                      <MessageSquare className="h-3 w-3" />
                      <PhoneCall className="h-3 w-3" />
                    </div>
                    {isLoading && (
                      <Loader2 className="h-3 w-3 animate-spin text-brand-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedDetail && (
        <ConversationModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onUpdated={() => fetchLeads(filter, debouncedSearch)}
        />
      )}
    </>
  );
}
