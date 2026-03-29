"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Wrong password");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f]">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm mx-4 p-8 rounded-2xl bg-[#12121a] border border-gray-800 shadow-2xl"
        autoComplete="on"
      >
        {/* Hidden username field so browser offers to save credentials + Touch ID autofill */}
        <input
          type="text"
          name="username"
          autoComplete="username"
          defaultValue="admin"
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 .9 2 2 2 2-.9 2-2zm0 0c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-4 7c0-2.2 1.8-4 4-4s4 1.8 4 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">OnPoint Pros</h1>
          <p className="text-gray-400 mt-1 text-sm">Sales Dashboard</p>
        </div>

        <div className="mb-6">
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-[#1a1a2e] border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            required
          />
        </div>

        {error && (
          <p className="text-red-400 text-sm text-center mb-4">{error}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p className="text-gray-500 text-xs text-center mt-6">
          Save password in browser for Touch ID login
        </p>
      </form>
    </div>
  );
}
