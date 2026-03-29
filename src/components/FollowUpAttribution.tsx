"use client";

import { useEffect, useState } from "react";
import { MessageSquare, TrendingUp, DollarSign, Users, ChevronDown, ChevronUp } from "lucide-react";
import { api, type FollowUpAttributionStats } from "@/lib/api";

export default function FollowUpAttribution() {
  const [data, setData] = useState<FollowUpAttributionStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    api.getFollowUpAttribution()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return null; // Silently hide if endpoint errors
  if (!data) return null;

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2">
            <MessageSquare className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white">Follow-Up Attribution</h2>
            <p className="text-xs text-gray-500">Leads that converted after receiving follow-up messages</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-[#1e1e2e] hover:text-white transition-colors"
        >
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* Summary stats row */}
      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-[#0a0a0f] p-3">
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs text-gray-500">Leads Followed Up</p>
          </div>
          <p className="mt-1 text-xl font-bold text-white">{data.total_leads_followed_up}</p>
        </div>
        <div className="rounded-lg bg-[#0a0a0f] p-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-green-400" />
            <p className="text-xs text-gray-500">Converted</p>
          </div>
          <p className="mt-1 text-xl font-bold text-white">{data.total_followup_conversions}</p>
          <p className="text-[10px] text-gray-600">
            {data.high_confidence_count} high · {data.medium_confidence_count} medium
          </p>
        </div>
        <div className="rounded-lg bg-[#0a0a0f] p-3">
          <div className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
            <p className="text-xs text-gray-500">Attributed Revenue</p>
          </div>
          <p className="mt-1 text-xl font-bold text-white">
            ${data.total_attributed_revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
          <p className="text-[10px] text-gray-600">
            ${data.high_confidence_revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} high confidence
          </p>
        </div>
        <div className="rounded-lg bg-[#0a0a0f] p-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-amber-400" />
            <p className="text-xs text-gray-500">Conversion Rate</p>
          </div>
          <p className="mt-1 text-xl font-bold text-white">{data.conversion_rate}%</p>
          <p className="text-[10px] text-gray-600">of followed-up leads</p>
        </div>
      </div>

      {/* Expanded contact list */}
      {expanded && data.contacts.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-xs text-gray-500">
                <th className="pb-2 pr-4 font-medium">Customer</th>
                <th className="pb-2 pr-4 font-medium">Service</th>
                <th className="pb-2 pr-4 font-medium">Revenue</th>
                <th className="pb-2 pr-4 font-medium">Follow-Ups</th>
                <th className="pb-2 pr-4 font-medium">Confidence</th>
                <th className="pb-2 font-medium">Source</th>
              </tr>
            </thead>
            <tbody>
              {data.contacts.map((c) => (
                <tr key={c.id} className="border-b border-[#1e1e2e]/50 hover:bg-[#1a1a24]">
                  <td className="py-2.5 pr-4 text-white">{c.customer_name}</td>
                  <td className="py-2.5 pr-4 text-gray-400">{c.service_requested ?? "—"}</td>
                  <td className="py-2.5 pr-4 text-emerald-400">
                    {c.revenue ? `$${c.revenue.toLocaleString()}` : "—"}
                  </td>
                  <td className="py-2.5 pr-4 text-gray-300">{c.followup_count}</td>
                  <td className="py-2.5 pr-4">
                    <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      c.attribution_confidence === "high"
                        ? "bg-green-500/10 text-green-400"
                        : "bg-amber-500/10 text-amber-400"
                    }`}>
                      {c.attribution_confidence}
                    </span>
                  </td>
                  <td className="py-2.5 text-gray-500">{c.lead_source ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {expanded && data.contacts.length === 0 && (
        <p className="mt-4 text-center text-sm text-gray-500">
          No follow-up conversions yet. As leads convert after receiving follow-ups, they&apos;ll appear here.
        </p>
      )}
    </div>
  );
}
