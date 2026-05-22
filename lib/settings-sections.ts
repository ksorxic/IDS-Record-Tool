import type { ReactNode } from "react";

export const settingsSectionOrder = ["ranges", "rules", "blacklist"] as const;

export type SettingsSectionId = (typeof settingsSectionOrder)[number];

export type SettingsAccordionSectionProps = {
  id: SettingsSectionId;
  accentClassName: string;
  eyebrow: string;
  title: string;
  description: string;
  icon: ReactNode;
  isOpen: boolean;
  onToggle: (id: SettingsSectionId) => void;
  children: ReactNode;
};

export function getDefaultSettingsSection(): SettingsSectionId {
  return "ranges";
}

export function toggleSettingsSection(
  current: SettingsSectionId | null,
  next: SettingsSectionId
): SettingsSectionId | null {
  return current === next ? null : next;
}
