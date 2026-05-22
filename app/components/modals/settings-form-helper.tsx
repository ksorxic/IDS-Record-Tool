"use client";

import { Activity, AlignLeft, Clock, Gauge, Globe, Network, Radio, ShieldCheck, Tag, ToggleLeft, X} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {  settingsHelpContent,  type SettingsHelpItem,  type SettingsHelpSectionId} from "@/lib/settings-help";

type SettingsFormHelperProps = {
  section: SettingsHelpSectionId;
  closeModal: () => void;
};

const iconMap: Record<SettingsHelpItem["icon"], typeof Tag> = {
  tag: Tag,
  network: Network,
  shield: ShieldCheck,
  toggle: ToggleLeft,
  file: AlignLeft,
  globe: Globe,
  source: Radio,
  activity: Activity,
  gauge: Gauge,
  clock: Clock
};

export default function SettingsFormHelper({  section,  closeModal}: SettingsFormHelperProps) {
  const content = settingsHelpContent[section];
  console.log("Rendering SettingsFormHelper with content:", content);
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-150 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          onClick={closeModal}
          className="absolute inset-0 bg-slate-950/40"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
          exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)", y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-4xl border border-white/40 bg-white/90 shadow-[0_30px_100px_rgba(15,23,42,0.3)] backdrop-blur-2xl"
        >
          <div className="flex items-center justify-between border-b border-slate-100 p-6 sm:px-8">
            <div>
              <p
                className={`text-[10px] font-bold uppercase tracking-[0.25em] ${content.accentClassName}`}
              >
                {content.eyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">
                {content.title}
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                {content.summary}
              </p>
            </div>
            <button
              onClick={closeModal}
              className="group flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 transition-all hover:rotate-90 hover:bg-red-50 hover:text-red-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="overflow-y-auto p-6 sm:p-8">
            <div className="grid gap-6">
              {content.items.map((item, index) => {
                const Icon = iconMap[item.icon];

                return (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 sm:gap-6"
                  >
                    <div
                      className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${item.bg} ${item.color} shadow-sm`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        {item.label}
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-100 bg-slate-50/50 p-6 text-center">
            <button
              onClick={closeModal}
              className="rounded-xl bg-slate-900 px-8 py-2.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
            >
              Ok
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
