import { CircleHelp, Shield, Trash2 } from "lucide-react";
import type { MonitoredRange, ProtocolScope } from "@/lib/admin-types";
import type { MonitoredRangeForm } from "@/lib/settings-forms";
import { SettingsAccordionSection } from "@/app/components/sections/SettingsSections";
import type { SettingsSectionId } from "@/lib/settings-sections";

type MonitoredRangesSectionProps = {
  form: MonitoredRangeForm;
  isOpen: boolean;
  isPending: boolean;
  ranges: MonitoredRange[];
  onToggle: (id: SettingsSectionId) => void;
  onSubmit: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
  onEdit: (range: MonitoredRange) => void;
  onDelete: (range: MonitoredRange) => void;
  onFormChange: (
    updater: (current: MonitoredRangeForm) => MonitoredRangeForm
  ) => void;
};

export function MonitoredRangesSection({
  form,
  isOpen,
  isPending,
  ranges,
  onToggle,
  onSubmit,
  onReset,
  onOpenHelp,
  onEdit,
  onDelete,
  onFormChange
}: MonitoredRangesSectionProps) {
  return (
    <SettingsAccordionSection
      id="ranges"
      accentClassName="text-cyan-700"
      eyebrow="Monitored IP Ranges"
      title="Set Monitored IP Ranges"
      description="Define the IP ranges that the collector will monitor, along with their protocol scope and inspection profile."
      icon={<Shield className="h-8 w-8" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
                Monitored IP Ranges
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Set Monitored IP Ranges
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Monitored ranges instructions"
                onClick={onOpenHelp}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-cyan-200 bg-cyan-50 text-cyan-700 transition hover:bg-cyan-100"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
              <Shield className="h-8 w-8 text-cyan-700" />
            </div>
          </div>

          <form
            className="mt-6 grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              onSubmit();
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Name
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  value={form.name}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="DMZ perimeter"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Protocol scope
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  value={form.protocolScope}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      protocolScope: event.target.value as ProtocolScope
                    }))
                  }
                >
                  <option value="ANY">Any</option>
                  <option value="TCP">TCP</option>
                  <option value="UDP">UDP</option>
                  <option value="ICMP">ICMP</option>
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Start IP
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  value={form.startIp}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      startIp: event.target.value
                    }))
                  }
                  placeholder="10.0.0.10"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                End IP
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  value={form.endIp}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      endIp: event.target.value
                    }))
                  }
                  placeholder="10.0.0.254"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Inspection profile
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                  value={form.inspectionProfile}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      inspectionProfile: event.target.value as MonitoredRangeForm["inspectionProfile"]
                    }))
                  }
                >
                  <option value="BASELINE">Baseline</option>
                  <option value="BEHAVIORAL">Behavioral</option>
                  <option value="DEEP_PACKET">Deep packet</option>
                </select>
              </label>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
                <input
                  checked={form.enabled}
                  type="checkbox"
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      enabled: event.target.checked
                    }))
                  }
                />
                Active Range
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea
                className="min-h-28 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-cyan-500 focus:bg-white"
                value={form.description}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                placeholder="Monitor inbound and east-west traffic for high-risk segments."
              />
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {form.id ? "Save Changes" : "Add Range"}
              </button>
              <button
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={onReset}
              >
                Reset Form
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <h2 className="text-2xl font-semibold">Active Monitored Segments</h2>
          <div className="mt-6 space-y-4">
            {ranges.length === 0 && (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No monitored IP ranges defined yet.
              </p>
            )}

            {ranges.map((range) => (
              <article
                key={range._id}
                className="rounded-[1.25rem] border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {range.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          range.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {range.enabled ? "active" : "paused"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {range.startIp} - {range.endIp}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {range.description || "No description provided."}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => onEdit(range)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      type="button"
                      onClick={() => onDelete(range)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </SettingsAccordionSection>
  );
}
