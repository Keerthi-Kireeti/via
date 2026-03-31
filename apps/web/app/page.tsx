import Link from "next/link";
import { Panel, StatusPill } from "@transitlink/ui";
import { Hero, MapPanel, ParcelTimeline, PredictionList, StatGrid } from "../components/cards";
import { adminStats, notifications, parcelTracking, routes, seatPredictions } from "../lib/demo-data";

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div>
          <Hero
            kicker="Mobility intelligence"
            title="Via turns every bus seat and luggage bay into live capacity."
            description="Give passengers one lineage ticket across connected buses, expose real-time seat confidence, and monetize spare cargo space with QR-tracked parcel logistics."
          />
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/passenger" className="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950">Open passenger app</Link>
            <Link href="/logistics" className="rounded-full border border-white/15 px-5 py-3 text-white">Ship a parcel</Link>
          </div>
        </div>
        <Panel title="Live network pulse" eyebrow="This minute">
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4">
              <div>
                <p className="text-sm text-slate-300">Hyderabad → Guntur lineage</p>
                <p className="mt-1 text-2xl font-semibold text-white">3 buses active</p>
              </div>
              <StatusPill tone="green">Seats opening</StatusPill>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">Passengers</p><p className="mt-2 text-2xl font-semibold">1,648</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">Parcels</p><p className="mt-2 text-2xl font-semibold">37</p></div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4"><p className="text-sm text-slate-300">Alerts</p><p className="mt-2 text-2xl font-semibold">12</p></div>
            </div>
          </div>
        </Panel>
      </section>
      <StatGrid items={adminStats} />
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <MapPanel title="Realtime vehicle map" subtitle="Mapbox-ready map shell with live telemetry overlays and congestion awareness." />
        <PredictionList predictions={seatPredictions} />
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <ParcelTimeline tracking={parcelTracking} />
        <Panel title="Why operators use it" eyebrow="Operational value">
          <div className="grid gap-4 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Route-lineage tickets reduce friction across bus changes while preserving conductor validation.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Cargo-fit simulation finds luggage bay opportunities before confirming parcel bookings.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Admin analytics surface congestion hotspots, bus underutilization, and conductor activity in one view.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Notifications give passengers seat-open alerts and senders live parcel health updates.</div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-400">
            {notifications.map((note) => (
              <span key={note.id} className="rounded-full bg-white/5 px-3 py-2">{note.title}</span>
            ))}
          </div>
        </Panel>
      </div>
      <Panel title="Route coverage" eyebrow="Starter network">
        <div className="grid gap-4 md:grid-cols-2">
          {routes.map((route) => (
            <div key={route.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
              <p className="text-sm text-cyan-200/80">{route.code}</p>
              <p className="mt-2 text-xl font-semibold">{route.name}</p>
              <p className="mt-2 text-sm text-slate-300">{route.origin} → {route.destination} · {route.stops.length} stops</p>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
