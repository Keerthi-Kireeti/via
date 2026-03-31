import { Badge, Panel, SectionHeading, StatCard, StatusPill } from "@transitlink/ui";
import type { ParcelTrackingStatus, Route, SeatPredictionResult } from "@transitlink/types";

export function Hero({
  title,
  description,
  kicker
}: {
  title: string;
  description: string;
  kicker?: string;
}) {
  return (
    <div className="relative overflow-hidden py-8 sm:py-12 lg:py-16">
      <div className="relative z-10">
        {kicker ? <Badge tone="info">{kicker}</Badge> : null}
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl max-w-3xl leading-[1.1]">
          {title}
        </h1>
        <p className="mt-6 text-base sm:text-lg leading-7 text-slate-600 dark:text-slate-300 max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}

export function MapPanel({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <Panel title={title} eyebrow="Live tracking">
      <div className="relative h-[400px] overflow-hidden rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-slate-900/60 shadow-inner">
        {/* Interactive Map Background */}
        <div className="absolute inset-0 opacity-40 dark:opacity-20 transit-grid" />
        
        {/* Mock Map Elements */}
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 800 400">
          <path d="M50 100 Q 150 50, 250 150 T 450 250 T 650 150" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-500/30 dark:text-cyan-400/20" />
          <path d="M100 300 Q 300 350, 500 250 T 750 100" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-500/30 dark:text-emerald-400/20" />
          
          {/* Stops */}
          <circle cx="50" cy="100" r="4" className="fill-slate-400 dark:fill-slate-600" />
          <circle cx="250" cy="150" r="4" className="fill-slate-400 dark:fill-slate-600" />
          <circle cx="450" cy="250" r="4" className="fill-slate-400 dark:fill-slate-600" />
          <circle cx="650" cy="150" r="4" className="fill-slate-400 dark:fill-slate-600" />
        </svg>

        {/* Live Buses */}
        <div className="absolute left-[31%] top-[30%] animate-pulse">
          <div className="h-4 w-4 rounded-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-4 ring-cyan-500/20" />
          <div className="absolute -top-8 -left-4 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg">Bus 101 · 65km/h</div>
        </div>

        <div className="absolute left-[58%] top-[55%] animate-pulse" style={{ animationDelay: '1s' }}>
          <div className="h-4 w-4 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)] ring-4 ring-emerald-500/20" />
          <div className="absolute -top-8 -left-4 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg">Bus 104 · 42km/h</div>
        </div>

        <div className="absolute left-[75%] top-[25%] animate-pulse" style={{ animationDelay: '2s' }}>
          <div className="h-4 w-4 rounded-full bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)] ring-4 ring-amber-500/20" />
          <div className="absolute -top-8 -left-4 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] text-white shadow-lg">Bus 202 · 58km/h</div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">+</button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">−</button>
          <button className="h-8 w-8 flex items-center justify-center rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">📍</button>
        </div>

        <div className="absolute bottom-4 left-4 right-4 sm:right-auto max-w-sm rounded-2xl border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md px-4 py-3 text-sm text-slate-900 dark:text-slate-200 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 animate-ping rounded-full bg-emerald-500" />
            <span className="font-medium">{subtitle}</span>
          </div>
        </div>
      </div>
    </Panel>
  );
}

export function RouteList({ routes }: { routes: Route[] }) {
  return (
    <div className="grid gap-4">
      {routes.map((route) => (
        <Panel key={route.id} title={route.name} eyebrow={route.code}>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span>{route.origin}</span>
            <span>→</span>
            <span>{route.destination}</span>
            <span>·</span>
            <span>{route.stops.length} stops</span>
            <span>·</span>
            <span>{route.distanceKm} km</span>
          </div>
        </Panel>
      ))}
    </div>
  );
}

export function PredictionList({ predictions }: { predictions: SeatPredictionResult[] }) {
  return (
    <Panel title="AI seat forecast" eyebrow="Demand simulation">
      <div className="grid gap-3">
        {predictions.map((prediction) => (
          <div key={`${prediction.routeId}-${prediction.stopId}`} className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-900/80 p-4">
            <div>
              <p className="font-medium text-white">{prediction.timeWindow}</p>
              <p className="text-sm text-slate-300">Stop {prediction.stopId} · Predicted load {prediction.predictedLoad}</p>
            </div>
            <div className="text-right">
              <StatusPill tone={prediction.availabilityIndicator}>{prediction.availabilityIndicator}</StatusPill>
              <p className="mt-2 text-xs text-slate-400">Confidence {(prediction.confidence * 100).toFixed(0)}%</p>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function ParcelTimeline({ tracking }: { tracking: ParcelTrackingStatus[] }) {
  return (
    <Panel title="Parcel tracking" eyebrow="QR-linked chain of custody">
      <div className="grid gap-4">
        {tracking.map((item) => (
          <div key={item.parcelId} className="rounded-2xl border border-white/10 bg-slate-900/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-white">{item.parcelId}</p>
                <p className="text-sm text-slate-300">Current city: {item.currentCity}</p>
              </div>
              <StatusPill tone={item.healthStatus === "stable" ? "green" : "yellow"}>{item.healthStatus}</StatusPill>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-400">
              {item.scanHistory.map((scan) => (
                <span key={scan.id} className="rounded-full bg-white/5 px-3 py-1">
                  {scan.action} · {scan.city}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

export function StatGrid({ items }: { items: Array<{ label: string; value: string; hint: string }> }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
      {items.map((item, idx) => (
        <StatCard key={idx} {...item} />
      ))}
    </div>
  );
}
