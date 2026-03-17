import { ParcelTimeline } from "../../../components/cards";
import { parcelTracking } from "../../../lib/demo-data";

export default function LogisticsTrackingPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ParcelTimeline tracking={parcelTracking} />
    </main>
  );
}
