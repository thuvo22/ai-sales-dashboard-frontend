"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BookOpen,
  Trophy,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Loader2,
  Wrench,
} from "lucide-react";
import { api, type TrainingDataEntry, type TrainingStatus } from "@/lib/api";

// ── Expandable Card ──
function TrainingCard({ entry }: { entry: TrainingDataEntry }) {
  const [open, setOpen] = useState(false);

  const meta = entry.metadata ?? {};
  const serviceType = (meta.service_type as string) || null;
  const dealValue = meta.deal_value as number | undefined;
  const failureReason = meta.failure_reason as string | undefined;

  return (
    <div className="rounded-lg border border-[#1e1e2e] bg-[#111118] transition-colors hover:border-[#2a2a3e]">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left"
      >
        <span className="mt-0.5 text-gray-500">
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </span>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-white leading-snug">
            {entry.title}
          </h4>
          <div className="mt-1 flex flex-wrap gap-2">
            {serviceType && (
              <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[10px] font-medium text-blue-400 border border-blue-500/20">
                {serviceType}
              </span>
            )}
            {dealValue != null && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 border border-emerald-500/20">
                ${dealValue.toLocaleString()}
              </span>
            )}
            {failureReason && (
              <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400 border border-red-500/20">
                {failureReason}
              </span>
            )}
          </div>
        </div>
      </button>
      {open && (
        <div className="border-t border-[#1e1e2e] px-4 py-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-300">
            {entry.content}
          </p>
          {entry.source_contacts && entry.source_contacts.length > 0 && (
            <p className="mt-3 text-[11px] text-gray-600">
              Sources: {entry.source_contacts.join(", ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Section for each category ──
function CategorySection({
  title,
  subtitle,
  icon: Icon,
  iconColor,
  borderColor,
  entries,
}: {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  iconColor: string;
  borderColor: string;
  entries: TrainingDataEntry[];
}) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className={`rounded-xl border ${borderColor} bg-[#0d0d14] overflow-hidden`}>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-3 px-5 py-4 text-left"
      >
        <div className={`rounded-lg p-2 ${iconColor}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <p className="text-xs text-gray-500">{subtitle}</p>
        </div>
        <span className="rounded-full bg-[#1e1e2e] px-3 py-1 text-xs font-semibold text-gray-400">
          {entries.length} entries
        </span>
        <span className="text-gray-500">
          {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
        </span>
      </button>
      {expanded && (
        <div className="space-y-2 px-4 pb-4">
          {entries.length === 0 ? (
            <p className="py-6 text-center text-sm text-gray-600">
              No entries yet — click &quot;Generate Training Data&quot; above
            </p>
          ) : (
            entries.map((entry) => <TrainingCard key={entry.id} entry={entry} />)
          )}
        </div>
      )}
    </div>
  );
}

// ── Main Panel ──
export default function SalesTrainingPanel() {
  const [entries, setEntries] = useState<TrainingDataEntry[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [trainingStatus, setTrainingStatus] = useState<TrainingStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const data = await api.getTrainingData();
      setEntries(data);
    } catch {
      // Silently fail on initial load — data may not exist yet
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setTrainingStatus(null);
    setError(null);
    try {
      await api.generateTrainingData();
      // Poll for progress
      const poll = setInterval(async () => {
        try {
          const status = await api.getTrainingStatus();
          setTrainingStatus(status);
          if (!status.running && status.finished) {
            clearInterval(poll);
            setIsGenerating(false);
            // Refresh entries
            await fetchEntries();
          }
        } catch {
          clearInterval(poll);
          setIsGenerating(false);
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start generation");
      setIsGenerating(false);
    }
  };

  const technical = entries.filter((e) => e.category === "technical_knowledge");
  const winning = entries.filter((e) => e.category === "winning_tactics");
  const lost = entries.filter((e) => e.category === "lost_lessons");

  return (
    <div className="space-y-4">
      {/* Header + Generate Button */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-violet-500/20 p-2">
            <Sparkles className="h-6 w-6 text-violet-400" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white">
              AI Sales Agent Training Data
            </h2>
            <p className="text-xs text-gray-500">
              Generated from all lead conversations — technical knowledge, winning
              tactics, and lost-deal lessons
            </p>
          </div>
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 rounded-xl border border-violet-500 bg-violet-500/10 px-5 py-2.5 text-sm font-semibold text-violet-400 transition-all hover:bg-violet-500/20 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          {isGenerating ? "Generating…" : "Generate Training Data"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Progress banner */}
      {trainingStatus && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            trainingStatus.running
              ? "border-violet-500/20 bg-violet-500/10 text-violet-300"
              : trainingStatus.errors.length > 0
                ? "border-amber-500/20 bg-amber-500/10 text-amber-300"
                : "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
          }`}
        >
          {trainingStatus.running ? (
            <p>
              <strong>Generating…</strong> {trainingStatus.progress}
            </p>
          ) : (
            <div>
              <p>
                <strong>Complete:</strong> Analyzed{" "}
                {trainingStatus.total_leads_analyzed} leads (
                {trainingStatus.won_leads_analyzed} WON,{" "}
                {trainingStatus.lost_leads_analyzed} LOST) →{" "}
                {trainingStatus.technical_entries} technical,{" "}
                {trainingStatus.winning_entries} winning,{" "}
                {trainingStatus.lost_entries} lost entries
              </p>
              {trainingStatus.errors.length > 0 && (
                <p className="mt-1 text-xs text-amber-400">
                  {trainingStatus.errors.length} error(s)
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3 Sections */}
      <CategorySection
        title="Technical Knowledge"
        subtitle="Construction, repair methods, materials, pricing — reference for customer questions"
        icon={Wrench}
        iconColor="bg-blue-500/10 text-blue-400"
        borderColor="border-blue-500/20"
        entries={technical}
      />

      <CategorySection
        title="Winning Tactics"
        subtitle="What worked in WON deals — proven sales techniques and closing strategies"
        icon={Trophy}
        iconColor="bg-emerald-500/10 text-emerald-400"
        borderColor="border-emerald-500/20"
        entries={winning}
      />

      <CategorySection
        title="Lost Deal Lessons"
        subtitle="Why deals were lost — failures to avoid and recovery strategies"
        icon={AlertTriangle}
        iconColor="bg-red-500/10 text-red-400"
        borderColor="border-red-500/20"
        entries={lost}
      />
    </div>
  );
}
