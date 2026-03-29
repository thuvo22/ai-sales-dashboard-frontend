"use client";

import { useState } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import type { SalesPlaybookEntry, ContactConversationDetail } from "@/lib/api";
import { api } from "@/lib/api";
import ConversationModal from "./ConversationModal";

interface PlaybookTableProps {
  entries: SalesPlaybookEntry[];
}

export default function PlaybookTable({ entries }: PlaybookTableProps) {
  const [selectedDetail, setSelectedDetail] =
    useState<ContactConversationDetail | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEntryClick = async (entry: SalesPlaybookEntry) => {
    if (!entry.contact_id) return;
    setLoadingId(entry.id);
    try {
      const detail = await api.getContactConversations(entry.contact_id);
      setSelectedDetail(detail);
    } catch (err) {
      console.error("Failed to load conversation:", err);
    } finally {
      setLoadingId(null);
    }
  };

  return (
    <>
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-gray-400">
          <Lightbulb className="h-4 w-4 text-amber-400" />
          AI Lessons Learned (Playbook)
        </h3>

        {entries.length === 0 ? (
          <div className="flex h-32 items-center justify-center text-gray-600">
            No playbook entries yet
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <button
                key={entry.id}
                onClick={() => handleEntryClick(entry)}
                disabled={!entry.contact_id || loadingId === entry.id}
                className={`w-full rounded-lg border border-[#1e1e2e]/60 bg-[#0d0d14] p-4 text-left transition-colors ${
                  entry.contact_id
                    ? "cursor-pointer hover:border-brand-500/40 hover:bg-[#111120]"
                    : "cursor-default"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-brand-400">
                    {entry.scenario}
                  </span>
                  <div className="flex items-center gap-2">
                    {loadingId === entry.id && (
                      <Loader2 className="h-3 w-3 animate-spin text-brand-400" />
                    )}
                    <span className="text-xs text-gray-600">
                      {new Date(entry.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-gray-300">
                  {entry.successful_tactic}
                </p>
                {entry.contact_id && (
                  <span className="mt-2 inline-block text-[10px] text-gray-600">
                    Click to view conversation &rarr;
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Conversation Detail Modal */}
      {selectedDetail && (
        <ConversationModal
          detail={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onUpdated={() => {}}
        />
      )}
    </>
  );
}
