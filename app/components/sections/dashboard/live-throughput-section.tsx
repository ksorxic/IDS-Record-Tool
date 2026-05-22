import { BarChart3 } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { LiveTrafficMetrics } from "@/lib/admin-types";
import { formatByteSize, formatTransferRate } from "@/lib/dashboard-client";
import { buildLiveThroughputDisplay } from "@/lib/live-throughput-display";

type LiveThroughputSectionProps = {
  hasMounted: boolean;
  isCollectorActive: boolean;
  liveTraffic: LiveTrafficMetrics;
};

export default function LiveThroughputSection({
  hasMounted,
  isCollectorActive,
  liveTraffic
}: LiveThroughputSectionProps) {
  const displayMetrics = buildLiveThroughputDisplay(
    liveTraffic,
    isCollectorActive
  );

  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Live Throughput
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
             Live Network Throughput
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Transfer rate of the most recent {displayMetrics.windowSeconds} seconds,
            providing a real-time view of network activity similar to a task manager.
          </p>
        </div>
        <BarChart3 className="h-8 w-8 text-cyan-700" />
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.25rem] border border-cyan-100 bg-cyan-50/70 p-4">
          <p className="text-sm font-medium text-slate-500">Current speed</p>
          <p className="mt-2 text-3xl font-semibold text-slate-950">
            {formatTransferRate(displayMetrics.currentBytesPerSecond)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            {formatByteSize(displayMetrics.currentBytesPerSecond)}/s
          </p>
        </article>
        <article className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Peak speed</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatTransferRate(displayMetrics.peakBytesPerSecond)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Maximum in the rolling window of {displayMetrics.windowSeconds}s.
          </p>
        </article>
        <article className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Average speed</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatTransferRate(displayMetrics.averageBytesPerSecond)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Average rate of the most recent {displayMetrics.windowSeconds}s.
          </p>
        </article>
        <article className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Window volume</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatByteSize(displayMetrics.totalBytesInWindow)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Total bytes that have passed through the live window.
          </p>
        </article>
      </div>
      <div className="mt-6 h-64 sm:h-72">
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayMetrics.samples}>
              <defs>
                <linearGradient id="trafficFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis
                dataKey="secondsAgo"
                type="number"
                domain={[0, displayMetrics.windowSeconds]}
                reversed
                ticks={[displayMetrics.windowSeconds, 45, 30, 15, 0].filter(
                  (value, index, array) => array.indexOf(value) === index
                )}
                tick={{ fill: "#475569", fontSize: 12 }}
                tickFormatter={(value: number) => `${value}s`}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 12 }}
                tickFormatter={(value: number) => formatTransferRate(value)}
              />
              <Tooltip
                formatter={(value) => [
                  formatTransferRate(
                        typeof value === "number" ? value : Number(value ?? 0)
                  ),
                  "Traffic speed"
                ]}
                labelFormatter={(label) => `${label}s ago`}
              />
              <Area
                type="monotone"
                dataKey="bytesPerSecond"
                stroke="#0284c7"
                strokeWidth={3}
                fill="url(#trafficFill)"
                isAnimationActive
                animationDuration={600}
                animationEasing="ease-out"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full animate-pulse rounded-3xl bg-slate-100" />
        )}
      </div>
      {!isCollectorActive && (
        <p className="mt-4 text-sm font-medium text-slate-500">
          Capture is stopped, so the live throughput view is paused at zero.
        </p>
      )}
    </div>
  );
}
