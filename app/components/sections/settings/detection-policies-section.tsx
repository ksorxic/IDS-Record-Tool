import { CheckCircle2, CircleHelp, Trash2 } from "lucide-react";
import type { DetectionRule, DetectionRuleType } from "@/lib/admin-types";
import {
  detectionRuleCardActionsClassName,
  detectionRuleCardBodyClassName,
  detectionRuleCardContentClassName
} from "@/lib/detection-policies-layout";
import { getRuleCatalogEntry, ruleCatalog } from "@/lib/rule-catalog";
import type { RuleForm } from "@/lib/settings-forms";
import { SettingsAccordionSection } from "@/app/components/sections/SettingsSections";
import type { SettingsSectionId } from "@/lib/settings-sections";

type DetectionPoliciesSectionProps = {
  form: RuleForm;
  isOpen: boolean;
  isPending: boolean;
  rules: DetectionRule[];
  onToggle: (id: SettingsSectionId) => void;
  onSubmit: () => void;
  onReset: () => void;
  onOpenHelp: () => void;
  onEdit: (rule: DetectionRule) => void;
  onDelete: (rule: DetectionRule) => void;
  onRuleTypeSelect: (type: DetectionRuleType) => void;
  onFormChange: (updater: (current: RuleForm) => RuleForm) => void;
};

export function DetectionPoliciesSection({
  form,
  isOpen,
  isPending,
  rules,
  onToggle,
  onSubmit,
  onReset,
  onOpenHelp,
  onEdit,
  onDelete,
  onRuleTypeSelect,
  onFormChange
}: DetectionPoliciesSectionProps) {
  return (
    <SettingsAccordionSection
      id="rules"
      accentClassName="text-violet-700"
      eyebrow="Detection Policies"
      title=" Detection Rules"
      description="Define thresholds and time windows for the detection patterns of the collector."
      icon={<CheckCircle2 className="h-8 w-8" />}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[1.75rem] border border-slate-200/70 bg-white p-4 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-700">
                Detection Policies
              </p>
              <h2 className="mt-2 text-2xl font-semibold">
                Detection Rules
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Detection policy instructions"
                onClick={onOpenHelp}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-violet-200 bg-violet-50 text-violet-700 transition hover:bg-violet-100"
              >
                <CircleHelp className="h-5 w-5" />
              </button>
              <CheckCircle2 className="h-8 w-8 text-violet-700" />
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
                Rule name
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                  value={form.name}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      name: event.target.value
                    }))
                  }
                  placeholder="Datacenter traffic spike"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Rule type
                <select
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                  value={form.type}
                  onChange={(event) =>
                    onRuleTypeSelect(event.target.value as DetectionRuleType)
                  }
                >
                  {ruleCatalog.map((entry) => (
                    <option key={entry.type} value={entry.type}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Threshold
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                  value={form.threshold}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      threshold: event.target.value
                    }))
                  }
                  placeholder="500"
                  type="number"
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-slate-700">
                Time window (minutes)
                <input
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                  value={form.windowMinutes}
                  onChange={(event) =>
                    onFormChange((current) => ({
                      ...current,
                      windowMinutes: event.target.value
                    }))
                  }
                  placeholder="5"
                  type="number"
                />
              </label>
            </div>

            <label className="grid gap-2 text-sm font-medium text-slate-700">
              Description
              <textarea
                className="min-h-24 rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-violet-500 focus:bg-white"
                value={form.description}
                onChange={(event) =>
                  onFormChange((current) => ({
                    ...current,
                    description: event.target.value
                  }))
                }
                placeholder="Description of the detection pattern and thresholds."
              />
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
              Enabled Detection Rule
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                className="rounded-full bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isPending}
                type="submit"
              >
                {form.id ? "Save Rule" : "Create Rule"}
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
          <h2 className="text-2xl font-semibold">Detection rules overview</h2>
          <div className="mt-6 space-y-4">
            {rules.length === 0 && (
              <p className="rounded-2xl bg-slate-50 px-4 py-5 text-sm text-slate-500">
                No configured detection rules defined yet.
              </p>
            )}

            {rules.map((rule) => (
              <article
                key={rule._id}
                className="rounded-[1.25rem] border border-slate-200 p-4"
              >
                <div className={detectionRuleCardBodyClassName}>
                  <div className={detectionRuleCardContentClassName}>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {rule.name}
                      </h3>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
                          rule.enabled
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {rule.enabled ? "enabled" : "disabled"}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-medium text-slate-700">
                      {getRuleCatalogEntry(rule.type).label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {rule.description || "No description provided."}
                    </p>
                  </div>

                  <div className={detectionRuleCardActionsClassName}>
                    <button
                      className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      type="button"
                      onClick={() => onEdit(rule)}
                    >
                      Edit
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                      type="button"
                      onClick={() => onDelete(rule)}
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
