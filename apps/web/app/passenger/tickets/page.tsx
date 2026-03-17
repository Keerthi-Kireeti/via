import { Panel, StatusPill } from "@transitlink/ui";
import { tickets } from "../../../lib/demo-data";

export default function PassengerTicketsPage() {
  const ticket = tickets[0];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Panel title="Digital ticket" eyebrow="QR boarding pass">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="text-sm text-slate-300">Ticket ID</p>
            <p className="mt-2 text-3xl font-semibold text-white">{ticket.ticketId}</p>
            <p className="mt-4 text-sm text-slate-300">Lineage: {ticket.lineageId} · Allowed segments: {ticket.allowedSegments.join(", ")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <StatusPill tone="green">Reusable across lineage buses</StatusPill>
              <StatusPill tone="yellow">Transfer-aware</StatusPill>
            </div>
          </div>
          <div className="rounded-3xl border border-dashed border-cyan-300/40 bg-cyan-400/10 p-10 text-center text-cyan-100">
            QR-TKT-1001
          </div>
        </div>
      </Panel>
    </main>
  );
}
