import { Panel, StatusPill } from "@transitlink/ui";
import { routes, buses, occupancy } from "../../../lib/demo-data";

export default function PassengerSearchPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <Panel title="Find a bus" eyebrow="Search and schedules">
          <div className="grid gap-3">
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Origin city" defaultValue="Hyderabad" />
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Destination city" defaultValue="Guntur" />
            <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Search buses</button>
          </div>
        </Panel>
        <Panel title="Matching services" eyebrow="Realtime seat visibility">
          <div className="grid gap-3">
            {buses.map((bus) => {
              const route = routes.find((item) => item.id === bus.routeId)!;
              const status = occupancy.find((item) => item.busId === bus.id)!;
              return (
                <div key={bus.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                  <div>
                    <p className="font-medium text-white">{route.name}</p>
                    <p className="text-sm text-slate-300">{bus.code} · {bus.telemetry.speedKmph} km/h · {status.availableSeats} seats free</p>
                  </div>
                  <StatusPill tone={status.indicator}>{status.indicator}</StatusPill>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>
    </main>
  );
}
