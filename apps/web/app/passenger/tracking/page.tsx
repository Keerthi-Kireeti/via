import { MapPanel, ParcelTimeline } from "../../../components/cards";
import { parcelTracking } from "../../../lib/demo-data";

export default function PassengerTrackingPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
      <MapPanel title="Live bus tracking" subtitle="Mapbox integration point for bus GPS, stop ETA, and occupancy heat overlays." />
      <ParcelTimeline tracking={parcelTracking} />
    </main>
  );
}
