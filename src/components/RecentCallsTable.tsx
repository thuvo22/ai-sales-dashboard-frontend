"use client";

import { Phone, CheckCircle, XCircle, Clock } from "lucide-react";
import type { ContactMemory } from "@/lib/api";

interface RecentCallsTableProps {
  calls: ContactMemory[];
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    WON: {
      bg: "bg-emerald-500/10",
      text: "text-emerald-400",
      border: "border-emerald-500/20",
      icon: CheckCircle,
    },
    LOST: {
      bg: "bg-red-500/10",
      text: "text-red-400",
      border: "border-red-500/20",
      icon: XCircle,
    },
    PENDING: {
      bg: "bg-amber-500/10",
      text: "text-amber-400",
      border: "border-amber-500/20",
      icon: Clock,
    },
  }[status] ?? {
    bg: "bg-gray-500/10",
    text: "text-gray-400",
    border: "border-gray-500/20",
    icon: Clock,
  };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${config.bg} ${config.text} ${config.border}`}
    >
      <Icon className="h-3 w-3" />
      {status}
    </span>
  );
}

export default function RecentCallsTable({ calls }: RecentCallsTableProps) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Recent Audited Calls
      </h3>

      {calls.length === 0 ? (
        <div className="flex h-32 items-center justify-center text-gray-600">
          No audited calls yet — click &quot;Sync GHL Data&quot; above
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#1e1e2e] text-xs uppercase tracking-wider text-gray-500">
                <th className="px-3 py-3">Name</th>
                <th className="px-3 py-3">Phone</th>
                <th className="px-3 py-3">Service</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {calls.map((call) => (
                <tr
                  key={call.id}
                  className="border-b border-[#1e1e2e]/50 transition-colors hover:bg-[#1a1a24]"
                >
                  <td className="whitespace-nowrap px-3 py-3 font-medium text-white">
                    {call.customer_name}
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-400">
                    <span className="inline-flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {call.phone_number}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-gray-300">
                    {call.service_requested || "—"}
                  </td>
                  <td className="px-3 py-3">
                    <StatusBadge status={call.deal_status} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 text-gray-500">
                    {new Date(call.last_activity_at || call.updated_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
