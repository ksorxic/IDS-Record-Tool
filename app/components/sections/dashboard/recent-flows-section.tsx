import { Activity } from "lucide-react";
import type { TrafficEvent } from "@/lib/admin-types";

type RecentFlowsSectionProps = {
  trafficEvents: TrafficEvent[];
};

export default function RecentFlowsSection({
  trafficEvents
}: RecentFlowsSectionProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Recent Flows
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Most recent network flows</h2>
        </div>
        <Activity className="h-8 w-8 text-emerald-700" />
      </div>
      <div className="mt-6 overflow-x-auto rounded-[1.25rem] border border-slate-200">
        <table className="min-w-2xl divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-slate-500">
            <tr>
              <th className="px-4 py-3 font-medium">Source</th>
              <th className="px-4 py-3 font-medium">Destination</th>
              <th className="px-4 py-3 font-medium">Protocol</th>
              <th className="px-4 py-3 font-medium">Port</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-white">
            {trafficEvents.map((event) => (
              <tr key={event._id}>
                <td className="px-4 py-3 font-medium text-slate-700">
                  {event.srcIp ?? "unknown"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {event.dstIp ?? "unknown"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {event.protocol ?? "n/a"}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {event.dstPort ?? "n/a"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {trafficEvents.length === 0 && (
          <div className="px-4 py-5 text-sm text-slate-500">
            No recent traffic events.
          </div>
        )}
      </div>
    </div>
  );
}
