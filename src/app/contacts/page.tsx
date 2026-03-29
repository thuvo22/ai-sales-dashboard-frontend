"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Search,
  Users,
  ArrowLeft,
  Loader2,
  Phone,
  ChevronRight,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  api,
  type ContactMemory,
  type UnifiedContact,
} from "@/lib/api";
import UnifiedContactView from "@/components/UnifiedContactView";

const statusColors: Record<string, string> = {
  WON: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  NOT_A_VALID_LEAD:
    "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

export default function ContactsPage() {
  // ── List state ──
  const [contacts, setContacts] = useState<ContactMemory[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");

  // ── Detail state ──
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [unified, setUnified] = useState<UnifiedContact | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // ── Load contacts list ──
  const loadContacts = useCallback(async () => {
    setListLoading(true);
    try {
      const data = await api.getLeads(
        statusFilter || undefined,
        200,
        searchQuery || undefined
      );
      setContacts(data);
    } catch (e) {
      console.error("Failed to load contacts:", e);
    } finally {
      setListLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // ── Search debounce ──
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(debouncedSearch), 400);
    return () => clearTimeout(t);
  }, [debouncedSearch]);

  // ── Open unified view ──
  const openContact = useCallback(async (contact: ContactMemory) => {
    setSelectedId(contact.id);
    setDetailLoading(true);
    setDetailError(null);
    setUnified(null);
    try {
      // Try phone first, fall back to name
      const identifier = contact.phone_number || contact.customer_name;
      const data = await api.getUnifiedContact(identifier);
      setUnified(data);
    } catch (err) {
      setDetailError(
        err instanceof Error ? err.message : "Failed to load contact"
      );
    } finally {
      setDetailLoading(false);
    }
  }, []);

  const closeDetail = () => {
    setSelectedId(null);
    setUnified(null);
    setDetailError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="border-b border-[#1e1e2e] bg-[#0d0d14]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-600/20 p-2">
              <Users className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Contacts
              </h1>
              <p className="text-xs text-gray-500">
                {contacts.length} contacts · Unified view across all
                platforms
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a3e] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-[#3a3a4e] hover:text-gray-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        {/* ── Filters ── */}
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              placeholder="Search by name or phone…"
              className="w-full rounded-xl border border-[#2a2a3e] bg-[#1a1a28] py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500"
            />
          </div>
          <div className="flex gap-1.5">
            {["", "PENDING", "WON", "LOST"].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  statusFilter === s
                    ? "border-brand-500 bg-brand-600/20 text-brand-300"
                    : "border-[#2a2a3e] text-gray-500 hover:border-gray-500 hover:text-gray-300"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Contact List ── */}
        {listLoading ? (
          <div className="space-y-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-16 animate-pulse rounded-xl bg-[#12121a]"
              />
            ))}
          </div>
        ) : contacts.length === 0 ? (
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] px-6 py-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-700" />
            <p className="text-sm text-gray-500">No contacts found</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {contacts.map((c) => (
              <button
                key={c.id}
                onClick={() => openContact(c)}
                className={`flex w-full items-center gap-4 rounded-xl border px-4 py-3 text-left transition-all ${
                  selectedId === c.id
                    ? "border-brand-500/50 bg-brand-600/10"
                    : "border-[#1e1e2e] bg-[#12121a] hover:border-[#2a2a3e] hover:bg-[#15151f]"
                }`}
              >
                {/* Avatar */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1a1a28] text-sm font-bold text-gray-400">
                  {(c.customer_name || "?")[0]?.toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-medium text-white">
                      {c.customer_name || "Unknown"}
                    </span>
                    {c.lead_source && (
                      <span className="shrink-0 rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                        {c.lead_source}
                      </span>
                    )}
                    {c.revenue != null && c.revenue > 0 && (
                      <span className="shrink-0 text-xs text-emerald-400">
                        ${c.revenue.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {c.phone_number}
                    </span>
                    {c.service_requested && (
                      <span className="truncate">
                        {c.service_requested}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <span
                  className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${
                    statusColors[c.deal_status] ||
                    "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  }`}
                >
                  {c.deal_status}
                </span>

                <ChevronRight className="h-4 w-4 shrink-0 text-gray-600" />
              </button>
            ))}
          </div>
        )}
      </main>

      {/* ── Unified Detail Modal ── */}
      {selectedId && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 p-4 pt-10 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl rounded-2xl border border-[#1e1e2e] bg-[#0d0d14] shadow-2xl">
            {/* Close button */}
            <button
              onClick={closeDetail}
              className="absolute right-4 top-4 z-10 rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e1e2e] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-6">
              {detailLoading && (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
                </div>
              )}
              {detailError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                  {detailError}
                </div>
              )}
              {!detailLoading && unified && (
                <UnifiedContactView data={unified} />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
