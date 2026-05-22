'use client';
import type { DashboardData } from "@/lib/admin-types";
import { useMemo } from "react";

function SummaryCard(card:DashboardData["summaryCards"][number]) {
    return (
        <article key={card.label} className="rounded-3xl border border-slate-200/70 bg-white p-4 ">
            <p className="text-sm font-medium text-slate-900">{card.label}</p>
            <p className="mt-3 text-3xl font-semibold text-black">
                {card.value}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-400">
                {card.helper}
            </p>
        </article>
    )
}

export default function SummaryCards(dashboard: DashboardData) {

    function buildSummaryCardsForView( dashboard: DashboardData): DashboardData["summaryCards"] {
        const serverTrafficCard = dashboard.summaryCards.find(
            (card) => card.label === "24h Traffic Events"
        );
        const criticalAlerts = dashboard.alerts.filter(
            (alert) => (alert.severity ?? "").toLowerCase() === "critical"
        ).length;
        const activeRanges = dashboard.monitoredRanges.filter((item) => item.enabled).length;
        const activeBlacklist = dashboard.blacklist.filter((item) => item.active).length;

        return [
            {
            label: "Monitored Ranges",
            value: String(activeRanges),
            helper: `${dashboard.monitoredRanges.length} total IP windows across the perimeter`
            },
            {
            label: "Critical Alerts",
            value: String(criticalAlerts),
            helper: "Immediate packet anomalies requiring analyst review"
            },
            {
            label: "Blacklisted IPs",
            value: String(activeBlacklist),
            helper: `${dashboard.blacklist.length} stored ban records from all sources`
            },
            {
            label: "24h Traffic Events",
            value: serverTrafficCard?.value ?? "0",
            helper: serverTrafficCard?.helper ?? "Recent flows ingested for suspicious packet inspection"
            }
        ];
    }

    const summaryCards = useMemo(
        () => buildSummaryCardsForView(dashboard),
        [dashboard]
    );

    return (
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.label} {...card} />
          ))}
        </section>
    )
}