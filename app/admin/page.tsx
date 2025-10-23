"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase";
import { Memo } from "@/app/types/memo";
import { CategoryBadge } from "@/app/components/CategoryBadge";
import { ArrowLeft, RefreshCw } from "lucide-react";

export default function AdminPage() {
  const [memos, setMemos] = useState<Memo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsername, setSelectedUsername] = useState<string>("all");
  const [selectedSource, setSelectedSource] = useState<string>("all");
  const [usernames, setUsernames] = useState<string[]>([]);

  useEffect(() => {
    fetchMemos();
  }, [selectedUsername, selectedSource]);

  async function fetchMemos() {
    try {
      setLoading(true);
      setError(null);

      // Fetch without RLS - admin view
      let query = supabase
        .from("memos")
        .select("*")
        .is("deleted_at", null)
        .order("timestamp", { ascending: false })
        .limit(200);

      if (selectedUsername !== "all") {
        query = query.eq("username", selectedUsername);
      }

      if (selectedSource !== "all") {
        query = query.eq("source", selectedSource);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) {
        console.error("Error fetching memos:", fetchError);
        setError(fetchError.message);
        return;
      }

      setMemos(
        (data || []).map((memo) => ({
          ...memo,
          timestamp: new Date(memo.timestamp),
        }))
      );

      // Extract unique usernames
      const uniqueUsernames = Array.from(
        new Set((data || []).map((m) => m.username).filter(Boolean))
      ).sort();
      setUsernames(uniqueUsernames);
    } catch (err) {
      console.error("Error:", err);
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  function formatTimestamp(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }

  function getSourceDisplay(memo: Memo): string {
    if (memo.source === "device") {
      return `📱 ${memo.device_id || "device"}`;
    }
    return memo.input_type === "text" ? "⌨️ text" : "🎤 audio";
  }

  return (
    <div className="min-h-screen p-3 sm:p-4 md:p-8 bg-[#0a0a0f] select-none">
      {/* Background gradient glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/10 via-transparent to-[#f43f5e]/10 pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#cbd5e1] mb-1">
              Admin Panel
            </h1>
            <p className="text-sm text-[#94a3b8]">
              {loading ? "Loading..." : `${memos.length} memos`}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchMemos}
              disabled={loading}
              className="p-2 bg-[#0d0e14]/60 backdrop-blur-xl border border-slate-700/20 rounded-lg hover:border-indigo-500/40 transition-colors disabled:opacity-50"
              title="Refresh"
            >
              <RefreshCw
                className={`w-4 h-4 text-[#94a3b8] ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <a
              href="/"
              className="flex items-center gap-2 px-3 py-2 bg-[#0d0e14]/60 backdrop-blur-xl border border-slate-700/20 rounded-lg hover:border-indigo-500/40 transition-colors text-[#cbd5e1] text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to App</span>
            </a>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#94a3b8]">User:</label>
            <select
              value={selectedUsername}
              onChange={(e) => setSelectedUsername(e.target.value)}
              className="px-3 py-1.5 bg-[#0d0e14]/60 backdrop-blur-xl border border-slate-700/20 rounded-lg text-[#cbd5e1] text-sm focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Users</option>
              {usernames.map((username) => (
                <option key={username} value={username}>
                  {username}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-[#94a3b8]">
              Source:
            </label>
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="px-3 py-1.5 bg-[#0d0e14]/60 backdrop-blur-xl border border-slate-700/20 rounded-lg text-[#cbd5e1] text-sm focus:outline-none focus:border-indigo-500/40"
            >
              <option value="all">All Sources</option>
              <option value="app">App</option>
              <option value="device">Device</option>
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/40 rounded-lg p-4 mb-4">
            <p className="text-red-400">Error: {error}</p>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-500 border-r-transparent"></div>
            <p className="mt-4 text-[#94a3b8] text-sm">Loading memos...</p>
          </div>
        )}

        {/* Memos table */}
        {!loading && (
          <div className="bg-[#0d0e14]/40 backdrop-blur-xl rounded-xl border border-slate-700/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[#0a0a0f]/60 border-b border-slate-700/20">
                  <tr>
                    <th className="px-3 py-3 text-left font-semibold text-[#cbd5e1]">
                      Time
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#cbd5e1]">
                      User
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#cbd5e1]">
                      Source
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#cbd5e1]">
                      Category
                    </th>
                    <th className="px-3 py-3 text-left font-semibold text-[#cbd5e1] max-w-md">
                      Content
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-[#cbd5e1]">
                      Conf
                    </th>
                    <th className="px-3 py-3 text-center font-semibold text-[#cbd5e1]">
                      Flags
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/10">
                  {memos.map((memo) => (
                    <tr
                      key={memo.id}
                      className="hover:bg-[#0d0e14]/60 transition-colors"
                    >
                      <td className="px-3 py-2.5 text-[#94a3b8] whitespace-nowrap text-xs">
                        {formatTimestamp(memo.timestamp)}
                      </td>
                      <td className="px-3 py-2.5 text-[#cbd5e1] font-medium whitespace-nowrap text-xs">
                        {memo.username || "—"}
                      </td>
                      <td
                        className="px-3 py-2.5 text-[#94a3b8] whitespace-nowrap text-xs"
                        title={`Source: ${memo.source}, Input: ${memo.input_type}${memo.device_id ? `, Device: ${memo.device_id}` : ""}`}
                      >
                        {getSourceDisplay(memo)}
                      </td>
                      <td className="px-3 py-2.5">
                        <CategoryBadge
                          category={memo.category}
                          size={memo.size || undefined}
                        />
                      </td>
                      <td className="px-3 py-2.5 text-[#cbd5e1] max-w-md text-xs">
                        <div className="truncate" title={memo.transcript}>
                          {memo.transcript}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-10 h-1 bg-[#0a0a0f]/80 rounded-full overflow-hidden border border-slate-700/10">
                            <div
                              className={`h-full ${
                                memo.confidence >= 0.7
                                  ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                  : memo.confidence >= 0.5
                                    ? "bg-gradient-to-r from-yellow-500 to-amber-500"
                                    : "bg-gradient-to-r from-orange-500 to-red-500"
                              }`}
                              style={{ width: `${memo.confidence * 100}%` }}
                            />
                          </div>
                          <span className="text-[#94a3b8] text-xs">
                            {(memo.confidence * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {memo.starred && (
                            <span title="Starred" className="text-sm">
                              ⭐
                            </span>
                          )}
                          {memo.needs_review && (
                            <span title="Needs Review" className="text-sm">
                              ⚠️
                            </span>
                          )}
                          {!memo.starred && !memo.needs_review && (
                            <span className="text-[#64748b]">—</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {!loading && memos.length === 0 && (
                <div className="text-center py-12 text-[#94a3b8]">
                  No memos found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
