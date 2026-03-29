"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, FileText, Phone, X, ArrowLeft, ArrowUpDown, Calendar } from "lucide-react";
import { api, type CallAnalysisReport } from "@/lib/api";

function ScoreBadge({ score }: { score: number | null }) {
  if (score == null) return null;
  const color =
    score >= 90
      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
      : score >= 75
        ? "text-blue-400 bg-blue-500/10 border-blue-500/20"
        : score >= 60
          ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
          : "text-red-400 bg-red-500/10 border-red-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-bold ${color}`}>
      {score}/100
    </span>
  );
}

function LeadBadge({ quality }: { quality: string | null }) {
  if (!quality) return null;
  const color =
    quality === "Hot"
      ? "text-red-400 bg-red-500/10 border-red-500/20"
      : quality === "Warm"
        ? "text-amber-400 bg-amber-500/10 border-amber-500/20"
        : "text-blue-400 bg-blue-500/10 border-blue-500/20";
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${color}`}>
      {quality === "Hot" ? "🔥" : quality === "Warm" ? "🟡" : "🧊"} {quality}
    </span>
  );
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

type SortField = "date" | "name" | "score";
type SortDir = "asc" | "desc";

export default function ReportsPanel() {
  const [reports, setReports] = useState<CallAnalysisReport[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CallAnalysisReport | null>(null);
  const [sortField, setSortField] = useState<SortField>("date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const fetchReports = useCallback(async (q = "") => {
    setLoading(true);
    try {
      const data = await api.getReports(q);
      setReports(data);
    } catch (err) {
      console.error("Failed to fetch reports:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSearch = () => {
    fetchReports(search);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir(field === "date" ? "desc" : "asc");
    }
  };

  const sortedReports = [...reports].sort((a, b) => {
    const dir = sortDir === "asc" ? 1 : -1;
    if (sortField === "date") {
      return dir * ((a.call_date ?? "").localeCompare(b.call_date ?? ""));
    }
    if (sortField === "name") {
      return dir * a.contact_name.localeCompare(b.contact_name);
    }
    if (sortField === "score") {
      return dir * ((a.total_score ?? 0) - (b.total_score ?? 0));
    }
    return 0;
  });

  // ── Full report view ──
  if (selectedReport) {
    return (
      <div className="space-y-4">
        <button
          onClick={() => setSelectedReport(null)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#1a1a24] px-3 py-2 text-sm text-gray-300 hover:bg-[#222230] transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Reports
        </button>
        <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1e1e2e] px-5 py-3">
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-brand-400" />
              <span className="font-semibold text-white">{selectedReport.contact_name}</span>
              <span className="text-xs text-gray-400">
                <Calendar className="mr-1 inline h-3 w-3" />
                {formatDate(selectedReport.call_date)}
              </span>
              <span className="text-xs text-gray-500">• {selectedReport.call_duration}</span>
              <ScoreBadge score={selectedReport.total_score} />
              <LeadBadge quality={selectedReport.lead_quality} />
            </div>
            <button onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-300">
              <X className="h-5 w-5" />
            </button>
          </div>
          <iframe
            src={api.getReportHtmlUrl(selectedReport.id)}
            className="w-full border-0"
            style={{ height: "80vh" }}
            title={`Report — ${selectedReport.contact_name} — ${formatShortDate(selectedReport.call_date)}`}
          />
        </div>
      </div>
    );
  }

  // ── Report list view ──
  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by contact name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full rounded-lg border border-[#2a2a3a] bg-[#111118] pl-10 pr-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={loading}
          className="rounded-lg bg-brand-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Searching…" : "Search"}
        </button>
      </div>

      {/* Results */}
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118]">
        {/* Header with sort controls */}
        <div className="flex items-center justify-between border-b border-[#1e1e2e] px-5 py-3">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Call Analysis Reports ({reports.length})
          </h3>
          <div className="flex items-center gap-1">
            {(["date", "name", "score"] as SortField[]).map((f) => (
              <button
                key={f}
                onClick={() => toggleSort(f)}
                className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  sortField === f ? "bg-brand-600/20 text-brand-400" : "text-gray-500 hover:text-gray-300"
                }`}
              >
                {f === "date" ? "Date" : f === "name" ? "Name" : "Score"}
                {sortField === f && (
                  <ArrowUpDown className="h-3 w-3" />
                )}
              </button>
            ))}
          </div>
        </div>

        {reports.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-600">
            {loading ? "Loading reports…" : "No reports found"}
          </div>
        ) : (
          <div className="divide-y divide-[#1e1e2e]">
            {sortedReports.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedReport(r)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left hover:bg-[#161620] transition-colors"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600/10">
                  <FileText className="h-5 w-5 text-brand-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white truncate">{r.contact_name}</span>
                    <ScoreBadge score={r.total_score} />
                    <LeadBadge quality={r.lead_quality} />
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-gray-500">
                    {r.call_status && <span>{r.call_status}</span>}
                    {r.project_type && <span>• {r.project_type}</span>}
                    {r.call_duration && <span>• {r.call_duration}</span>}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-300">{formatShortDate(r.call_date)}</div>
                  <div className="text-xs text-gray-600">{r.call_duration}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
