import type { PropsWithChildren, ReactNode } from "react";

type SeatTone = "green" | "yellow" | "red";

const toneMap: Record<SeatTone, string> = {
  green: "bg-emerald-500/15 text-emerald-200 ring-emerald-400/30",
  yellow: "bg-amber-500/15 text-amber-100 ring-amber-300/30",
  red: "bg-rose-500/15 text-rose-100 ring-rose-400/30"
};

export function AppShell({ children }: PropsWithChildren) {
  return <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-950 dark:text-white transition-colors duration-300">{children}</div>;
}

export function Panel({
  title,
  eyebrow,
  actions,
  children
}: PropsWithChildren<{ title: string; eyebrow?: string; actions?: ReactNode }>) {
  return (
    <section className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 sm:p-5 shadow-xl dark:shadow-2xl dark:shadow-slate-950/25 backdrop-blur">
      <div className="mb-4 flex flex-col sm:flex-row items-start justify-between gap-2 sm:gap-4">
        <div>
          {eyebrow ? <p className="text-[10px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.3em] text-cyan-600 dark:text-cyan-200/70">{eyebrow}</p> : null}
          <h2 className="mt-1 text-lg sm:text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {actions && <div className="w-full sm:w-auto">{actions}</div>}
      </div>
      {children}
    </section>
  );
}

export function StatusPill({ tone, children, className }: PropsWithChildren<{ tone: SeatTone; className?: string }>) {
  const lightToneMap: Record<SeatTone, string> = {
    green: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    yellow: "bg-amber-100 text-amber-700 ring-amber-200",
    red: "bg-rose-100 text-rose-700 ring-rose-200"
  };
  
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 dark:${toneMap[tone]} ${lightToneMap[tone]} ${className || ""}`}>
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
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-900/80 p-4 shadow-sm dark:shadow-none">
      <p className="text-sm text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{value}</p>
      <p className="mt-2 text-sm text-cyan-600 dark:text-cyan-100/70">{hint}</p>
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
      {kicker ? <p className="text-sm uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-300/70">{kicker}</p> : null}
      <h1 className="mt-2 text-4xl font-semibold text-slate-900 dark:text-white sm:text-5xl">{title}</h1>
      <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">{description}</p>
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
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-300">Bus {busCode}</p>
          <p className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{route}</p>
        </div>
        <StatusPill tone={occupancy.indicator}>{occupancy.occupied}/{occupancy.total}</StatusPill>
      </div>
      <div className="mt-3 flex gap-4 text-sm">
        <span className="text-slate-500 dark:text-slate-400">ETA: {eta} min</span>
        <span className="text-slate-500 dark:text-slate-400">{distance} km away</span>
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
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Ticket {ticketId.slice(-6)}</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{route}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{from} → {to}</p>
        </div>
        <StatusPill tone={status === "active" ? "green" : "yellow"}>{status}</StatusPill>
      </div>
      {qrCode && <img src={qrCode} alt="QR" className="mt-3 h-24 w-24" />}
      <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Fare: ₹{fare}</p>
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
    <div className="rounded-2xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 p-4 shadow-sm dark:shadow-none">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Parcel {parcelId.slice(-6)}</p>
          <p className="mt-2 font-semibold text-slate-900 dark:text-white">{from} → {to}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{weight}kg</p>
        </div>
        <StatusPill tone={status === "delivered" ? "green" : "yellow"}>{status}</StatusPill>
      </div>
      <div className="mt-3 flex gap-2">
        <span className="text-sm text-slate-500 dark:text-slate-400">ETA: {eta}</span>
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
  const baseClass = "font-medium rounded-lg transition-all duration-200 active:scale-95";
  const variants = {
    primary: "bg-cyan-600 hover:bg-cyan-700 text-white shadow-md shadow-cyan-600/20",
    secondary: "bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-white/10",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20"
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
      {label && <label className="text-sm font-medium text-slate-600 dark:text-slate-300">{label}</label>}
      <input
        className="rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-2 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20 transition-all"
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
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-transparent">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5">
            {columns.map((col) => (
              <th key={col.key} className="px-4 py-3 text-left font-medium text-slate-600 dark:text-slate-300">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-b border-slate-100 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-200">
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
  children,
  tone = "info"
}: PropsWithChildren<{ tone?: "info" | "success" | "warning" | "error" }>) {
  const tones = {
    info: "bg-cyan-100 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/15 dark:text-cyan-200 dark:ring-cyan-400/30",
    success: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/30",
    warning: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/30",
    error: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/30"
  };
  return (
    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-700 border-t-cyan-500"></div>
    </div>
  );
}
