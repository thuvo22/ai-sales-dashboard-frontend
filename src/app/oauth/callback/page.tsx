"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function OAuthCallbackContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setStatus("error");
      setMessage("No authorization code received from GHL.");
      return;
    }

    fetch("/api/ghl/oauth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      })
      .then((data) => {
        setStatus("success");
        setMessage(
          `Connected successfully! Location: ${data.location_id || "—"}`
        );
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [searchParams]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
      <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-8 text-center">
        {status === "loading" && (
          <p className="text-gray-400">Connecting to GoHighLevel…</p>
        )}
        {status === "success" && (
          <>
            <p className="text-lg font-bold text-emerald-400">Connected!</p>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
            <a
              href="/"
              className="mt-4 inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm text-white"
            >
              Go to Dashboard
            </a>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-lg font-bold text-red-400">
              Connection Failed
            </p>
            <p className="mt-2 text-sm text-gray-400">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
          <p className="text-gray-400">Loading…</p>
        </div>
      }
    >
      <OAuthCallbackContent />
    </Suspense>
  );
}
