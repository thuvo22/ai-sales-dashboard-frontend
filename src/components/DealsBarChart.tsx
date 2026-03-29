"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { DealsChartDay } from "@/lib/api";

interface DealsBarChartProps {
  data: DealsChartDay[];
}

export default function DealsBarChart({ data }: DealsBarChartProps) {
  // Format dates for display
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    }),
  }));

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Deals Won vs Lost (Last 7 Days)
      </h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-gray-600">
          No data for this period
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={formatted} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e1e2e" />
            <XAxis dataKey="label" tick={{ fill: "#6b7280", fontSize: 12 }} />
            <YAxis allowDecimals={false} tick={{ fill: "#6b7280", fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#111118",
                border: "1px solid #1e1e2e",
                borderRadius: "8px",
                color: "#e5e7eb",
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: "#9ca3af" }} />
            <Bar dataKey="won" name="Won" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="lost" name="Lost" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
