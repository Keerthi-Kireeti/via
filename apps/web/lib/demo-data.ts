import type {
  Bus,
  BusOccupancyStatus,
  NotificationItem,
  Parcel,
  ParcelTrackingStatus,
  Route,
  SeatPredictionResult,
  Ticket
} from "@transitlink/types";

const now = new Date("2026-03-16T10:30:00.000Z");
const at = (minutes: number) => new Date(now.getTime() + minutes * 60000).toISOString();

export const routes: Route[] = [
  {
    id: "rt-100",
    lineageId: "lin-1",
    code: "RTC100",
    name: "Hyderabad to Guntur Express",
    origin: "Hyderabad",
    destination: "Guntur",
    distanceKm: 275,
    averageSegmentMinutes: 55,
    stops: [
      { id: "st-hyd", name: "MGBS", city: "Hyderabad", order: 0, coordinates: { lat: 17.384, lng: 78.4867 } },
      { id: "st-nlg", name: "Nalgonda Junction", city: "Nalgonda", order: 1, coordinates: { lat: 17.0541, lng: 79.2671 } },
      { id: "st-khm", name: "Khammam Bus Hub", city: "Khammam", order: 2, coordinates: { lat: 17.2473, lng: 80.1514 } },
      { id: "st-vjw", name: "PN Bus Station", city: "Vijayawada", order: 3, coordinates: { lat: 16.5062, lng: 80.648 } },
      { id: "st-gnt", name: "Guntur Central", city: "Guntur", order: 4, coordinates: { lat: 16.3067, lng: 80.4365 } }
    ]
  },
  {
    id: "rt-200",
    lineageId: "lin-2",
    code: "RTC200",
    name: "Warangal to Guntur Superliner",
    origin: "Warangal",
    destination: "Guntur",
    distanceKm: 220,
    averageSegmentMinutes: 50,
    stops: [
      { id: "st-wgl", name: "Warangal Terminal", city: "Warangal", order: 0, coordinates: { lat: 17.9689, lng: 79.5941 } },
      { id: "st-khm-2", name: "Khammam South", city: "Khammam", order: 1, coordinates: { lat: 17.251, lng: 80.15 } },
      { id: "st-vjw-2", name: "Vijayawada East", city: "Vijayawada", order: 2, coordinates: { lat: 16.52, lng: 80.65 } },
      { id: "st-gnt-2", name: "Guntur Market", city: "Guntur", order: 3, coordinates: { lat: 16.31, lng: 80.44 } }
    ]
  }
];

export const buses: Bus[] = [
  { id: "bus-101", code: "TS09AB1101", routeId: "rt-100", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 21, capacity: { seats: 40, luggageVolume: 180 }, luggageUsed: 74, telemetry: { speedKmph: 52, coordinates: { lat: 17.22, lng: 79.14 }, heading: 130, lastUpdated: at(-4), currentStopId: "st-nlg", nextStopId: "st-khm" } },
  { id: "bus-102", code: "TS09AB1102", routeId: "rt-100", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 34, capacity: { seats: 40, luggageVolume: 180 }, luggageUsed: 128, telemetry: { speedKmph: 49, coordinates: { lat: 16.92, lng: 80.08 }, heading: 160, lastUpdated: at(-2), currentStopId: "st-khm", nextStopId: "st-vjw" } },
  { id: "bus-201", code: "TS03CD2201", routeId: "rt-200", depotId: "dep-vij", conductorId: "usr-con-2", occupancy: 28, capacity: { seats: 42, luggageVolume: 190 }, luggageUsed: 118, telemetry: { speedKmph: 56, coordinates: { lat: 17.44, lng: 80.01 }, heading: 175, lastUpdated: at(-3), currentStopId: "st-khm-2", nextStopId: "st-vjw-2" } }
];

export const occupancy: BusOccupancyStatus[] = buses.map((bus) => {
  const ratio = bus.occupancy / bus.capacity.seats;
  const indicator = ratio < 0.6 ? "green" : ratio <= 0.85 ? "yellow" : "red";
  return {
    busId: bus.id,
    occupiedSeats: bus.occupancy,
    availableSeats: bus.capacity.seats - bus.occupancy,
    indicator,
    updatedAt: bus.telemetry.lastUpdated
  };
});

export const tickets: Ticket[] = [
  {
    ticketId: "tkt-1001",
    passengerId: "usr-pass-1",
    lineageId: "lin-1",
    originStopId: "st-hyd",
    destinationStopId: "st-gnt",
    allowedSegments: [0, 1, 2, 3],
    status: "active",
    qrToken: "QR-TKT-1001",
    fare: 420,
    issuedAt: at(-80),
    validUntil: at(420),
    activeBusId: "bus-101"
  }
];

export const parcels: Parcel[] = [
  { id: "prc-1001", senderId: "usr-log-1", fromCity: "Hyderabad", destinationCity: "Guntur", dimensions: { length: 20, width: 18, height: 12 }, weightKg: 4, assignedBusId: "bus-101", status: "loaded", qrToken: "QR-PRC-1001", eta: at(210), healthStatus: "stable" },
  { id: "prc-1002", senderId: "usr-log-2", fromCity: "Warangal", destinationCity: "Vijayawada", dimensions: { length: 24, width: 20, height: 14 }, weightKg: 6, assignedBusId: "bus-201", status: "in_transit", qrToken: "QR-PRC-1002", eta: at(140), healthStatus: "temperature_warning" }
];

export const parcelTracking: ParcelTrackingStatus[] = [
  {
    parcelId: "prc-1001",
    currentBusId: "bus-101",
    currentCity: "Nalgonda",
    eta: at(210),
    healthStatus: "stable",
    scanHistory: [{ id: "psc-1", parcelId: "prc-1001", busId: "bus-101", city: "Hyderabad", action: "loaded", timestamp: at(-55) }]
  },
  {
    parcelId: "prc-1002",
    currentBusId: "bus-201",
    currentCity: "Khammam",
    eta: at(140),
    healthStatus: "temperature_warning",
    scanHistory: [{ id: "psc-2", parcelId: "prc-1002", busId: "bus-201", city: "Warangal", action: "loaded", timestamp: at(-110) }]
  }
];

export const notifications: NotificationItem[] = [
  { id: "ntf-1", userId: "usr-pass-1", title: "Seat alert matched", message: "RTC100 has dropped into the yellow band near Nalgonda.", createdAt: at(-12), read: false },
  { id: "ntf-2", userId: "usr-log-1", title: "Parcel health stable", message: "Parcel prc-1001 checked in successfully after loading.", createdAt: at(-6), read: true }
];

export const seatPredictions: SeatPredictionResult[] = [
  { routeId: "rt-100", stopId: "st-khm", timeWindow: "11:00-12:00", predictedLoad: 32, availabilityIndicator: "yellow", confidence: 0.82 },
  { routeId: "rt-100", stopId: "st-vjw", timeWindow: "12:00-13:00", predictedLoad: 24, availabilityIndicator: "green", confidence: 0.71 },
  { routeId: "rt-200", stopId: "st-vjw-2", timeWindow: "11:30-12:30", predictedLoad: 35, availabilityIndicator: "red", confidence: 0.76 }
];

export const adminStats = [
  { label: "Fleet online", value: "10", hint: "+2 reserve buses ready" },
  { label: "Avg occupancy", value: "68%", hint: "Heatmap updated every 30 sec" },
  { label: "Parcels moving", value: "37", hint: "5 health events need review" },
  { label: "Revenue today", value: "₹1.28L", hint: "Tickets + logistics combined" }
];
