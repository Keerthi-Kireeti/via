import { Panel, StatusPill, Button } from "@transitlink/ui";
import { tickets } from "../../../lib/demo-data";

export default function PassengerTicketsPage() {
  const ticket = tickets[0];
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Panel title="Digital ticket" eyebrow="QR boarding pass">
        <div className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="flex flex-col justify-between">
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-300">Ticket ID</p>
              <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white font-mono">{ticket.ticketId}</p>
              <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 font-medium">Lineage: <span className="text-cyan-600 dark:text-cyan-400">{ticket.lineageId}</span> · Allowed segments: {ticket.allowedSegments.join(", ")}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <StatusPill tone="green">Reusable across lineage buses</StatusPill>
                <StatusPill tone="yellow">Transfer-aware</StatusPill>
              </div>
            </div>
            <div className="mt-8 flex gap-3">
              <Button variant="secondary">Download PDF</Button>
              <Button variant="danger">Cancel Ticket</Button>
            </div>
          </div>
          <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-cyan-500/30 bg-cyan-500/5 dark:bg-cyan-400/10 p-10 text-center text-cyan-700 dark:text-cyan-100 shadow-inner">
            <div className="mb-4 text-5xl">📱</div>
            <p className="font-mono text-xl font-bold">QR-TKT-1001</p>
            <p className="mt-2 text-xs uppercase tracking-widest opacity-60">Scan at bus entry</p>
          </div>
        </div>
      </Panel>
    </main>
  );
}
