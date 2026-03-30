import { Panel, StatusPill, Input, Button } from "@transitlink/ui";
import { routes, buses, occupancy } from "../../../lib/demo-data";

export default function PassengerSearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Find a bus" eyebrow="Search and schedules">
          <div className="grid gap-4">
            <Input label="Origin city" defaultValue="Hyderabad" />
            <Input label="Destination city" defaultValue="Guntur" />
            <Button size="lg" className="w-full">Search buses</Button>
          </div>
        </Panel>
        <Panel title="Matching services" eyebrow="Realtime seat visibility">
          <div className="grid gap-4">
            {buses.map((bus) => {
              const route = routes.find((item) => item.id === bus.routeId)!;
              const status = occupancy.find((item) => item.busId === bus.id)!;
              return (
                <div key={bus.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 shadow-sm dark:shadow-none">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{route.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                      <span className="text-cyan-600 dark:text-cyan-400">{bus.code}</span> · {bus.telemetry.speedKmph} km/h · {status.availableSeats} seats free
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusPill tone={status.indicator}>{status.indicator}</StatusPill>
                    <Button size="sm" variant="secondary">Book</Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </main>
  );
}
