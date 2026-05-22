"use client";

import type { ChartPoint } from "@/lib/types";

const formatCompact = new Intl.NumberFormat("tr-TR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export function BarChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="flex h-64 items-end gap-3 rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
      {data.map((item) => {
        const height = `${Math.max((item.value / max) * 100, 8)}%`;
        return (
          <div key={item.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <div className="flex h-44 w-full items-end">
              <div
                className="w-full rounded-md bg-gradient-to-t from-teal-500 to-cyan-300 shadow-sm transition hover:from-teal-600 hover:to-cyan-400"
                style={{ height }}
                title={`${item.label}: ${formatCompact.format(item.value)}`}
              />
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function LineChart({ data }: { data: ChartPoint[] }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  const points = data
    .map((item, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * 100;
      const y = 100 - (item.value / max) * 84 - 8;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-lg bg-slate-50 p-4 dark:bg-slate-950/60">
      <svg viewBox="0 0 100 100" className="h-64 w-full overflow-visible">
        <defs>
          <linearGradient id="lineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#14b8a6" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polyline
          points={`0,100 ${points} 100,100`}
          fill="url(#lineFill)"
          stroke="none"
        />
        <polyline
          points={points}
          fill="none"
          stroke="#14b8a6"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {data.map((item, index) => {
          const x = (index / Math.max(data.length - 1, 1)) * 100;
          const y = 100 - (item.value / max) * 84 - 8;
          return (
            <circle
              key={item.label}
              cx={x}
              cy={y}
              r="2.5"
              fill="#ffffff"
              stroke="#14b8a6"
              strokeWidth="2"
            />
          );
        })}
      </svg>
      <div className="mt-3 grid grid-cols-6 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {data.map((item) => (
          <span key={item.label}>{item.label}</span>
        ))}
      </div>
    </div>
  );
}
