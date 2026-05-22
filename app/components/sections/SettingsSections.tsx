import { SettingsAccordionSectionProps } from "@/lib/settings-sections";
import { ChevronDown } from "lucide-react";

export function SettingsAccordionSection({ id, accentClassName, eyebrow, title, description, icon, isOpen, onToggle, children }: SettingsAccordionSectionProps) {
  return (
    <section id={id} className="overflow-hidden rounded-[1.75rem] border border-slate-200/70 bg-white text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)] transition-all duration-300"  >
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={`${id}-panel`}
        onClick={() => onToggle(id)}
        className="flex w-full items-start justify-between gap-4 px-4 py-5 text-left transition hover:bg-slate-50 sm:px-6"
      >
        <div className="min-w-0">
          <p className={`text-sm font-semibold uppercase tracking-[0.18em] ${accentClassName}`}>
            {eyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold">
            {title}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <div className={accentClassName}>{icon}</div>
          <span
            className={`rounded-full border border-slate-200 p-2 text-slate-500 transition-all duration-500 ease-in-out ${
              isOpen ? "rotate-180 bg-slate-950 text-white" : "bg-white"
            }`}
          >
            <ChevronDown className="h-4 w-4" />
          </span>
        </div>
      </button>

      {/* Σταδιακό Άνοιγμα Περιεχομένου */}
      <div id={`${id}-panel`} className={`grid transition-all duration-500 ease-in-out ${isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"   }`}    >
        <div className="overflow-hidden">
          <div className="border-t border-slate-200/80 px-4 py-5 sm:px-6">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}