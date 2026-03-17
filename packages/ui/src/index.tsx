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

export function StatusPill({ tone, children }: PropsWithChildren<{ tone: SeatTone }>) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${toneMap[tone]}`}>
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
