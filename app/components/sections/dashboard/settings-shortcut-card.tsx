import Link from "next/link";
import { ChevronRight, Settings } from "lucide-react";

export default function SettingsShortcutCard() {
  return (
    <Link
      href="/settings"
      className="group rounded-[1.75rem] border border-slate-200/70 bg-white p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-700">
            Settings
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            Monitored ranges, rules and blacklist
          </h2>

        </div>
        <Settings className="h-8 w-8 text-cyan-700" />
      </div>
      <div className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-cyan-700">
        Open settings
        <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
