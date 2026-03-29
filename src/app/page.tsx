"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Users } from "lucide-react";
import {
  api,
  type DashboardStats,
  type ContactMemory,
  type RejectionReason,
  type DealsChartDay,
  type SalesPlaybookEntry,
  type SyncStatus,
} from "@/lib/api";

import StatsCards from "@/components/StatsCards";
import DealsBarChart from "@/components/DealsBarChart";
import RejectionPieChart from "@/components/RejectionPieChart";
import RecentCallsTable from "@/components/RecentCallsTable";
import PlaybookTable from "@/components/PlaybookTable";
import LeadStatusBoard from "@/components/LeadStatusBoard";
import SalesTrainingPanel from "@/components/SalesTrainingPanel";
import ReportsPanel from "@/components/ReportsPanel";
import FollowUpAttribution from "@/components/FollowUpAttribution";

export default function DashboardPage() {
  // ── State ──
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentCalls, setRecentCalls] = useState<ContactMemory[]>([]);
  const [rejectionReasons, setRejectionReasons] = useState<RejectionReason[]>([]);
  const [dealsChart, setDealsChart] = useState<DealsChartDay[]>([]);
  const [playbook, setPlaybook] = useState<SalesPlaybookEntry[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports">("dashboard");
  const router = useRouter();

  // ── Fetch all dashboard data ──
  const fetchAll = useCallback(async () => {
    try {
      setError(null);
      const [s, rc, rr, dc, pb] = await Promise.allSettled([
        api.getStats(),
        api.getRecentCalls(),
        api.getRejectionReasons(),
        api.getDealsChart(),
        api.getPlaybook(),
      ]);
      if (s.status === "fulfilled") setStats(s.value);
      if (rc.status === "fulfilled") setRecentCalls(rc.value);
      if (rr.status === "fulfilled") setRejectionReasons(rr.value);
      if (dc.status === "fulfilled") setDealsChart(dc.value);
      if (pb.status === "fulfilled") setPlaybook(pb.value);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // ── Sync handler ──
  const handleSync = async (limit?: number, forceRefresh = false, forceAll = false) => {
    setIsSyncing(true);
    setSyncStatus(null);
    setError(null);
    try {
      await api.syncGHL(limit, forceRefresh, forceAll);
      // Poll for progress every 2 seconds
      const poll = setInterval(async () => {
        try {
          const status = await api.getSyncStatus();
          setSyncStatus(status);
          // Refresh dashboard data periodically while syncing
          await fetchAll();
          if (!status.running && status.finished) {
            clearInterval(poll);
            setIsSyncing(false);
          }
        } catch {
          clearInterval(poll);
          setIsSyncing(false);
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="border-b border-[#1e1e2e] bg-[#0d0d14]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-600/20 p-2">
              <LayoutDashboard className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                OnPoint Pros — AI Sales Dashboard
              </h1>
              <p className="text-xs text-gray-500">
                GoHighLevel CRM &middot; Claude Opus Auditor &middot; Business
                Phone: 346-572-5599
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Tab buttons */}
            <div className="flex rounded-lg border border-[#2a2a3a] bg-[#0a0a0f] p-0.5">
              <button
                onClick={() => setActiveTab("dashboard")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "dashboard"
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <LayoutDashboard className="h-3.5 w-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                  activeTab === "reports"
                    ? "bg-brand-600/20 text-brand-400"
                    : "text-gray-500 hover:text-gray-300"
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                Reports
              </button>
              <button
                onClick={() => router.push("/contacts")}
                className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:text-gray-300"
              >
                <Users className="h-3.5 w-3.5" />
                Contacts
              </button>
            </div>
            <div className="text-right text-xs text-gray-600">
              {stats
                ? `${stats.total_leads} leads tracked`
                : "Loading…"}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        {/* Error banner */}
        {error && (
          <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {activeTab === "reports" ? (
          <ReportsPanel />
        ) : (
          <>

        {/* Sync status banner */}
        {syncStatus && (
          <div className={`rounded-lg border px-4 py-3 text-sm ${
            syncStatus.running
              ? "border-blue-500/20 bg-blue-500/10 text-blue-300"
              : syncStatus.errors.length > 0
                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                : "border-brand-500/20 bg-brand-500/10 text-brand-300"
          }`}>
            {syncStatus.running ? (
              <>
                <strong>Syncing…</strong> {syncStatus.progress}
              </>
            ) : (
              <div>
                <p>
                  <strong>Sync complete:</strong> {syncStatus.contacts_fetched} contacts
                  fetched, {syncStatus.contacts_audited} audited
                  {syncStatus.re_audited > 0 && (
                    <span className="text-amber-300"> ({syncStatus.re_audited} re-audited)</span>
                  )}
                  , {syncStatus.already_processed ?? 0} already processed (saved Claude cost).
                  {syncStatus.errors.length > 0 && (
                    <span className="ml-2 text-amber-400">
                      ({syncStatus.errors.length} errors)
                    </span>
                  )}
                </p>
                {syncStatus.skipped > 0 && (
                  <p className="mt-1 text-xs text-gray-400">
                    Skipped {syncStatus.skipped}:
                    {syncStatus.skip_no_phone > 0 && ` ${syncStatus.skip_no_phone} no phone,`}
                    {syncStatus.skip_no_conversation > 0 && ` ${syncStatus.skip_no_conversation} no conversation,`}
                    {syncStatus.skip_thumbtack > 0 && ` ${syncStatus.skip_thumbtack} Thumbtack auto-msgs`}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Top Row: KPI Cards + Sync Button ── */}
        <StatsCards stats={stats} onSync={handleSync} isSyncing={isSyncing} />

        {/* ── Middle Row: Charts ── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DealsBarChart data={dealsChart} />
          <RejectionPieChart data={rejectionReasons} />
        </div>

        {/* ── Follow-Up Attribution ── */}
        <FollowUpAttribution />

        {/* ── Lead Status Board (full width) ── */}
        <LeadStatusBoard />

        {/* ── AI Sales Training Data ── */}
        <SalesTrainingPanel />

        {/* ── Bottom Row: Tables ── */}
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <RecentCallsTable calls={recentCalls} />
          <PlaybookTable entries={playbook} />
        </div>
          </>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1e1e2e] py-4 text-center text-xs text-gray-600">
        OnPoint Pros Internal Dashboard &middot; Powered by GHL API v2 + Claude
        Opus
      </footer>
    </div>
  );
}
