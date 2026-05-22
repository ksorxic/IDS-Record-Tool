import { BarChart3 } from "lucide-react";
import type { TopTalkerSnapshot } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/dashboard-client";

type TopTalkersSectionProps = {
  topTalkers: TopTalkerSnapshot[];
};

export default function TopTalkersSection({
  topTalkers
}: TopTalkersSectionProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Top Talkers
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Top Network Talkers
          </h2>
        </div>
        <BarChart3 className="h-8 w-8 text-rose-700" />
      </div>
      <div className="mt-6 grid gap-3 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {topTalkers.length === 0 && (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No `top_talker_snapshots` available for display.
          </p>
        )}
        {topTalkers.map((talker, index) => (
          <div
            key={talker._id}
            className="flex flex-col gap-3 rounded-[1.25rem] border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-slate-500">Rank #{index + 1}</p>
              <p className="mt-1 font-semibold text-slate-900">
                {talker.ip ?? "unknown host"}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <p className="text-sm text-slate-500">Bytes</p>
              <p className="mt-1 font-semibold text-slate-900">
                {talker.bytes?.toLocaleString("en-US") ?? "0"}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                {formatTimestamp(talker.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
