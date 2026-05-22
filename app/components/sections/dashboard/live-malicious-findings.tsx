import { AlertTriangle } from "lucide-react";
import type { CollectorAlertSummary } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/dashboard-client";

type LiveMaliciousFindingsProps = {
  latestMaliciousAlert: CollectorAlertSummary | null;
};

export default function LiveMaliciousFindings({
  latestMaliciousAlert
}: LiveMaliciousFindingsProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
            Live Malicious Findings
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
             Live Malicious Findings
          </h2>
        </div>
        <AlertTriangle className="h-8 w-8 text-rose-700" />
      </div>

      {latestMaliciousAlert ? (
        <div className="mt-6 rounded-3xl border border-rose-200 bg-[linear-gradient(135deg,#fff1f2,#fff7ed)] p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-rose-600 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                {latestMaliciousAlert.severity ?? "alert"}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">
                {latestMaliciousAlert.alertType ?? "UNKNOWN"}
              </h3>
            </div>
            <span className="text-sm text-slate-500">
              {formatTimestamp(latestMaliciousAlert.timestamp)}
            </span>
          </div>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            {latestMaliciousAlert.description ??
              `${latestMaliciousAlert.srcIp ?? "unknown"} -> ${latestMaliciousAlert.dstIp ?? "unknown"}`}
          </p>
        </div>
      ) : (
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
          No new malicious findings have been reported by the collector.
        </div>
      )}
    </div>
  );
}
