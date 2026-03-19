"use client";

import { useState } from "react";
import { Panel, StatusPill, Button, Input } from "@transitlink/ui";
import { QRDisplay } from "../../../components/QRScanner";
import { routes, seatPredictions } from "../../../lib/demo-data";
import { quoteFare, purchaseTicket } from "../../../lib/api";

export default function PassengerBookingPage() {
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [lineage, setLineage] = useState("");
  const [fare, setFare] = useState<number | null>(null);
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuoteFare = async () => {
    if (!origin || !destination || !lineage) {
      setError("Please select all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await quoteFare(lineage, origin, destination);
      setFare(result.fare);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to quote fare");
    } finally {
      setLoading(false);
    }
  };

  const handlePurchaseTicket = async () => {
    if (!origin || !destination || !lineage) {
      setError("Please select all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const result = await purchaseTicket(
        "usr-pass-1",
        lineage,
        origin,
        destination
      );
      setTicket(result.ticket);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to purchase ticket");
    } finally {
      setLoading(false);
    }
  };

  if (ticket) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Panel title="Ticket Purchased!" eyebrow="Digital ticket">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4">
                  <p className="text-emerald-200 font-semibold text-lg">✓ Success</p>
                  <p className="text-sm text-emerald-100 mt-2">Your route-lineage ticket is active</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p><span className="text-slate-400">Ticket ID:</span> <span className="font-mono text-white">{ticket.ticketId}</span></p>
                  <p><span className="text-slate-400">Route:</span> <span className="text-white">{origin} → {destination}</span></p>
                  <p><span className="text-slate-400">Lineage:</span> <span className="text-white">{lineage}</span></p>
                  <p><span className="text-slate-400">Fare:</span> <span className="text-cyan-300 font-semibold">₹{fare}</span></p>
                  <p><span className="text-slate-400">Valid Until:</span> <span className="text-white">{new Date(ticket.validUntil).toLocaleTimeString()}</span></p>
                </div>
                <div className="flex gap-2">
                  <StatusPill tone="green">Active</StatusPill>
                  <StatusPill tone="yellow">Route-lineage</StatusPill>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center">
                <QRDisplay data={ticket.qrToken} size={200} />
              </div>
            </div>
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/10 text-sm text-slate-300">
              <p className="font-semibold text-white mb-2">How it works:</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>One ticket covers your entire journey</li>
                <li>Board any bus on this lineage</li>
                <li>Conductor scans your QR at each boarding</li>
                <li>Automatic transfers on same lineage allowed</li>
                <li>Cannot board after destination stop</li>
              </ul>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setTicket(null);
                setFare(null);
              }}
              className="w-full"
            >
              Book Another Ticket
            </Button>
          </div>
        </Panel>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <Panel title="Book Route-Lineage Ticket" eyebrow="Origin to destination">
          <div className="grid gap-3">
            {error && (
              <div className="p-3 bg-rose-500/20 border border-rose-400/30 rounded-lg text-rose-200 text-sm">
                {error}
              </div>
            )}
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Select origin city</option>
              <option value="st-hyd">Hyderabad</option>
              <option value="st-wgl">Warangal</option>
              <option value="st-nlg">Nalgonda</option>
            </select>
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Select destination city</option>
              <option value="st-gnt">Guntur</option>
              <option value="st-vjw">Vijayawada</option>
              <option value="st-khm">Khammam</option>
            </select>
            <select
              value={lineage}
              onChange={(e) => setLineage(e.target.value)}
              className="rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-white focus:border-cyan-400 focus:outline-none"
            >
              <option value="">Select lineage</option>
              <option value="rt-100">RTC100 lineage</option>
              <option value="rt-200">RTC200 lineage</option>
              <option value="rt-300">RTC300 lineage</option>
            </select>
            {fare !== null && (
              <div className="p-3 bg-cyan-500/20 border border-cyan-400/30 rounded-lg">
                <p className="text-cyan-200 text-sm">Fare: <span className="font-bold text-lg">₹{fare}</span></p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={handleQuoteFare}
                disabled={loading}
                className="flex-1"
              >
                {loading ? "Loading..." : "Get Fare Quote"}
              </Button>
              <Button
                variant="primary"
                onClick={handlePurchaseTicket}
                disabled={loading || fare === null}
                className="flex-1"
              >
                {loading ? "Processing..." : "Purchase Ticket"}
              </Button>
            </div>
          </div>
        </Panel>
        <Panel title="Why This Ticket Works" eyebrow="Transfer logic">
          <div className="grid gap-3 text-sm text-slate-300">
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              Buy once for the full corridor and board any bus on the same route lineage until your destination stop.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              Conductors validate the QR against lineage id, stop segment, and remaining journey entitlement.
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
              AI forecasts can warn you which stop windows are likely to open more seats before departure.
            </div>
            <div className="flex flex-wrap gap-2">
              {seatPredictions.map((prediction) => (
                <StatusPill key={prediction.stopId} tone={prediction.availabilityIndicator}>
                  {prediction.timeWindow}
                </StatusPill>
              ))}
            </div>
            <p className="text-xs text-slate-400">
              Routes available: {routes.map((route) => route.code).join(", ")}
            </p>
          </div>
        </Panel>
      </div>
    </main>
  );
}
