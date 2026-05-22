import { CircleHelp, Radar } from "lucide-react";
import type { ChartPoint } from "@/lib/admin-types";

type TrafficCompositionSectionProps = {
  trafficByProtocol: ChartPoint[];
  onOpenHelp: () => void;
};

export default function TrafficCompositionSection({
  trafficByProtocol,
  onOpenHelp
}: TrafficCompositionSectionProps) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
            Protocols
          </p>
          <h2 className="mt-2 text-2xl font-semibold">Traffic composition</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Traffic composition instructions"
            onClick={onOpenHelp}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
          >
            <CircleHelp className="h-5 w-5" />
          </button>
          <Radar className="h-8 w-8 text-violet-700" />
        </div>
      </div>
      <div className="mt-6 space-y-4 overflow-y-auto" style={{ maxHeight: "400px" }}>
        {trafficByProtocol.length === 0 && (
          <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
             No packet flow data available for protocol analysis.
          </p>
        )}
        {trafficByProtocol.map((protocol) => (
          <div key={protocol.label}>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-slate-700">{protocol.label}</span>
              <span className="text-slate-500">{protocol.value}</span>
            </div>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#7c3aed)]"
                style={{
                  width: `${Math.max(
                    8,
                    (protocol.value /
                      Math.max(1, trafficByProtocol[0]?.value ?? 1)) *
                      100
                  )}%`
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
