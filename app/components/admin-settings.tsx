"use client";

import { useEffect, useState, useTransition } from "react";
import { Settings } from "lucide-react";
import type {
  BlacklistEntry,
  DashboardData,
  DetectionRule,
  DetectionRuleType,
  MonitoredRange
} from "@/lib/admin-types";
import { useAppToast } from "@/app/components/app-toast-provider";
import {
  toggleSettingsSection,
  type SettingsSectionId
} from "@/lib/settings-sections";
import SettingsFormHelper from "@/app/components/modals/settings-form-helper";
import {
  applyRulePreset,
  emptyBlacklistForm,
  emptyMonitoredRangeForm,
  emptyRuleForm,
  toBlacklistForm,
  toMonitoredRangeForm,
  toRuleForm,
  type BlacklistForm,
  type MonitoredRangeForm,
  type RuleForm
} from "@/lib/settings-forms";
import type { SettingsHelpSectionId } from "@/lib/settings-help";
import {
  deleteBlacklistEntry,
  deleteDetectionRule,
  deleteMonitoredRange,
  fetchDashboardSnapshot,
  saveBlacklistEntry,
  saveDetectionRule,
  saveMonitoredRange
} from "@/lib/calls/settings";
import { MonitoredRangesSection } from "@/app/components/sections/settings/monitored-ranges-section";
import { DetectionPoliciesSection } from "@/app/components/sections/settings/detection-policies-section";
import { BlacklistControlSection } from "@/app/components/sections/settings/blacklist-control-section";

type AdminSettingsProps = {
  initialData: DashboardData;
};

