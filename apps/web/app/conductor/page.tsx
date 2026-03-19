"use client";

import { useState } from "react";
import { Panel, StatusPill, Button } from "@transitlink/ui";
import { QRScanner, QRDisplay } from "../../components/QRScanner";
import { validateTicketScan, scanParcel } from "../../lib/api";
import { buses, occupancy, parcels, tickets } from "../../lib/demo-data";

export default function ConductorPage() {
  const bus = buses[0];
  const status = occupancy[0];
  
  const [scanMode, setScanMode] = useState<"ticket" | "parcel" | null>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);
  const [parcelResult, setParcelResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTicketScan = async (ticketId: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await validateTicketScan(ticketId, bus.id);
      setTicketResult(result);
      setScanMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  const handleParcelScan = async (parcelId: string) => {
    setLoading(true);
    setError("");
    try {
      const result = await scanParcel(parcelId, bus.id, "loaded");
      setParcelResult(result);
      setScanMode(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scan failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8">
      <Panel title="Conductor Panel" eyebrow="Fast scanning workflow">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-300">Active bus</p>
            <p className="mt-2 text-2xl font-semibold text-white">{bus.code}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-300">Occupancy</p>
            <p className="mt-2 text-2xl font-semibold text-white">{status.occupiedSeats}/{bus.capacity.seats}</p>
            <StatusPill tone={status.indicator} className="mt-2" >{status.indicator}</StatusPill>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <p className="text-sm text-slate-300">Parcels on board</p>
            <p className="mt-2 text-2xl font-semibold text-white">{parcels.filter(p => p.assignedBusId === bus.id).length}</p>
          </div>
        </div>
      </Panel>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-400/30 rounded-2xl text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Passenger Boarding" eyebrow="QR ticket scan">
          {scanMode === "ticket" ? (
            <QRScanner onScan={handleTicketScan} />
          ) : ticketResult && ticketResult.ok ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-200">
                <p className="font-semibold">✓ Boarding Confirmed</p>
                <p className="text-sm mt-2">Passenger: {ticketResult.ticket?.passengerId}</p>
                <p className="text-sm">Occupancy: {ticketResult.occupancy?.occupiedSeats}/{ticketResult.occupancy?.availableSeats ? ticketResult.occupancy.availableSeats + ticketResult.occupancy.occupiedSeats : "?"}</p>
              </div>
              <Button variant="secondary" onClick={() => {
                setTicketResult(null);
                setScanMode("ticket");
              }} className="w-full">
                Scan Next Passenger
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => setScanMode("ticket")}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Scanning..." : "Start Scan"}
              </Button>
              <p className="text-xs text-slate-400 text-center">
                Try: {tickets[0].ticketId}
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Parcel Loading" eyebrow="Load/unload tracking">
          {scanMode === "parcel" ? (
            <QRScanner onScan={handleParcelScan} />
          ) : parcelResult && parcelResult.parcel ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/20 border border-emerald-400/30 rounded-lg text-emerald-200">
                <p className="font-semibold">✓ Parcel Loaded</p>
                <p className="text-sm mt-2">ID: {parcelResult.parcel?.id}</p>
                <p className="text-sm">{parcelResult.parcel?.fromCity} → {parcelResult.parcel?.destinationCity}</p>
                <p className="text-sm">Status: {parcelResult.parcel?.status}</p>
              </div>
              <Button variant="secondary" onClick={() => {
                setParcelResult(null);
                setScanMode("parcel");
              }} className="w-full">
                Scan Next Parcel
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              <Button
                variant="primary"
                onClick={() => setScanMode("parcel")}
                className="w-full"
                disabled={loading}
              >
                {loading ? "Scanning..." : "Scan Parcel QR"}
              </Button>
              <p className="text-xs text-slate-400 text-center">
                Try: {parcels[0].id}
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent Activity" eyebrow="Boarding and parcel events">
        <div className="space-y-2 text-sm">
          <p className="text-slate-400">• 2 passengers boarded at Hyderabad</p>
          <p className="text-slate-400">• 3 parcels loaded from logistics hub</p>
          <p className="text-slate-400">• 1 parcel unloaded at Khammam</p>
          <p className="text-slate-400">• Current occupancy: {status.occupiedSeats}/{bus.capacity.seats} seats</p>
        </div>
      </Panel>
    </main>
  );
}
