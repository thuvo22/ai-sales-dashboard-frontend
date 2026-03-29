"use client";

import { useState } from "react";
import {
  Phone,
  User,
  MessageSquare,
  PhoneCall,
  DollarSign,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Building2,
  Tag,
  Calendar,
  CheckCircle2,
  Circle,
} from "lucide-react";
import type {
  UnifiedContact,
  UnifiedTimelineItem,
} from "@/lib/api";

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatTimestamp(ts: string): string {
  if (!ts) return "";
  try {
    return new Date(ts).toLocaleString("en-US", {
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

function isCallType(type: string): boolean {
  const t = type.toLowerCase();
  return t.includes("call") || t.includes("voicemail") || t.includes("voice");
}

function isZelleType(source: string, type: string): boolean {
  return source.toLowerCase() === "zelle" || type.toLowerCase().includes("payment");
}

const STATUS_COLORS: Record<string, string> = {
  WON: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LOST: "bg-red-500/20 text-red-400 border-red-500/30",
  PENDING: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  NOT_A_VALID_LEAD: "bg-gray-500/20 text-gray-400 border-gray-500/30",
};

// ── Sub-components ────────────────────────────────────────────────────────────

function PlatformBadge({
  label,
  active,
  count,
}: {
  label: string;
  active: boolean;
  count?: number;
}) {
  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? "border-brand-500/30 bg-brand-500/10 text-brand-400"
          : "border-[#2a2a3e] bg-transparent text-gray-600"
      }`}
    >
      {active ? (
        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
      ) : (
        <Circle className="h-3 w-3" />
      )}
      {label}
      {active && count != null && (
        <span className="ml-0.5 rounded-full bg-brand-500/20 px-1.5 py-0.5 text-[10px]">
          {count}
        </span>
      )}
    </div>
  );
}

function CallBar({ item }: { item: UnifiedTimelineItem }) {
  const [expanded, setExpanded] = useState(false);
  const isOutbound = item.direction === "outbound";
  const hasBody = !!item.body;

  return (
    <div className="flex justify-center">
      <div className="w-full">
        <div
          className={`flex flex-wrap items-center justify-center gap-2 rounded-lg border border-purple-500/20 bg-purple-500/10 px-4 py-2 text-xs text-purple-300 ${
            hasBody ? "cursor-pointer hover:bg-purple-500/15" : ""
          }`}
          onClick={() => hasBody && setExpanded(!expanded)}
        >
          <PhoneCall className="h-3.5 w-3.5" />
          <span className="font-medium">
            {isOutbound ? "Outbound Call" : "Inbound Call"}
          </span>
          <span className="text-purple-500">{formatTimestamp(item.timestamp)}</span>
          <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] text-purple-400">
            {item.source}
          </span>
          {hasBody && (
            <span className="text-[10px] text-purple-400/60">
              {expanded ? "▲ hide" : "▼ transcript"}
            </span>
          )}
        </div>
        {expanded && item.body && (
          <div className="mx-4 mt-1 rounded-b-lg border border-t-0 border-purple-500/10 bg-[#12121c] px-4 py-3 text-xs leading-relaxed text-gray-300">
            <div className="max-h-60 overflow-y-auto whitespace-pre-wrap">{item.body}</div>
          </div>
        )}
      </div>
    </div>
  );
}

function ZelleCard({ item }: { item: UnifiedTimelineItem }) {
  return (
    <div className="flex justify-center">
      <div className="flex items-center gap-3 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs">
        <DollarSign className="h-4 w-4 text-emerald-400" />
        <div>
          <span className="font-semibold text-emerald-400">Zelle Payment</span>
          {item.body && (
            <span className="ml-2 text-emerald-300">{item.body}</span>
          )}
        </div>
        <span className="text-emerald-600">{formatTimestamp(item.timestamp)}</span>
      </div>
    </div>
  );
}

function SmsBubble({ item }: { item: UnifiedTimelineItem }) {
  const isOutbound = item.direction === "outbound";
  return (
    <div className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
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
          <span className="font-medium">{item.sender || (isOutbound ? "OnPoint" : "Customer")}</span>
          <span className="flex items-center gap-1 uppercase">
            <MessageSquare className="h-2.5 w-2.5" />
            {item.type}
          </span>
          <span className="rounded-full bg-[#1e1e2e] px-1.5">{item.source}</span>
          <span>{formatTimestamp(item.timestamp)}</span>
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed">
          {item.body || "(empty)"}
        </p>
      </div>
    </div>
  );
}

function TimelineItem({ item }: { item: UnifiedTimelineItem }) {
  if (isZelleType(item.source, item.type)) return <ZelleCard item={item} />;
  if (isCallType(item.type)) return <CallBar item={item} />;
  return <SmsBubble item={item} />;
}

function CollapsibleSection({
  title,
  icon: Icon,
  defaultOpen = false,
  children,
  accentClass = "text-brand-400",
}: {
  title: string;
  icon: React.ElementType;
  defaultOpen?: boolean;
  children: React.ReactNode;
  accentClass?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a]">
      <button
        onClick={() => setOpen(!open)}
        className={`flex w-full items-center gap-2 px-5 py-4 text-sm font-semibold transition-colors hover:bg-[#1a1a28]/40 ${accentClass}`}
      >
        <Icon className="h-4 w-4" />
        {title}
        <span className="ml-auto">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </span>
      </button>
      {open && <div className="border-t border-[#1e1e2e] px-5 py-4">{children}</div>}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function UnifiedContactView({ data }: { data: UnifiedContact }) {
  const { contact, mongodb_lead, shadow_context, thumbtack_conversation, thumbtack_meta, timeline, meta } = data;
  const statusColor = contact.deal_status ? (STATUS_COLORS[contact.deal_status] ?? STATUS_COLORS["PENDING"]) : STATUS_COLORS["PENDING"];

  return (
    <div className="space-y-5">
      {/* ── Contact Header ── */}
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] px-6 py-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">{contact.name}</h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-gray-400">
                <Phone className="h-3 w-3" />
                {contact.phone}
              </span>
              {contact.service_requested && (
                <span className="text-gray-500">{contact.service_requested}</span>
              )}
              <span className="flex items-center gap-1 text-gray-600">
                <Calendar className="h-3 w-3" />
                {new Date(contact.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {contact.deal_status && (
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase ${statusColor}`}>
                {contact.deal_status.replace(/_/g, " ")}
              </span>
            )}
            {contact.source && (
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-400">
                {contact.source}
              </span>
            )}
            {contact.revenue != null && (
              <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <DollarSign className="h-3 w-3" />
                {contact.revenue.toLocaleString("en-US", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                })}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {contact.tags && contact.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <Tag className="h-3 w-3 text-gray-600" />
            {contact.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-orange-500/30 bg-orange-500/10 px-2 py-0.5 text-[10px] font-semibold text-orange-400"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Notes */}
        {contact.notes && (
          <div className="mt-3 rounded-xl border border-[#2a2a3e] bg-[#1a1a28] px-3 py-2 text-xs text-gray-400">
            {contact.notes}
          </div>
        )}
      </div>

      {/* ── Platform Indicators ── */}
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] px-6 py-4">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Data Sources
        </p>
        <div className="flex flex-wrap gap-2">
          <PlatformBadge
            label="GHL"
            active={meta.ghl_message_count > 0}
            count={meta.ghl_message_count}
          />
          <PlatformBadge
            label="MongoDB"
            active={!!mongodb_lead}
          />
          <PlatformBadge
            label="Thumbtack"
            active={meta.has_thumbtack}
          />
          <PlatformBadge
            label="Shadow"
            active={!!shadow_context}
          />
          {meta.zelle_payment_count > 0 && (
            <PlatformBadge
              label="Zelle"
              active
              count={meta.zelle_payment_count}
            />
          )}
        </div>
        {meta.mongo_error && (
          <p className="mt-2 text-xs text-amber-500/80">⚠ MongoDB: {meta.mongo_error}</p>
        )}
      </div>

      {/* ── MongoDB Lead Info ── */}
      {mongodb_lead && (
        <CollapsibleSection
          title="MongoDB Lead"
          icon={User}
          defaultOpen
          accentClass="text-violet-400"
        >
          <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
            {mongodb_lead.source && (
              <div>
                <p className="text-xs text-gray-500">Source</p>
                <p className="font-medium text-gray-300">{mongodb_lead.source}</p>
              </div>
            )}
            {mongodb_lead.status && (
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="font-medium text-gray-300">{mongodb_lead.status}</p>
              </div>
            )}
            {mongodb_lead.quoted_amount != null && (
              <div>
                <p className="text-xs text-gray-500">Quoted</p>
                <p className="font-medium text-emerald-400">
                  ${mongodb_lead.quoted_amount.toLocaleString()}
                </p>
              </div>
            )}
            {mongodb_lead.wins && (
              <div className="col-span-2 sm:col-span-4">
                <p className="text-xs text-gray-500">Wins</p>
                <p className="font-medium text-amber-300">{mongodb_lead.wins}</p>
              </div>
            )}
            {mongodb_lead.convo_summary && (
              <div className="col-span-2 sm:col-span-4">
                <p className="mb-1 text-xs text-gray-500">Conversation Summary</p>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
                  {mongodb_lead.convo_summary}
                </p>
              </div>
            )}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Thumbtack Panel ── */}
      {(thumbtack_conversation || thumbtack_meta) && (
        <CollapsibleSection
          title="Thumbtack"
          icon={MessageSquare}
          defaultOpen
          accentClass="text-sky-400"
        >
          {thumbtack_meta && (
            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs">
              {thumbtack_meta.service && (
                <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-1 text-sky-300">
                  {thumbtack_meta.service}
                </span>
              )}
              {thumbtack_meta.location && (
                <span className="text-gray-400">{thumbtack_meta.location}</span>
              )}
              {thumbtack_meta.status && (
                <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-amber-300">
                  {thumbtack_meta.status}
                </span>
              )}
              {thumbtack_meta.url && (
                <a
                  href={thumbtack_meta.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-brand-400 hover:text-brand-300"
                >
                  <ExternalLink className="h-3 w-3" />
                  View on Thumbtack
                </a>
              )}
            </div>
          )}
          {thumbtack_conversation && (
            <div className="max-h-72 overflow-y-auto rounded-xl border border-[#2a2a3e] bg-[#0a0a0f] p-4 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
              {thumbtack_conversation}
            </div>
          )}
        </CollapsibleSection>
      )}

      {/* ── Shadow Outreach Panel ── */}
      {shadow_context && (
        <CollapsibleSection
          title="Shadow Outreach"
          icon={User}
          defaultOpen={false}
          accentClass="text-purple-400"
        >
          <div className="max-h-72 overflow-y-auto rounded-xl border border-[#2a2a3e] bg-[#0a0a0f] p-4 text-sm leading-relaxed text-gray-300 whitespace-pre-wrap">
            {shadow_context}
          </div>
        </CollapsibleSection>
      )}

      {/* ── Unified Timeline ── */}
      <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a]">
        <div className="flex items-center gap-2 border-b border-[#1e1e2e] px-6 py-4">
          <MessageSquare className="h-4 w-4 text-gray-400" />
          <h3 className="text-sm font-semibold text-gray-300">
            Unified Timeline
          </h3>
          <span className="ml-1 rounded-full bg-[#1e1e2e] px-2 py-0.5 text-[10px] text-gray-500">
            {timeline.length} events
          </span>
        </div>
        <div className="px-6 py-4">
          {timeline.length === 0 ? (
            <div className="flex h-24 items-center justify-center text-sm text-gray-600">
              No timeline events found
            </div>
          ) : (
            <div className="space-y-3">
              {timeline.map((item, i) => (
                <TimelineItem key={i} item={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
