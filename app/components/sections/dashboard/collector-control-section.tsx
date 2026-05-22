import { Play, RotateCcw, Square } from "lucide-react";
import type { CollectorStatusResponse, DashboardData } from "@/lib/admin-types";
import type { CollectorActionState } from "@/lib/dashboard-client";
import { formatTimestamp } from "@/lib/dashboard-client";

type CollectorControlSectionProps = {
  collectorActionState: CollectorActionState;
  collectorRunning: boolean;
  collectorStateLabel: string;
  collectorVisualState: "starting" | "stopping" | "running" | "error" | "stopped" | "idle";
  collectorStatus: CollectorStatusResponse | null;
  activeAlertCount: number;
  dashboardConnectionStatus: DashboardData["connectionStatus"];
  healthyStateLabel: string;
  appliedRangesCount: number;
  isPending: boolean;
  onStart: () => void;
  onStop: () => void;
  onRestart: () => void;
};

export default function CollectorControlSection({  collectorActionState,  collectorRunning,  collectorStateLabel,  collectorVisualState,  collectorStatus,  activeAlertCount,  dashboardConnectionStatus,  healthyStateLabel,  appliedRangesCount,  isPending,  onStart,  onStop,  onRestart}: CollectorControlSectionProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
            Scanner Control
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
             Collector Status
          </h2>
        </div>
        <div
          className={`w-fit rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
            collectorVisualState === "running"
              ? "bg-emerald-100 text-emerald-700"
              : collectorVisualState === "starting"
                ? "bg-cyan-100 text-cyan-700"
                : collectorVisualState === "stopping"
                  ? "bg-amber-100 text-amber-700"
                  : collectorVisualState === "error"
                    ? "bg-rose-100 text-rose-700"
                    : "bg-slate-100 text-slate-500"
          }`}
        >
          {collectorStateLabel}
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Ingest Status</p>
          <div className="mt-3 flex items-center gap-3">
            <span
              className={`h-3 w-3 rounded-full ${
                dashboardConnectionStatus === "healthy"
                  ? "bg-emerald-400 shadow-[0_0_20px_rgba(74,222,128,0.8)]"
                  : "bg-amber-400 shadow-[0_0_20px_rgba(251,191,36,0.8)]"
              }`}
            />
            <p className="text-sm text-slate-700">{healthyStateLabel}</p>
          </div>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Last heartbeat</p>
          <p className="mt-2 text-base font-semibold text-slate-900">
            {formatTimestamp(collectorStatus?.runtime?.lastHeartbeatAt)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Last packet: {formatTimestamp(collectorStatus?.runtime?.lastPacketAt)}
          </p>
          {collectorVisualState === "stopping" && (
            <p className="mt-2 text-sm font-medium text-amber-700">
               The collector is stopping and we are waiting for the final close event.
            </p>
          )}
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm font-medium text-slate-500">Open alerts</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900">
            {activeAlertCount}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Alerts that remain unresolved or under investigation.
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div className="rounded-[1.25rem] border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Processed events</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {collectorStatus?.runtime?.processedEvents ?? 0}
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Malicious alerts</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {collectorStatus?.runtime?.totalAlerts ?? 0}
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-slate-200 p-4">
          <p className="text-sm text-slate-500">Applied ranges</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {appliedRangesCount}
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || collectorRunning}
          type="button"
          onClick={onStart}
        >
          <Play className="h-4 w-4" />
          {collectorActionState === "starting" ? "Starting..." : "Start"}
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending || !collectorRunning}
          type="button"
          onClick={onStop}
        >
          <Square className="h-4 w-4" />
          {collectorActionState === "stopping" ? "Stopping..." : "Stop"}
        </button>
        <button
          className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          type="button"
          onClick={onRestart}
        >
          <RotateCcw className="h-4 w-4" />
          {collectorActionState === "restarting"
            ? "Restarting..."
            : "Restart"}
        </button>
      </div>
    </div>
  );
}