export default function AdminSettings({ initialData }: AdminSettingsProps) {
  const [dashboard, setDashboard] = useState(initialData);
  const [openSection, setOpenSection] = useState<SettingsSectionId | null>(null);
  const [rangeForm, setRangeForm] =
    useState<MonitoredRangeForm>(emptyMonitoredRangeForm);
  const [blacklistForm, setBlacklistForm] =
    useState<BlacklistForm>(emptyBlacklistForm);
  const [ruleForm, setRuleForm] = useState<RuleForm>(emptyRuleForm);
  const [activeSettingsHelp, setActiveSettingsHelp] = useState<SettingsHelpSectionId | null>(null);
  const [isPending, runTransition] = useTransition();
  const { showToast } = useAppToast();

  useEffect(() => {
    let isCancelled = false;

    async function loadDashboardData() {
      try {
        const data = await fetchDashboardSnapshot();

        if (!isCancelled) {
          setDashboard(data);
        }
      } catch {
        // no-op
      }
    }

    void loadDashboardData();
    const interval = window.setInterval(() => {
      void loadDashboardData();
    }, 7000);

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
    };
  }, []);

  const handleSectionToggle = (section: SettingsSectionId) => {
    setOpenSection((current) => toggleSettingsSection(current, section));
  };

  const replaceRange = (updater: (items: MonitoredRange[]) => MonitoredRange[]) => {
    setDashboard((current) => ({
      ...current,
      monitoredRanges: updater(current.monitoredRanges)
    }));
  };

  const replaceBlacklist = (
    updater: (items: BlacklistEntry[]) => BlacklistEntry[]
  ) => {
    setDashboard((current) => ({
      ...current,
      blacklist: updater(current.blacklist)
    }));
  };

  const replaceRules = (updater: (items: DetectionRule[]) => DetectionRule[]) => {
    setDashboard((current) => ({
      ...current,
      rules: updater(current.rules)
    }));
  };

  function handleAsync(action: () => Promise<void>) {
    runTransition(() => {
      void action().catch((cause) => {
        showToast(
          "error",
          cause instanceof Error
            ? cause.message
            : "Παρουσιάστηκε σφάλμα κατά την αποθήκευση."
        );
      });
    });
  }

  function handleRuleTypeSelect(type: DetectionRuleType) {
    setRuleForm((current) => applyRulePreset(current, type));
  }

  async function submitRange() {
    setOpenSection("ranges");

    const optimisticRecord = await saveMonitoredRange(rangeForm);

    replaceRange((items) => {
      if (rangeForm.id) {
        return items.map((item) =>
          item._id === rangeForm.id
            ? { ...item, ...optimisticRecord, _id: rangeForm.id }
            : item
        );
      }

      return [optimisticRecord, ...items].slice(0, 8);
    });

    setRangeForm(emptyMonitoredRangeForm);
    showToast(
      "success",
      rangeForm.id
        ? "Το monitored IP range ενημερώθηκε."
        : "Το monitored IP range προστέθηκε."
    );
  }

  async function submitBlacklistEntry() {
    setOpenSection("blacklist");

    const optimisticRecord = await saveBlacklistEntry(blacklistForm);

    replaceBlacklist((items) => {
      if (blacklistForm.id) {
        return items.map((item) =>
          item._id === blacklistForm.id
            ? { ...item, ...optimisticRecord, _id: blacklistForm.id }
            : item
        );
      }

      const withoutSameIp = items.filter((item) => item.ip !== optimisticRecord.ip);
      return [optimisticRecord, ...withoutSameIp].slice(0, 8);
    });

    setBlacklistForm(emptyBlacklistForm);
    showToast(
      "success",
      blacklistForm.id
        ? "Η blacklist εγγραφή ενημερώθηκε."
        : "Η IP μπήκε στη blacklist."
    );
  }

  async function submitRule() {
    setOpenSection("rules");

    const optimisticRecord = await saveDetectionRule(ruleForm);

    replaceRules((items) => {
      if (ruleForm.id) {
        return items.map((item) =>
          item._id === ruleForm.id
            ? { ...item, ...optimisticRecord, _id: ruleForm.id }
            : item
        );
      }

      return [optimisticRecord, ...items].slice(0, 8);
    });

    setRuleForm(emptyRuleForm);
    showToast(
      "success",
      ruleForm.id
        ? "Ο detection rule ενημερώθηκε."
        : "Ο detection rule δημιουργήθηκε."
    );
  }

  return (
    <main className="flex-1 text-slate-100">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        {activeSettingsHelp && (
          <SettingsFormHelper
            section={activeSettingsHelp}
            closeModal={() => setActiveSettingsHelp(null)}
          />
        )}

        <section className="px-1 py-2 sm:px-0 sm:py-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-600">
            <Settings className="h-4 w-4" />
            IDS Settings
          </div>
        </section>

        <MonitoredRangesSection
          form={rangeForm}
          isOpen={openSection === "ranges"}
          isPending={isPending}
          ranges={dashboard.monitoredRanges}
          onToggle={handleSectionToggle}
          onSubmit={() => handleAsync(submitRange)}
          onReset={() => setRangeForm(emptyMonitoredRangeForm)}
          onOpenHelp={() => setActiveSettingsHelp("ranges")}
          onEdit={(range) => setRangeForm(toMonitoredRangeForm(range))}
          onDelete={(range) =>
            handleAsync(async () => {
              await deleteMonitoredRange(range._id);
              replaceRange((items) =>
                items.filter((item) => item._id !== range._id)
              );
              showToast("success", "Το monitored range διαγράφηκε.");
            })
          }
          onFormChange={(updater) => setRangeForm((current) => updater(current))}
        />

        <DetectionPoliciesSection
          form={ruleForm}
          isOpen={openSection === "rules"}
          isPending={isPending}
          rules={dashboard.rules}
          onToggle={handleSectionToggle}
          onSubmit={() => handleAsync(submitRule)}
          onReset={() => setRuleForm(emptyRuleForm)}
          onOpenHelp={() => setActiveSettingsHelp("rules")}
          onEdit={(rule) => setRuleForm(toRuleForm(rule))}
          onDelete={(rule) =>
            handleAsync(async () => {
              await deleteDetectionRule(rule._id);
              replaceRules((items) =>
                items.filter((item) => item._id !== rule._id)
              );
              showToast("success", "Ο detection rule διαγράφηκε.");
            })
          }
          onRuleTypeSelect={handleRuleTypeSelect}
          onFormChange={(updater) => setRuleForm((current) => updater(current))}
        />

        <BlacklistControlSection
          form={blacklistForm}
          isOpen={openSection === "blacklist"}
          isPending={isPending}
          entries={dashboard.blacklist}
          onToggle={handleSectionToggle}
          onSubmit={() => handleAsync(submitBlacklistEntry)}
          onReset={() => setBlacklistForm(emptyBlacklistForm)}
          onOpenHelp={() => setActiveSettingsHelp("blacklist")}
          onEdit={(entry) => setBlacklistForm(toBlacklistForm(entry))}
          onDelete={(entry) =>
            handleAsync(async () => {
              await deleteBlacklistEntry(entry._id);
              replaceBlacklist((items) =>
                items.filter((item) => item._id !== entry._id)
              );
              showToast("success", "Η blacklist εγγραφή διαγράφηκε.");
            })
          }
          onFormChange={(updater) =>
            setBlacklistForm((current) => updater(current))
          }
        />
      </div>
    </main>
  );
}
