import { Panel, StatusPill } from "@transitlink/ui";
import { routes, seatPredictions } from "../../../lib/demo-data";

export default function PassengerBookingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Book route-lineage ticket" eyebrow="Origin to destination">
          <div className="grid gap-3">
            <select className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"><option>Hyderabad</option><option>Warangal</option></select>
            <select className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"><option>Guntur</option><option>Vijayawada</option></select>
            <select className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white"><option>RTC100 lineage</option><option>RTC200 lineage</option></select>
            <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Purchase digital ticket</button>
          </div>
        </Panel>
        <Panel title="Why this ticket works" eyebrow="Transfer logic">
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Buy once for the full corridor and board any bus on the same route lineage until your destination stop.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">Conductors validate the QR against lineage id, stop segment, and remaining journey entitlement.</div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">AI forecasts can warn you which stop windows are likely to open more seats before departure.</div>
            <div className="flex flex-wrap gap-2">{seatPredictions.map((prediction) => <StatusPill key={prediction.stopId} tone={prediction.availabilityIndicator}>{prediction.timeWindow}</StatusPill>)}</div>
            <p className="text-xs text-slate-400">Routes available: {routes.map((route) => route.code).join(", ")}</p>
          </div>
        </Panel>
      </div>
    </main>
  );
}
