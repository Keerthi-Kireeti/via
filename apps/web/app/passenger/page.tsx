import Link from "next/link";
import { Panel, StatusPill } from "@transitlink/ui";
import { Hero, MapPanel, PredictionList } from "../../components/cards";
import { buses, notifications, occupancy, routes, seatPredictions, tickets } from "../../lib/demo-data";

export default function PassengerDashboard() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Hero kicker="Passenger workspace" title="Travel across connected buses with one lineage ticket." description="See nearby buses, live seat signals, route ETAs, and automatic alerts when occupancy improves before you board." />
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/passenger/search" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">Search buses</Link>
            <Link href="/passenger/tickets" className="rounded-full border border-white/15 px-5 py-3 text-white">View active ticket</Link>
          </div>
        </div>
        <Panel title="Active lineage ticket" eyebrow="A → D transfer allowed">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
            <p className="text-sm text-cyan-100">{tickets[0].ticketId}</p>
            <p className="mt-2 text-2xl font-semibold text-white">Hyderabad → Guntur</p>
            <p className="mt-2 text-sm text-slate-300">Board any bus on lineage `lin-1` until your destination stop.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone="green">Bus 101 onboard</StatusPill>
            <StatusPill tone="yellow">1 transfer remaining likely</StatusPill>
          </div>
        </Panel>
      </section>
      <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <MapPanel title="Nearby buses" subtitle="GPS-ranked buses near Hyderabad with ETA and occupancy overlays." />
        <PredictionList predictions={seatPredictions} />
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {buses.map((bus) => {
          const route = routes.find((item) => item.id === bus.routeId)!;
          const status = occupancy.find((item) => item.busId === bus.id)!;
          return (
            <Panel key={bus.id} title={bus.code} eyebrow={route.code}>
              <div className="space-y-2 text-sm text-slate-300">
                <p>{route.origin} → {route.destination}</p>
                <p>{status.availableSeats} seats free · {bus.telemetry.speedKmph} km/h</p>
                <StatusPill tone={status.indicator}>{status.indicator} availability</StatusPill>
              </div>
            </Panel>
          );
        })}
      </div>
      <Panel title="Alerts" eyebrow="Realtime notifications">
        <div className="grid gap-3">
          {notifications.map((note) => (
            <div key={note.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4 text-sm text-slate-300">
              <p className="font-medium text-white">{note.title}</p>
              <p className="mt-1">{note.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
