"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield } from "lucide-react";
import { isPrimaryRoute, primaryNavigationItems } from "@/lib/navigation";

export default function AppNavbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/88 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-white">
          <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950 shadow-[0_12px_24px_rgba(34,211,238,0.28)]">
            <Shield className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <p className="font-[family:var(--font-display)] text-base font-semibold sm:text-lg">
              IDS Record Tool Admin
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">
              Traffic inspection console
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1">
          {primaryNavigationItems.map((item) => {
            const isActive = isPrimaryRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-cyan-400 text-slate-950"
                    : "text-slate-200 hover:bg-white/8 hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
