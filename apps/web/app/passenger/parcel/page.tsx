import { Panel, StatusPill } from "@transitlink/ui";
import { parcelTracking, parcels } from "../../../lib/demo-data";

export default function PassengerParcelPage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Ship a parcel" eyebrow="Bus cargo booking">
          <div className="grid gap-3">
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="From city" defaultValue="Hyderabad" />
            <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="Destination city" defaultValue="Guntur" />
            <div className="grid gap-3 sm:grid-cols-3">
              <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="L" />
              <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="W" />
              <input className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white" placeholder="H" />
            </div>
            <button className="rounded-2xl bg-cyan-400 px-4 py-3 font-medium text-slate-950">Predict cargo fit</button>
          </div>
        </Panel>
        <Panel title="Tracked parcels" eyebrow="Sender view">
          <div className="grid gap-3">
            {parcels.map((parcel, index) => (
              <div key={parcel.id} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{parcel.id}</p>
                    <p className="text-sm text-slate-300">{parcel.fromCity} → {parcel.destinationCity}</p>
                  </div>
                  <StatusPill tone={parcelTracking[index]?.healthStatus === "stable" ? "green" : "yellow"}>{parcel.status}</StatusPill>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </main>
  );
}
