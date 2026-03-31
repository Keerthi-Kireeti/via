import Link from "next/link";
import { Panel, StatusPill, Button } from "@transitlink/ui";
import { Hero, MapPanel, PredictionList } from "../../components/cards";
import { buses, notifications, occupancy, routes, seatPredictions, tickets } from "../../lib/demo-data";

export default function PassengerDashboard() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Hero kicker="Passenger workspace" title="Travel with connected buses." description="Live seat signals, route ETAs, and automatic alerts for your lineage journey." />
          <div className="mt-2 flex flex-wrap gap-3">
            <Link href="/passenger/search" className="flex-1 sm:flex-none">
              <Button size="lg" className="w-full">Search buses</Button>
            </Link>
            <Link href="/passenger/tickets" className="flex-1 sm:flex-none">
              <Button variant="secondary" size="lg" className="w-full">Active ticket</Button>
            </Link>
          </div>
        </div>
        <Panel title="Active lineage ticket" eyebrow="Transfer allowed">
          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 dark:bg-cyan-400/5 p-4 shadow-sm">
            <p className="text-xs sm:text-sm text-cyan-700 dark:text-cyan-100 font-mono">{tickets[0].ticketId}</p>
            <p className="mt-2 text-xl sm:text-2xl font-semibold text-slate-900 dark:text-white">Hyderabad → Guntur</p>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300">Board any bus on lineage `lin-1` until destination.</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <StatusPill tone="green">Bus 101 onboard</StatusPill>
            <StatusPill tone="yellow">1 transfer</StatusPill>
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
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
                <p className="font-medium text-slate-800 dark:text-slate-200">{route.origin} → {route.destination}</p>
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
            <div key={note.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-900/70 p-4 text-sm text-slate-600 dark:text-slate-300 shadow-sm">
              <p className="font-semibold text-slate-900 dark:text-white">{note.title}</p>
              <p className="mt-1">{note.message}</p>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
