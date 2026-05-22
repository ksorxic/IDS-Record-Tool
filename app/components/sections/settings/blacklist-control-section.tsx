import { Ban, CircleHelp, Trash2 } from "lucide-react";
import type { BlacklistEntry } from "@/lib/admin-types";
import type { BlacklistForm } from "@/lib/settings-forms";
import { SettingsAccordionSection } from "@/app/components/sections/SettingsSections";
import type { SettingsSectionId } from "@/lib/settings-sections";

type BlacklistControlSectionProps = {
  form: BlacklistForm;
  isOpen: boolean;
  isPending: boolean;
  entries: BlacklistEntry[];
  onToggle: (id: SettingsSectionId) => void;
  onSubmit: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
  onEdit: (entry: BlacklistEntry) => void;
  onDelete: (entry: BlacklistEntry) => void;
  onFormChange: (updater: (current: BlacklistForm) => BlacklistForm) => void;
};

export function BlacklistControlSection({ form, isOpen, isPending, entries, onToggle, onSubmit,
  onReset,
  onOpenHelp,
  onEdit,
  onDelete,
  onFormChange
}: BlacklistControlSectionProps) {
  return (
    <SettingsAccordionSection
      id="blacklist"
      accentClassName="text-rose-700"
      eyebrow="Blacklist Control"
      title="Set IPs in Blacklist"
      description="Manage blocked IPs, their source, and the reason for their exclusion."
      icon={<Ban className="h-8 w-8" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-rose-700">
                Blacklist Control
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Set IPs in Blacklist
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Blacklist instructions"
                onClick={onOpenHelp}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-rose-700 transition hover:bg-rose-100"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
              <Ban className="h-8 w-8 text-rose-700" />
            </div>
          </div>

          <form className="mt-6 grid gap-4" onSubmit={(event) => {event.preventDefault(); onSubmit();   }}          >
            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                IPv4
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500 focus:bg-white"
                  value={form.ip}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      ip: event.target.value
                    }))
                  }
                  placeholder="203.0.113.11"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Source
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500 focus:bg-white"
                  value={form.source}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      source: event.target.value
                    }))
                  }
                  placeholder="manual"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Reason
              <textarea
                className="min-h-28 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-rose-500 focus:bg-white"
                value={form.reason}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    reason: event.target.value
                  }))
                }
                placeholder="Repeated port scans and malformed packet bursts."
              />
            </label>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                checked={form.active}
                type="checkbox"
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    active: event.target.checked
                  }))
                }
              />
              Active Blacklist Rule
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {form.id ? "Αποθήκευση IP" : "Προσθήκη στη blacklist"}
              </button>
              <button
                className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                type="button"
                onClick={onReset}
              >
                Form Reset
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <h2 className="text-2xl font-semibold">Blacklist registry</h2>
          <div className="mt-6 space-y-4">
            {entries.length === 0 && (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No blacklist records found.
              </p>
            )}

            {entries.map((entry) => (
              <article
                key={entry._id}
                className="rounded-[1.25rem] border border-slate-200 p-4"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {entry.ip}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          entry.active
                            ? "bg-rose-100 text-rose-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {entry.active ? "blocked" : "inactive"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      Source: {entry.source}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {entry.reason || "No reason provided."}
                    </p>
                  </div>

                  <div className="grid gap-2 sm:grid-cols-2">
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => onEdit(entry)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      type="button"
                      onClick={() => onDelete(entry)}
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
