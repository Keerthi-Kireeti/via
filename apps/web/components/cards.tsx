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
      <div className="transit-grid relative h-72 overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 p-6">
        <div className="absolute left-[18%] top-[32%] h-3 w-3 rounded-full bg-cyan-300 shadow-[0_0_0_12px_rgba(34,211,238,0.12)]" />
        <div className="absolute left-[54%] top-[52%] h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_0_12px_rgba(52,211,153,0.12)]" />
        <div className="absolute left-[72%] top-[28%] h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_0_12px_rgba(251,191,36,0.12)]" />
        <div className="absolute bottom-4 left-4 rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
          {subtitle}
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
