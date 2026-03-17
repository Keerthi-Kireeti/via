import { Panel, StatusPill } from "@transitlink/ui";
import { buses, occupancy, parcels, tickets } from "../../lib/demo-data";

export default function ConductorPage() {
  const bus = buses[0];
  const status = occupancy[0];
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <Panel title="Conductor panel" eyebrow="Fast scanning workflow">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><p className="text-sm text-slate-300">Active bus</p><p className="mt-2 text-2xl font-semibold text-white">{bus.code}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><p className="text-sm text-slate-300">Occupancy</p><p className="mt-2 text-2xl font-semibold text-white">{status.occupiedSeats}/{bus.capacity.seats}</p></div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4"><p className="text-sm text-slate-300">Parcel count</p><p className="mt-2 text-2xl font-semibold text-white">{parcels.length}</p></div>
        </div>
      </Panel>
      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Passenger scan" eyebrow="QR validation">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" defaultValue={tickets[0].ticketId} />
          <button className="mt-4 w-full rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Confirm boarding</button>
          <div className="mt-4"><StatusPill tone="green">Route lineage valid</StatusPill></div>
        </Panel>
        <Panel title="Parcel scan" eyebrow="Load and unload">
          <input className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" defaultValue={parcels[0].id} />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button className="rounded-2xl bg-emerald-400 px-4 py-3 font-medium text-slate-950">Mark loaded</button>
            <button className="rounded-2xl bg-amber-300 px-4 py-3 font-medium text-slate-950">Mark unloaded</button>
          </div>
        </Panel>
      </div>
    </main>
  );
}
