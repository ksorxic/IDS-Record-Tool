import type { NetworkOverview } from "@/lib/dashboard-client";

type NetworkOverviewCardsProps = {
  networkOverview: NetworkOverview;
};

export default function NetworkOverviewCards({
  networkOverview
}: NetworkOverviewCardsProps) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-3xl border border-slate-200/70 bg-white p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium text-slate-500">General traffic bytes</p>
        <p className="mt-4 text-3xl font-semibold">
          {networkOverview.totalBytes.toLocaleString("en-US")}
        </p>
        <p className="mt-2 text-sm text-slate-500">
           Total volume from the most recent captured flows.
        </p>
      </article>
      <article className="rounded-3xl border border-slate-200/70 bg-white p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium text-slate-500">Unique source IPs</p>
        <p className="mt-4 text-3xl font-semibold">
          {networkOverview.uniqueSources}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Unique source IP addresses from the most recent traffic.
        </p>
      </article>
      <article className="rounded-3xl border border-slate-200/70 bg-white p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium text-slate-500">Unique destination IPs</p>
        <p className="mt-4 text-3xl font-semibold">
          {networkOverview.uniqueDestinations}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          Unique destination IP addresses from the most recent traffic.
        </p>
      </article>
      <article className="rounded-3xl border border-slate-200/70 bg-white p-5 text-slate-900 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
        <p className="text-sm font-medium text-slate-500">Busiest host</p>
        <p className="mt-4 text-2xl font-semibold">
          {networkOverview.busiestTalker}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          The busiest source based on the most recent top talkers snapshot.
        </p>
      </article>
    </section>
  );
}
