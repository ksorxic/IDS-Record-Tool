import { AlertTriangle } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import type { ChartPoint } from "@/lib/admin-types";
import {
  severityMixCardClassName,
  severityMixChartAreaClassName
} from "@/lib/dashboard-layout";

const alertPalette = ["#f97316", "#ea580c", "#f59e0b", "#facc15"];

type SeverityMixSectionProps = {
  alertsBySeverity: ChartPoint[];
  hasMounted: boolean;
};

export default function SeverityMixSection({
  alertsBySeverity,
  hasMounted
}: SeverityMixSectionProps) {
  return (
    <div className={severityMixCardClassName}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-orange-700">
            Severity Mix
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
             Severity Distribution
          </h2>
        </div>
        <AlertTriangle className="h-8 w-8 text-orange-700" />
      </div>
      <div className={severityMixChartAreaClassName}>
        {hasMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={alertsBySeverity}>
              <CartesianGrid stroke="#e2e8f0" strokeDasharray="4 4" />
              <XAxis dataKey="label" tick={{ fill: "#475569", fontSize: 12 }} />
              <YAxis tick={{ fill: "#475569", fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" radius={[12, 12, 0, 0]}>
                {alertsBySeverity.map((entry, index) => (
                  <Cell
                    key={`${entry.label}-${index}`}
                    fill={alertPalette[index % alertPalette.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full animate-pulse rounded-3xl bg-slate-100" />
        )}
      </div>
    </div>
  );
}
