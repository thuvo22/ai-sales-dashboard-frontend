"use client";

import {
  Users,
  TrendingUp,
  AlertCircle,
  Clock,
  RefreshCw,
  DollarSign,
  Cpu,
  MessageSquare,
} from "lucide-react";
import type { DashboardStats } from "@/lib/api";

interface StatsCardsProps {
  stats: DashboardStats | null;
  onSync: (limit?: number, forceRefresh?: boolean, forceAll?: boolean) => void;
  isSyncing: boolean;
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5 transition-colors hover:border-[#2a2a3e]">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <div className={`rounded-lg p-2 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-white">
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-gray-500">{sub}</p>}
    </div>
  );
}

export default function StatsCards({
  stats,
  onSync,
  isSyncing,
}: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard
        label="Total Leads"
        value={stats?.total_leads ?? "—"}
        icon={Users}
        color="bg-blue-500/10 text-blue-400"
      />
      <StatCard
        label="Win Rate"
        value={stats ? `${stats.win_rate}%` : "—"}
        icon={TrendingUp}
        color="bg-emerald-500/10 text-emerald-400"
        sub={stats ? `${stats.won_count} won of ${stats.total_leads}` : undefined}
      />
      <StatCard
        label="Won Deals"
        value={stats?.won_count ?? "—"}
        icon={TrendingUp}
        color="bg-green-500/10 text-green-400"
      />
      <StatCard
        label="Lost Deals"
        value={stats?.lost_count ?? "—"}
        icon={AlertCircle}
        color="bg-red-500/10 text-red-400"
      />
      <StatCard
        label="Pending"
        value={stats?.pending_count ?? "—"}
        icon={Clock}
        color="bg-amber-500/10 text-amber-400"
      />
      <StatCard
        label="Total Revenue"
        value={stats ? `$${stats.total_revenue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : "—"}
        icon={DollarSign}
        color="bg-emerald-500/10 text-emerald-300"
        sub="from won deals"
      />
      <StatCard
        label="Claude AI Cost"
        value={stats ? `$${stats.total_claude_cost.toFixed(4)}` : "—"}
        icon={Cpu}
        color="bg-purple-500/10 text-purple-400"
        sub="Haiku 4.5 API spend"
      />
      <StatCard
        label="Follow-Up Conversions"
        value={stats?.followup_converted_count ?? "—"}
        icon={MessageSquare}
        color="bg-cyan-500/10 text-cyan-400"
        sub={stats ? `$${(stats.followup_attributed_revenue ?? 0).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })} attributed revenue` : undefined}
      />

      {/* Sync Button */}
      <div className="sm:col-span-2 lg:col-span-5">
        <button
          onClick={() => onSync(undefined, true, false)}
          disabled={isSyncing}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-brand-600 bg-brand-600/10 px-6 py-3 text-sm font-semibold text-brand-400 transition-all hover:bg-brand-600/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${isSyncing ? "animate-spin" : ""}`}
          />
          {isSyncing ? "Syncing…" : "Sync New Leads & Messages"}
        </button>
      </div>
    </div>
  );
}
