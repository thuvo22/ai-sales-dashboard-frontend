"use client";

import { useState, useCallback } from "react";
import { Search, Users, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { api, type UnifiedContact } from "@/lib/api";
import UnifiedContactView from "@/components/UnifiedContactView";

export default function ContactsPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<UnifiedContact | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = useCallback(async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setSearched(true);
    try {
      const data = await api.getUnifiedContact(q);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Contact not found");
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* ── Header ── */}
      <header className="border-b border-[#1e1e2e] bg-[#0d0d14]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-brand-600/20 p-2">
              <Users className="h-6 w-6 text-brand-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Contact Lookup</h1>
              <p className="text-xs text-gray-500">
                Unified view across GHL, MongoDB, Thumbtack &amp; Shadow
              </p>
            </div>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-lg border border-[#2a2a3e] px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-[#3a3a4e] hover:text-gray-200"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* ── Search Bar ── */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by phone number or name…"
              className="w-full rounded-xl border border-[#2a2a3e] bg-[#1a1a28] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 outline-none transition-colors focus:border-brand-500 focus:bg-[#1e1e32]"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading || !query.trim()}
            className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching…
              </>
            ) : (
              <>
                <Search className="h-4 w-4" />
                Search
              </>
            )}
          </button>
        </div>

        {/* ── Hint ── */}
        {!searched && (
          <div className="rounded-2xl border border-[#1e1e2e] bg-[#12121a] px-6 py-10 text-center">
            <Users className="mx-auto mb-3 h-10 w-10 text-gray-700" />
            <p className="text-sm text-gray-500">
              Enter a phone number (e.g. <span className="text-gray-400">346-572-5599</span>) or
              a contact name to pull their unified profile.
            </p>
          </div>
        )}

        {/* ── Error ── */}
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        {/* ── Loading skeleton ── */}
        {loading && (
          <div className="space-y-4 animate-pulse">
            <div className="h-28 rounded-2xl bg-[#12121a]" />
            <div className="h-16 rounded-2xl bg-[#12121a]" />
            <div className="h-48 rounded-2xl bg-[#12121a]" />
          </div>
        )}

        {/* ── Results ── */}
        {!loading && result && <UnifiedContactView data={result} />}
      </main>

      <footer className="border-t border-[#1e1e2e] py-4 text-center text-xs text-gray-600">
        OnPoint Pros Internal Dashboard &middot; Unified Contact View
      </footer>
    </div>
  );
}
