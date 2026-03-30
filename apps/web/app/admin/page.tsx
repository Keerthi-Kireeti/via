import { Panel, StatusPill, Button } from "@transitlink/ui";

export default function AdminPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <StatGrid items={adminStats} />
      
      <div className="flex justify-end gap-3">
        <Button variant="secondary" size="sm">Export Report</Button>
        <Button size="sm">+ Add New Route</Button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <MapPanel title="Occupancy heatmap" subtitle="Route congestion overlay by bus load, route lineage, and city corridor." />
        <Panel title="Congestion watchlist" eyebrow="Most pressured routes">
          <div className="grid gap-3">
            {buses.map((bus) => {
              const route = routes.find((item) => item.id === bus.routeId)!;
              const status = occupancy.find((item) => item.busId === bus.id)!;
              return (
                <div key={bus.id} className="flex items-center justify-between rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 shadow-sm dark:shadow-none">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{route.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{bus.code} · {status.occupiedSeats}/{bus.capacity.seats}</p>
                  </div>
                  <StatusPill tone={status.indicator}>{status.indicator}</StatusPill>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
      <Panel title="Operations board" eyebrow="Fleet and conductor activity">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none font-medium">Add buses and assign route lineages.</div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none font-medium">Monitor conductor scan throughput and exception cases.</div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none font-medium">Track parcel delivery SLA and health alerts.</div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm dark:shadow-none font-medium">Compare ticket and logistics revenue by route corridor.</div>
        </div>
      </Panel>
    </main>
  );
}
