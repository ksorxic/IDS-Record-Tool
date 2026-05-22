import { Activity } from "lucide-react";
import type { SecurityAlert } from "@/lib/admin-types";
import { formatTimestamp } from "@/lib/dashboard-client";

type LatestAlertsSectionProps = {
  alerts: SecurityAlert[];
};

export default function LatestAlertsSection({
  alerts
}: LatestAlertsSectionProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Latest Alerts
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Latest Security Alerts</h2>
        </div>
        <Activity className="h-8 w-8 text-slate-700" />
      </div>
      <div className="mt-6 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {alerts.length === 0 && (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
            No security alerts found in the `security_alerts` collection.
          </p>
        )}
        {alerts.map((alert) => (
          <article
            key={alert._id}
            className="rounded-[1.25rem] border border-slate-200 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-slate-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-white">
                  {alert.severity ?? "unknown"}
                </span>
                <h3 className="text-base font-semibold text-slate-900">
                  {alert.alertType ?? "Suspicious packet anomaly"}
                </h3>
              </div>
              <span className="text-xs text-slate-500">
                {formatTimestamp(alert.timestamp)}
              </span>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {alert.message ??
                `Source ${alert.srcIp ?? "unknown"} is communicating to ${alert.dstIp ?? "unknown"} and is in a ${alert.status ?? "open"} state.`}
            </p>
          </article>
        ))}
      </div>
    </div>
  );
}
