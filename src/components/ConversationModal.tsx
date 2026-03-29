"use client";

import { useState } from "react";
import {
  X,
  Phone,
  PhoneCall,
  MessageSquare,
  User,
  Building2,
  Save,
  Check,
  StickyNote,
  Maximize2,
  Minimize2,
  ChevronDown,
  ChevronRight,
  DollarSign,
} from "lucide-react";
import type { ContactConversationDetail, ConversationMessage } from "@/lib/api";
import { api } from "@/lib/api";

interface ConversationModalProps {
  detail: ContactConversationDetail;
  onClose: () => void;
  onUpdated?: () => void;
}

const statusColors: Record<string, string> = {
  WON: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  try {
    const d = new Date(ts);
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return ts;
  }
}

function isCallType(msgType: string): boolean {
  const t = msgType.toLowerCase();
  return t.includes("call") || t.includes("voicemail") || t.includes("voice");
}

/** Hover tooltip for call messages showing a summary snippet */
function CallTooltip({ msg }: { msg: ConversationMessage }) {
  const body = msg.body || "(no transcript)";
  const preview =
    body.length > 200 ? body.slice(0, 200) + "…" : body;
  return (
    <div className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-72 -translate-x-1/2 rounded-lg border border-[#2a2a3e] bg-[#15151f] px-4 py-3 text-xs text-gray-300 shadow-2xl">
      <div className="mb-1 flex items-center gap-1.5 font-semibold text-brand-400">
        <PhoneCall className="h-3 w-3" />
        Call Summary
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{preview}</p>
      <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-[#2a2a3e] bg-[#15151f]" />
    </div>
  );
}

/**
 * Parse call body that may contain transcript.
 * Format: "Phone call — status (dur)\n\n--- Transcript ---\nSpeaker 1: ...\nSpeaker 2: ..."
 */
function parseCallBody(body: string): { header: string; transcript: string | null } {
  const sep = "\n\n--- Transcript ---\n";
  const idx = body.indexOf(sep);
  if (idx === -1) return { header: body, transcript: null };
  return {
    header: body.slice(0, idx),
    transcript: body.slice(idx + sep.length),
  };
}

/** Individual message bubble – SMS shows inline text, Call shows compact + expandable transcript */
function MessageBubble({
  msg,
  isOutbound,
  isCall,
}: {
  msg: ConversationMessage;
  isOutbound: boolean;
  isCall: boolean;
}) {
  const [expanded, setExpanded] = useState(false);

  if (isCall) {
    const { header, transcript } = parseCallBody(msg.body || "");
    const hasTranscript = !!transcript;

    return (
      <div className="flex justify-center">
        <div className="w-full max-w-[90%]">
          {/* Call header bar */}
          <div
            className={`flex items-center justify-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs text-purple-300 ${hasTranscript ? "cursor-pointer hover:bg-purple-500/15" : ""}`}
            onClick={() => hasTranscript && setExpanded(!expanded)}
          >
            <PhoneCall className="h-3.5 w-3.5" />
            <span className="font-medium">
              {isOutbound ? "Outbound Call" : "Inbound Call"}
            </span>
            <span className="text-purple-400">{header}</span>
            <span className="text-purple-500">
              {formatTimestamp(msg.timestamp)}
            </span>
            {hasTranscript && (
              <span className="ml-1 text-[10px] text-purple-400/70">
                {expanded ? "▲ hide transcript" : "▼ show transcript"}
              </span>
            )}
            {!hasTranscript && (
              <span className="text-[10px] text-purple-500/60">
                (no transcript available)
              </span>
            )}
          </div>
          {/* Expandable transcript */}
          {expanded && transcript && (
            <div className="mx-4 mt-1 rounded-b-lg border border-t-0 border-purple-500/10 bg-[#12121c] px-4 py-3 text-xs leading-relaxed text-gray-300">
              <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-purple-400/80">
                <Phone className="h-3 w-3" />
                Call Transcript
              </div>
              <div className="max-h-60 space-y-1 overflow-y-auto whitespace-pre-wrap">
                {transcript.split("\n").map((line, i) => {
                  const isSpeaker1 = line.startsWith("Speaker 1:");
                  const isSpeaker2 = line.startsWith("Speaker 2:");
                  return (
                    <p
                      key={i}
                      className={
                        isSpeaker1
                          ? "text-brand-300"
                          : isSpeaker2
                          ? "text-gray-400"
                          : "text-gray-500"
                      }
                    >
                      {line}
                    </p>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // SMS messages: chat-style bubbles
  return (
    <div
      className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[80%] rounded-xl px-4 py-2.5 ${
          isOutbound
            ? "bg-brand-600/20 text-brand-200"
            : "bg-[#1a1a28] text-gray-300"
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-[10px] text-gray-500">
          {isOutbound ? (
            <Building2 className="h-3 w-3" />
          ) : (
            <User className="h-3 w-3" />
          )}
          <span className="font-medium">{msg.sender}</span>
          <span className="flex items-center gap-1 uppercase">
            <MessageSquare className="h-2.5 w-2.5" />
            {msg.msg_type}
          </span>
          <span>{formatTimestamp(msg.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {msg.body || "(empty)"}
        </p>
      </div>
    </div>
  );
}

export default function ConversationModal({
  detail,
  onClose,
  onUpdated,
}: ConversationModalProps) {
  const summary = detail.latest_summary as Record<string, string> | null;
  const [status, setStatus] = useState(detail.deal_status);
  const [notes, setNotes] = useState(detail.notes || "");
  const [revenue, setRevenue] = useState<string>(
    detail.revenue != null ? String(detail.revenue) : ""
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(true);
  const [rejCategory, setRejCategory] = useState<string | null>(detail.rejection_category);
  const [rejReason, setRejReason] = useState<string | null>(detail.rejection_reason);

  const revenueNum = revenue.trim() ? parseFloat(revenue) : null;
  const hasChanges =
    status !== detail.deal_status ||
    notes !== (detail.notes || "") ||
    revenueNum !== detail.revenue;

  async function handleSave() {
    setSaving(true);
    setSaved(false);
    try {
      const res = await api.updateContact(detail.contact_id, {
        deal_status: status,
        notes: notes || undefined,
        revenue: revenueNum ?? undefined,
      });
      setRejCategory(res.rejection_category);
      setRejReason(res.rejection_reason);
      setSaved(true);
      onUpdated?.();
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error("Failed to save:", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div
        className={`relative flex flex-col overflow-hidden border border-[#1e1e2e] bg-[#0d0d14] shadow-2xl transition-all duration-200 ${
          maximized
            ? "h-full w-full rounded-none"
            : "max-h-[90vh] w-full max-w-3xl rounded-2xl"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1e1e2e] px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-white">
              {detail.customer_name}
            </h2>
            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                {detail.phone_number}
              </span>
              {detail.service_requested && (
                <span>{detail.service_requested}</span>
              )}
              {detail.tags?.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400"
                >
                  {tag}
                </span>
              ))}
              {detail.lead_source && (
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                  {detail.lead_source}
                </span>
              )}
              {detail.revenue != null && (
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                  ${detail.revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMaximized(!maximized)}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e1e2e] hover:text-white"
              title={maximized ? "Restore" : "Maximize"}
            >
              {maximized ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-[#1e1e2e] hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Editable Status & Notes */}
        <div className="border-b border-[#1e1e2e] px-6 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Status selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Status
              </span>
              <div className="flex gap-1">
                {(["WON", "LOST", "PENDING"] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatus(s)}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase transition-all ${
                      status === s
                        ? statusColors[s]
                        : "border-[#2a2a3e] text-gray-600 hover:border-gray-500 hover:text-gray-400"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Save button */}
            {hasChanges && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500 disabled:opacity-50"
              >
                <Save className="h-3 w-3" />
                {saving ? "Saving…" : "Save Changes"}
              </button>
            )}
            {saved && (
              <span className="flex items-center gap-1 text-xs text-emerald-400">
                <Check className="h-3 w-3" />
                Saved
              </span>
            )}
          </div>

          {/* Notes */}
          <div className="mt-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <StickyNote className="h-3 w-3" />
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={status === "LOST" ? "Why was this deal lost? (auto-categorized on save)" : "Add notes about this lead…"}
              rows={2}
              className="w-full resize-none rounded-lg border border-[#2a2a3e] bg-[#12121c] px-3 py-2 text-sm text-gray-300 placeholder-gray-600 outline-none transition-colors focus:border-brand-500"
            />
          </div>

          {/* Revenue */}
          <div className="mt-3">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
              <DollarSign className="h-3 w-3" />
              Revenue
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                min="0"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-[#2a2a3e] bg-[#12121c] py-2 pl-7 pr-3 text-sm text-emerald-400 placeholder-gray-600 outline-none transition-colors focus:border-brand-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              />
            </div>
          </div>

          {/* Show rejection category badge after save */}
          {rejCategory && status === "LOST" && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs text-gray-500">Category:</span>
              <span className="inline-block rounded-full bg-red-500/20 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/30">
                {rejCategory}
              </span>
            </div>
          )}
        </div>

        {/* AI Summary — collapsible */}
        {summary && (
          <div className="border-b border-[#1e1e2e] px-6 py-3">
            <button
              onClick={() => setSummaryOpen(!summaryOpen)}
              className="flex w-full items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-400 hover:text-brand-300 transition-colors"
            >
              {summaryOpen ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
              AI Audit Summary
            </button>
            {summaryOpen && (
            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              {summary.customer_problem && (
                <div>
                  <span className="text-gray-500">Problem: </span>
                  <span className="text-gray-300">
                    {summary.customer_problem}
                  </span>
                </div>
              )}
              {summary.customer_sentiment && (
                <div>
                  <span className="text-gray-500">Sentiment: </span>
                  <span className="text-gray-300">
                    {summary.customer_sentiment}
                  </span>
                </div>
              )}
              {(summary.rejection_reason || rejReason) && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Rejection: </span>
                  {rejCategory && (
                    <span className="mr-2 inline-block rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                      {rejCategory}
                    </span>
                  )}
                  <span className="text-red-400/80 text-sm">
                    {rejReason || summary.rejection_reason}
                  </span>
                </div>
              )}
              {summary.lessons_learned && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Lesson: </span>
                  <span className="text-amber-300">
                    {summary.lessons_learned}
                  </span>
                </div>
              )}
              {summary.summary && (
                <div className="sm:col-span-2">
                  <span className="text-gray-500">Summary: </span>
                  <span className="text-gray-300">{summary.summary}</span>
                </div>
              )}
            </div>
            )}
          </div>
        )}

        {/* Conversation Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            <MessageSquare className="h-4 w-4" />
            Conversation ({detail.messages.length} messages)
          </h3>

          {detail.messages.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-gray-600">
              No messages found for this contact
            </div>
          ) : (
            <div className="space-y-3">
              {detail.messages.map((msg, i) => {
                const isOutbound = msg.direction === "outbound";
                const isCall = isCallType(msg.msg_type);
                return (
                  <MessageBubble
                    key={i}
                    msg={msg}
                    isOutbound={isOutbound}
                    isCall={isCall}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e1e2e] px-6 py-3 text-center text-xs text-gray-600">
          Contact created{" "}
          {new Date(detail.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>
    </div>
  );
}
