"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { RejectionReason } from "@/lib/api";

interface RejectionPieChartProps {
  data: RejectionReason[];
}

const COLORS = [
  "#ef4444",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#10b981",
  "#f97316",
  "#6366f1",
  "#14b8a6",
];

export default function RejectionPieChart({ data }: RejectionPieChartProps) {
  const total = data.reduce((s, d) => s + d.count, 0);

  return (
    <div className="rounded-xl border border-[#1e1e2e] bg-[#111118] p-5">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">
        Lost Deal Categories
      </h3>
      {data.length === 0 ? (
        <div className="flex h-64 items-center justify-center text-gray-600">
          No lost deals yet
        </div>
      ) : (
        <>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="reason"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={55}
                paddingAngle={2}
                label={({ reason, percent }) =>
                  percent > 0.05
                    ? `${reason as string} ${(percent * 100).toFixed(0)}%`
                    : ""
                }
                labelLine={({ percent }) =>
                  percent > 0.05 ? <line stroke="#4b5563" /> : <line stroke="transparent" />
                }
              >
                {data.map((_, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={COLORS[idx % COLORS.length]}
                    stroke="transparent"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const { reason, count } = payload[0].payload as RejectionReason;
                  const pct = ((count / total) * 100).toFixed(1);
                  return (
                    <div
                      style={{
                        backgroundColor: "#111118",
                        border: "1px solid #1e1e2e",
                        borderRadius: "8px",
                        padding: "8px 12px",
                      }}
                    >
                      <p style={{ color: "#e5e7eb", margin: 0, fontWeight: 600, fontSize: 13 }}>
                        {reason}
                      </p>
                      <p style={{ color: "#9ca3af", margin: "4px 0 0", fontSize: 12 }}>
                        {count} leads &middot; {pct}%
                      </p>
                    </div>
                  );
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Custom legend grid below the chart */}
          <div className="mt-3 grid grid-cols-3 gap-x-4 gap-y-1.5">
            {data.map((d, idx) => (
              <div key={d.reason} className="flex items-center gap-1.5 text-xs">
                <span
                  className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                />
                <span className="truncate text-gray-400">{d.reason}</span>
                <span className="ml-auto shrink-0 font-medium text-gray-300">
                  {d.count}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
