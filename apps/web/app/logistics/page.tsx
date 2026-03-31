"use client";

import { useState } from "react";
import { Panel, StatusPill, Input, Button } from "@transitlink/ui";
import { Hero, ParcelTimeline } from "../../components/cards";
import { CargoOptimizer } from "../../components/CargoOptimizer";
import { parcelTracking, parcels as initialParcels } from "../../lib/demo-data";
import { QRCodeGenerator } from "../../components/QRCodeGenerator";

export default function LogisticsPage() {
  const [parcels, setParcels] = useState(initialParcels);
  const [showQR, setShowQR] = useState<string | null>(null);
  const [newParcel, setNewParcel] = useState({
    sender: "",
    from: "Hyderabad",
    to: "Guntur",
    weight: "5",
    length: "30",
    width: "20",
    height: "20"
  });

  const handleAddParcel = () => {
    const id = `PRC-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const parcel = {
      id,
      senderId: newParcel.sender || "Anonymous",
      fromCity: newParcel.from,
      destinationCity: newParcel.to,
      weightKg: parseFloat(newParcel.weight),
      dimensions: {
        length: parseFloat(newParcel.length),
        width: parseFloat(newParcel.width),
        height: parseFloat(newParcel.height)
      },
      status: "booked" as const,
      healthStatus: "stable" as const,
      assignedBusId: "bus-101"
    };
    setParcels([parcel, ...parcels]);
    setShowQR(id);
  };

  return (
    <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 lg:px-8 pb-32">
      <Hero kicker="Logistics workspace" title="Ship small parcels through the public bus network." description="Use spare luggage bay capacity, get a QR code instantly, and monitor parcel health and city-level progress in one place." />
      
      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel title="Book shipment" eyebrow="Cargo fit AI">
          <div className="grid gap-4">
            <Input 
              label="Sender name" 
              placeholder="Logistics Hub A" 
              value={newParcel.sender}
              onChange={(e) => setNewParcel({...newParcel, sender: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Origin" 
                value={newParcel.from}
                onChange={(e) => setNewParcel({...newParcel, from: e.target.value})}
              />
              <Input 
                label="Destination" 
                value={newParcel.to}
                onChange={(e) => setNewParcel({...newParcel, to: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              <Input 
                label="Wt (kg)" 
                type="number" 
                value={newParcel.weight}
                onChange={(e) => setNewParcel({...newParcel, weight: e.target.value})}
              />
              <Input 
                label="L (cm)" 
                type="number" 
                value={newParcel.length}
                onChange={(e) => setNewParcel({...newParcel, length: e.target.value})}
              />
              <Input 
                label="W (cm)" 
                type="number" 
                value={newParcel.width}
                onChange={(e) => setNewParcel({...newParcel, width: e.target.value})}
              />
              <Input 
                label="H (cm)" 
                type="number" 
                value={newParcel.height}
                onChange={(e) => setNewParcel({...newParcel, height: e.target.value})}
              />
            </div>
            <Button size="lg" className="w-full" onClick={handleAddParcel}>Generate QR & Book</Button>
          </div>
        </Panel>
        
        {showQR ? (
          <Panel title="Parcel QR Code" eyebrow="Scan to load">
            <div className="flex flex-col items-center justify-center p-6 bg-cyan-500/5 rounded-3xl border-2 border-dashed border-cyan-500/20">
              <QRCodeGenerator value={showQR} size={200} className="mb-4" />
              <p className="font-mono text-xl font-bold text-cyan-700 dark:text-cyan-300">{showQR}</p>
              <p className="text-sm text-slate-500 mt-2">Print and attach to package</p>
              <Button variant="secondary" size="sm" className="mt-4" onClick={() => setShowQR(null)}>Dismiss</Button>
            </div>
          </Panel>
        ) : (
          <ParcelTimeline tracking={parcelTracking} />
        )}
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
            <div key={parcel.id} className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/70 p-4 shadow-sm dark:shadow-none hover:border-cyan-500/50 transition-colors cursor-pointer" onClick={() => setShowQR(parcel.id)}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white font-mono">{parcel.id}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{parcel.fromCity} → {parcel.destinationCity}</p>
                  <p className="text-[10px] text-slate-400 mt-1">{parcel.weightKg}kg · {parcel.dimensions.length}x{parcel.dimensions.width}x{parcel.dimensions.height}cm</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusPill tone={parcel.healthStatus === "stable" ? "green" : "yellow"}>{parcel.healthStatus}</StatusPill>
                  <span className="text-[10px] text-cyan-600 font-medium">Click for QR</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </main>
  );
}
