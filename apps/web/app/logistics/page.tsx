import { Panel, StatusPill, Input, Button } from "@transitlink/ui";
import { Hero, ParcelTimeline } from "../../components/cards";
import { CargoOptimizer } from "../../components/CargoOptimizer";
import { parcelTracking, parcels } from "../../lib/demo-data";

export default function LogisticsPage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8">
      <Hero kicker="Logistics workspace" title="Ship small parcels through the public bus network." description="Use spare luggage bay capacity, get a QR code instantly, and monitor parcel health and city-level progress in one place." />
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Book shipment" eyebrow="Cargo fit AI">
          <div className="grid gap-4">
            <Input label="Sender name" placeholder="Logistics Hub A" />
            <Input label="Origin city" defaultValue="Hyderabad" />
            <Input label="Destination city" defaultValue="Guntur" />
            <Button size="lg" className="w-full">Check available buses</Button>
          </div>
        </Panel>
        <ParcelTimeline tracking={parcelTracking} />
      </div>

      <Panel title="3D Cargo Optimizer" eyebrow="Intelligent arrangement system">
        <CargoOptimizer initialCargo={parcels.map((p) => ({
          id: p.id,
          length: p.dimensions.length,
          width: p.dimensions.width,
          height: p.dimensions.height,
          weightKg: p.weightKg
        }))} />
      </Panel>

      <Panel title="Shipment queue" eyebrow="Current bookings">
        <div className="grid gap-3 md:grid-cols-2">
          {parcels.map((parcel) => (
            <div key={parcel.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 shadow-sm dark:shadow-none">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white font-mono">{parcel.id}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{parcel.fromCity} → {parcel.destinationCity}</p>
                </div>
                <StatusPill tone={parcel.healthStatus === "stable" ? "green" : "yellow"}>{parcel.healthStatus}</StatusPill>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
