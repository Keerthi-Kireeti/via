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
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-300">Active bus</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{bus.code}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-300">Occupancy</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{status.occupiedSeats}/{bus.capacity.seats}</p>
            <StatusPill tone={status.indicator} className="mt-2" >{status.indicator}</StatusPill>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-sm dark:shadow-none">
            <p className="text-sm text-slate-500 dark:text-slate-300">Parcels on board</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{parcels.filter(p => p.assignedBusId === bus.id).length}</p>
          </div>
        </div>
      </Panel>

      {error && (
        <div className="p-4 bg-rose-100 dark:bg-rose-500/20 border border-rose-200 dark:border-rose-400/30 rounded-2xl text-rose-700 dark:text-rose-200 shadow-sm">
          {error}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Passenger Boarding" eyebrow="QR ticket scan">
          {scanMode === "ticket" ? (
            <QRScanner onScan={handleTicketScan} />
          ) : ticketResult && ticketResult.ok ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 rounded-lg text-emerald-700 dark:text-emerald-200 shadow-sm">
                <p className="font-semibold text-lg">✓ Boarding Confirmed</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>Passenger: <span className="font-mono">{ticketResult.ticket?.passengerId}</span></p>
                  <p>Occupancy: {ticketResult.occupancy?.occupiedSeats}/{ticketResult.occupancy?.availableSeats ? ticketResult.occupancy.availableSeats + ticketResult.occupancy.occupiedSeats : "?"}</p>
                </div>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Try: <span className="font-mono select-all">{tickets[0].ticketId}</span>
              </p>
            </div>
          )}
        </Panel>

        <Panel title="Parcel Loading" eyebrow="Load/unload tracking">
          {scanMode === "parcel" ? (
            <QRScanner onScan={handleParcelScan} />
          ) : parcelResult && parcelResult.parcel ? (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-400/30 rounded-lg text-emerald-700 dark:text-emerald-200 shadow-sm">
                <p className="font-semibold text-lg">✓ Parcel Loaded</p>
                <div className="mt-2 space-y-1 text-sm">
                  <p>ID: <span className="font-mono">{parcelResult.parcel?.id}</span></p>
                  <p>{parcelResult.parcel?.fromCity} → {parcelResult.parcel?.destinationCity}</p>
                  <p>Status: <span className="capitalize">{parcelResult.parcel?.status}</span></p>
                </div>
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
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
                Try: <span className="font-mono select-all">{parcels[0].id}</span>
              </p>
            </div>
          )}
        </Panel>
      </div>

      <Panel title="Recent Activity" eyebrow="Boarding and parcel events">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            <p>2 passengers boarded at Hyderabad</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            <p>3 parcels loaded from logistics hub</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            <p>1 parcel unloaded at Khammam</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-500"></span>
            <p>Current occupancy: {status.occupiedSeats}/{bus.capacity.seats} seats</p>
          </div>
        </div>
      </Panel>
    </main>
  );
}
