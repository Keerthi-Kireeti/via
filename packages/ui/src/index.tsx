import type { PropsWithChildren, ReactNode } from "react";

type SeatTone = "green" | "yellow" | "red";

const toneMap: Record<SeatTone, string> = {
  green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  yellow: "bg-amber-500/15 text-amber-100 ring-amber-300/30",
  red: "bg-rose-500/15 text-rose-100 ring-rose-400/30"
};

export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-slate-950 text-white">{children}</div>;
}

export function Panel({
  title,
  eyebrow,
  actions,
  children
}: PropsWithChildren<{ title: string; eyebrow?: string; actions?: ReactNode }>) {
  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-2xl shadow-slate-950/25 backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{eyebrow}</p> : null}
          <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ tone, children, className }: PropsWithChildren<{ tone: SeatTone; className?: string }>) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneMap[tone]} ${className || ""}`}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  hint
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-4">
      <p className="text-sm text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-white">{value}</p>
      <p className="mt-2 text-sm text-cyan-100/70">{hint}</p>
    </div>
  );
}

export function SectionHeading({
  title,
  description,
  kicker
}: {
  title: string;
  description: string;
  kicker?: string;
}) {
  return (
    <div className="max-w-2xl">
      {kicker ? <p className="text-sm uppercase tracking-[0.3em] text-cyan-300/70">{kicker}</p> : null}
      <h1 className="mt-2 text-4xl font-semibold text-white sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-slate-300">{description}</p>
    </div>
  );
}

export function BusCard({
  busCode,
  route,
  occupancy,
  eta,
  distance
}: {
  busCode: string;
  route: string;
  occupancy: { occupied: number; total: number; indicator: SeatTone };
  eta: number;
  distance: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-300">Bus {busCode}</p>
          <p className="mt-1 text-lg font-semibold text-white">{route}</p>
        </div>
        <StatusPill tone={occupancy.indicator}>{occupancy.occupied}/{occupancy.total}</StatusPill>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-slate-400">ETA: {eta} min</span>
        <span className="text-slate-400">{distance} km away</span>
      </div>
    </div>
  );
}

export function TicketCard({
  ticketId,
  route,
  from,
  to,
  status,
  fare,
  qrCode
}: {
  ticketId: string;
  route: string;
  from: string;
  to: string;
  status: string;
  fare: number;
  qrCode?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">Ticket {ticketId.slice(-6)}</p>
          <p className="mt-2 font-semibold text-white">{route}</p>
          <p className="mt-1 text-sm text-slate-300">{from} → {to}</p>
        </div>
        <StatusPill tone={status === "active" ? "green" : "yellow"}>{status}</StatusPill>
      </div>
      {qrCode && <img src={qrCode} alt="QR" className="mt-3 h-24 w-24" />}
      <p className="mt-3 text-sm text-slate-400">Fare: ₹{fare}</p>
    </div>
  );
}

export function ParcelCard({
  parcelId,
  from,
  to,
  weight,
  status,
  eta,
  health
}: {
  parcelId: string;
  from: string;
  to: string;
  weight: number;
  status: string;
  eta: string;
  health: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-400">Parcel {parcelId.slice(-6)}</p>
          <p className="mt-2 font-semibold text-white">{from} → {to}</p>
          <p className="mt-1 text-sm text-slate-300">{weight}kg</p>
        </div>
        <StatusPill tone={status === "delivered" ? "green" : "yellow"}>{status}</StatusPill>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="text-sm text-slate-400">ETA: {eta}</span>
        {health !== "stable" && <StatusPill tone="red">{health}</StatusPill>}
      </div>
    </div>
  );
}

export function Button({
  variant = "primary",
  size = "md",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}) {
  const baseClass = "font-medium rounded-lg transition-colors";
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-700 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white border border-white/10",
    danger: "bg-rose-600 hover:bg-rose-700 text-white"
  };
  const sizes = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  return (
    <button className={`${baseClass} ${variants[variant]} ${sizes[size]}`} {...props}>
      {children}
    </button>
  );
}

export function Input({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-slate-300">{label}</label>}
      <input
        className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white placeholder-slate-500 focus:border-cyan-400 focus:outline-none"
        {...props}
      />
    </div>
  );
}

export function Table({
  columns,
  data
}: {
  columns: Array<{ key: string; label: string }>;
  data: Array<Record<string, any>>;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-slate-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-white/10 hover:bg-white/5">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-200">
                  {row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function Badge({
  variant = "info",
  children
}: PropsWithChildren<{ variant?: "info" | "success" | "warning" | "error" }>) {
  const colors = {
    info: "bg-blue-500/20 text-blue-200",
    success: "bg-emerald-500/20 text-emerald-200",
    warning: "bg-amber-500/20 text-amber-200",
    error: "bg-rose-500/20 text-rose-200"
  };
  return <span className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${colors[variant]}`}>{children}</span>;
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
    </div>
  );
}
