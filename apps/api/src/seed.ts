import type {
  AnalyticsAggregate,
  BoardingEvent,
  Bus,
  Depot,
  NotificationItem,
  Parcel,
  ParcelScanEvent,
  RevenueRecord,
  Route,
  RouteLineage,
  Schedule,
  SeatAlertSubscription,
  SeatPredictionResult,
  Stop,
  Ticket,
  User
} from "@transitlink/types";

const now = new Date("2026-03-16T10:30:00.000Z");
const inMinutes = (minutes: number) => new Date(now.getTime() + minutes * 60000).toISOString();

const makeStops = (entries: Array<{ id: string; name: string; city: string; lat: number; lng: number }>): Stop[] =>
  entries.map((entry, index) => ({
    id: entry.id,
    name: entry.name,
    city: entry.city,
    order: index,
    coordinates: { lat: entry.lat, lng: entry.lng }
  }));

export const depots: Depot[] = [
  { id: "dep-hyd", name: "Hyderabad Central Depot", city: "Hyderabad" },
  { id: "dep-vij", name: "Vijayawada River Depot", city: "Vijayawada" }
];

export const users: User[] = [
  { id: "usr-admin-1", name: "Asha Reddy", email: "asha@via.app", role: "admin", city: "Hyderabad" },
  { id: "usr-con-1", name: "Ramesh Kumar", email: "ramesh@via.app", role: "conductor", city: "Hyderabad" },
  { id: "usr-con-2", name: "Divya Nair", email: "divya@via.app", role: "conductor", city: "Vijayawada" },
  { id: "usr-con-3", name: "Harish Rao", email: "harish@via.app", role: "conductor", city: "Guntur" },
  { id: "usr-pass-1", name: "Neha Patel", email: "neha@via.app", role: "passenger", city: "Hyderabad" },
  { id: "usr-pass-2", name: "Farhan Ali", email: "farhan@via.app", role: "passenger", city: "Warangal" },
  { id: "usr-pass-3", name: "Sai Charan", email: "sai@via.app", role: "passenger", city: "Vijayawada" },
  { id: "usr-pass-4", name: "Anjali Mehta", email: "anjali@via.app", role: "passenger", city: "Guntur" },
  { id: "usr-pass-5", name: "Kiran Das", email: "kiran@via.app", role: "passenger", city: "Nalgonda" },
  { id: "usr-pass-6", name: "Lakshmi Rao", email: "lakshmi@via.app", role: "passenger", city: "Hyderabad" },
  { id: "usr-pass-7", name: "Rohit Jain", email: "rohit@via.app", role: "passenger", city: "Khammam" },
  { id: "usr-pass-8", name: "Priya Singh", email: "priya@via.app", role: "passenger", city: "Warangal" },
  { id: "usr-pass-9", name: "Mohan Krishna", email: "mohan@via.app", role: "passenger", city: "Vijayawada" },
  { id: "usr-pass-10", name: "Ishita Sen", email: "ishita@via.app", role: "passenger", city: "Guntur" },
  { id: "usr-log-1", name: "ParcelPoint Hyderabad", email: "parcel1@via.app", role: "logistics_user", city: "Hyderabad" },
  { id: "usr-log-2", name: "ParcelPoint Warangal", email: "parcel2@via.app", role: "logistics_user", city: "Warangal" },
  { id: "usr-log-3", name: "ParcelPoint Vijayawada", email: "parcel3@via.app", role: "logistics_user", city: "Vijayawada" },
  { id: "usr-log-4", name: "ParcelPoint Guntur", email: "parcel4@via.app", role: "logistics_user", city: "Guntur" },
  { id: "usr-log-5", name: "ParcelPoint Khammam", email: "parcel5@via.app", role: "logistics_user", city: "Khammam" }
];

const lineage1Stops = makeStops([
  { id: "st-hyd", name: "MGBS", city: "Hyderabad", lat: 17.384, lng: 78.4867 },
  { id: "st-nlg", name: "Nalgonda Junction", city: "Nalgonda", lat: 17.0541, lng: 79.2671 },
  { id: "st-khm", name: "Khammam Bus Hub", city: "Khammam", lat: 17.2473, lng: 80.1514 },
  { id: "st-vjw", name: "Pandit Nehru Bus Station", city: "Vijayawada", lat: 16.5062, lng: 80.648 },
  { id: "st-gnt", name: "Guntur Central", city: "Guntur", lat: 16.3067, lng: 80.4365 }
]);

const lineage2Stops = makeStops([
  { id: "st-wgl", name: "Warangal Terminal", city: "Warangal", lat: 17.9689, lng: 79.5941 },
  { id: "st-khm-2", name: "Khammam South", city: "Khammam", lat: 17.251, lng: 80.15 },
  { id: "st-vjw-2", name: "Vijayawada East", city: "Vijayawada", lat: 16.52, lng: 80.65 },
  { id: "st-gnt-2", name: "Guntur Market", city: "Guntur", lat: 16.31, lng: 80.44 }
]);

const lineage3Stops = makeStops([
  { id: "st-hyd-2", name: "JBS Secunderabad", city: "Hyderabad", lat: 17.4399, lng: 78.4983 },
  { id: "st-srp", name: "Suryapet Interchange", city: "Suryapet", lat: 17.1405, lng: 79.6206 },
  { id: "st-vjw-3", name: "Vijayawada Central", city: "Vijayawada", lat: 16.5035, lng: 80.646 },
  { id: "st-elp", name: "Eluru Depot", city: "Eluru", lat: 16.7107, lng: 81.0952 }
]);

const lineage4Stops = makeStops([
  { id: "st-gnt-3", name: "Guntur Depot", city: "Guntur", lat: 16.299, lng: 80.457 },
  { id: "st-ten", name: "Tenali Bus Stand", city: "Tenali", lat: 16.239, lng: 80.645 },
  { id: "st-vjw-4", name: "Vijayawada Cargo Bay", city: "Vijayawada", lat: 16.512, lng: 80.639 },
  { id: "st-rjy", name: "Rajahmundry Transit", city: "Rajahmundry", lat: 17.0052, lng: 81.7778 }
]);

export const routes: Route[] = [
  { id: "rt-100", lineageId: "lin-1", code: "RTC100", name: "Hyderabad to Guntur Express", origin: "Hyderabad", destination: "Guntur", distanceKm: 275, averageSegmentMinutes: 55, stops: lineage1Stops },
  { id: "rt-101", lineageId: "lin-1", code: "RTC101", name: "Nalgonda to Guntur Connector", origin: "Nalgonda", destination: "Guntur", distanceKm: 190, averageSegmentMinutes: 48, stops: lineage1Stops.slice(1) },
  { id: "rt-200", lineageId: "lin-2", code: "RTC200", name: "Warangal to Guntur Superliner", origin: "Warangal", destination: "Guntur", distanceKm: 220, averageSegmentMinutes: 50, stops: lineage2Stops },
  { id: "rt-300", lineageId: "lin-3", code: "RTC300", name: "Hyderabad to Eluru Intercity", origin: "Hyderabad", destination: "Eluru", distanceKm: 310, averageSegmentMinutes: 70, stops: lineage3Stops },
  { id: "rt-400", lineageId: "lin-4", code: "RTC400", name: "Guntur to Rajahmundry CargoLink", origin: "Guntur", destination: "Rajahmundry", distanceKm: 180, averageSegmentMinutes: 52, stops: lineage4Stops }
];

export const routeLineages: RouteLineage[] = [
  { id: "lin-1", name: "Hyderabad to Coastal South", routeIds: ["rt-100", "rt-101"], cityChain: ["Hyderabad", "Nalgonda", "Khammam", "Vijayawada", "Guntur"] },
  { id: "lin-2", name: "Warangal to Guntur Arc", routeIds: ["rt-200"], cityChain: ["Warangal", "Khammam", "Vijayawada", "Guntur"] },
  { id: "lin-3", name: "Hyderabad to Eluru Corridor", routeIds: ["rt-300"], cityChain: ["Hyderabad", "Suryapet", "Vijayawada", "Eluru"] },
  { id: "lin-4", name: "Guntur Coastal Cargo", routeIds: ["rt-400"], cityChain: ["Guntur", "Tenali", "Vijayawada", "Rajahmundry"] }
];

export const buses: Bus[] = [
  { id: "bus-101", code: "TS09AB1101", routeId: "rt-100", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 21, capacity: { seats: 40, luggageVolume: 180 }, luggageUsed: 74, telemetry: { speedKmph: 52, coordinates: { lat: 17.22, lng: 79.14 }, heading: 130, lastUpdated: inMinutes(-4), currentStopId: "st-nlg", nextStopId: "st-khm" } },
  { id: "bus-102", code: "TS09AB1102", routeId: "rt-100", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 34, capacity: { seats: 40, luggageVolume: 180 }, luggageUsed: 128, telemetry: { speedKmph: 49, coordinates: { lat: 16.92, lng: 80.08 }, heading: 160, lastUpdated: inMinutes(-2), currentStopId: "st-khm", nextStopId: "st-vjw" } },
  { id: "bus-103", code: "TS09AB1103", routeId: "rt-101", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 15, capacity: { seats: 36, luggageVolume: 160 }, luggageUsed: 52, telemetry: { speedKmph: 58, coordinates: { lat: 16.61, lng: 80.59 }, heading: 180, lastUpdated: inMinutes(-1), currentStopId: "st-vjw", nextStopId: "st-gnt" } },
  { id: "bus-201", code: "TS03CD2201", routeId: "rt-200", depotId: "dep-vij", conductorId: "usr-con-2", occupancy: 28, capacity: { seats: 42, luggageVolume: 190 }, luggageUsed: 118, telemetry: { speedKmph: 56, coordinates: { lat: 17.44, lng: 80.01 }, heading: 175, lastUpdated: inMinutes(-3), currentStopId: "st-khm-2", nextStopId: "st-vjw-2" } },
  { id: "bus-202", code: "TS03CD2202", routeId: "rt-200", depotId: "dep-vij", conductorId: "usr-con-2", occupancy: 11, capacity: { seats: 42, luggageVolume: 190 }, luggageUsed: 30, telemetry: { speedKmph: 47, coordinates: { lat: 17.87, lng: 79.63 }, heading: 135, lastUpdated: inMinutes(-6), currentStopId: "st-wgl", nextStopId: "st-khm-2" } },
  { id: "bus-301", code: "TS11EF3301", routeId: "rt-300", depotId: "dep-hyd", conductorId: "usr-con-3", occupancy: 36, capacity: { seats: 48, luggageVolume: 220 }, luggageUsed: 164, telemetry: { speedKmph: 61, coordinates: { lat: 17.14, lng: 79.61 }, heading: 145, lastUpdated: inMinutes(-4), currentStopId: "st-srp", nextStopId: "st-vjw-3" } },
  { id: "bus-302", code: "TS11EF3302", routeId: "rt-300", depotId: "dep-hyd", conductorId: "usr-con-3", occupancy: 18, capacity: { seats: 48, luggageVolume: 220 }, luggageUsed: 64, telemetry: { speedKmph: 63, coordinates: { lat: 16.89, lng: 80.27 }, heading: 160, lastUpdated: inMinutes(-2), currentStopId: "st-vjw-3", nextStopId: "st-elp" } },
  { id: "bus-401", code: "AP07GH4401", routeId: "rt-400", depotId: "dep-vij", conductorId: "usr-con-2", occupancy: 20, capacity: { seats: 38, luggageVolume: 240 }, luggageUsed: 150, telemetry: { speedKmph: 43, coordinates: { lat: 16.49, lng: 80.63 }, heading: 72, lastUpdated: inMinutes(-5), currentStopId: "st-vjw-4", nextStopId: "st-rjy" } },
  { id: "bus-402", code: "AP07GH4402", routeId: "rt-400", depotId: "dep-vij", conductorId: "usr-con-2", occupancy: 9, capacity: { seats: 38, luggageVolume: 240 }, luggageUsed: 60, telemetry: { speedKmph: 38, coordinates: { lat: 16.24, lng: 80.65 }, heading: 45, lastUpdated: inMinutes(-5), currentStopId: "st-ten", nextStopId: "st-vjw-4" } },
  { id: "bus-104", code: "TS09AB1104", routeId: "rt-100", depotId: "dep-hyd", conductorId: "usr-con-1", occupancy: 6, capacity: { seats: 40, luggageVolume: 180 }, luggageUsed: 20, telemetry: { speedKmph: 0, coordinates: { lat: 17.384, lng: 78.4867 }, heading: 0, lastUpdated: inMinutes(-12), currentStopId: "st-hyd", nextStopId: "st-nlg" } }
];

export const schedules: Schedule[] = buses.map((bus, index) => ({
  busId: bus.id,
  routeId: bus.routeId,
  departureTime: inMinutes(index * 8 - 90),
  arrivalTime: inMinutes(index * 8 + 180)
}));

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
    issuedAt: inMinutes(-80),
    validUntil: inMinutes(420),
    activeBusId: "bus-101"
  },
  {
    ticketId: "tkt-1002",
    passengerId: "usr-pass-3",
    lineageId: "lin-2",
    originStopId: "st-wgl",
    destinationStopId: "st-vjw-2",
    allowedSegments: [0, 1],
    status: "active",
    qrToken: "QR-TKT-1002",
    fare: 260,
    issuedAt: inMinutes(-45),
    validUntil: inMinutes(180),
    activeBusId: "bus-202"
  }
];

export const boardingEvents: BoardingEvent[] = [
  { id: "brd-1", ticketId: "tkt-1001", busId: "bus-101", conductorId: "usr-con-1", stopId: "st-hyd", timestamp: inMinutes(-70) }
];

export const seatAlertSubscriptions: SeatAlertSubscription[] = [
  { id: "alert-1", userId: "usr-pass-2", routeId: "rt-100", targetIndicator: "green" },
  { id: "alert-2", userId: "usr-pass-7", routeId: "rt-200", targetIndicator: "green" }
];

export const parcels: Parcel[] = [
  { id: "prc-1001", senderId: "usr-log-1", fromCity: "Hyderabad", destinationCity: "Guntur", dimensions: { length: 20, width: 18, height: 12 }, weightKg: 4, assignedBusId: "bus-101", status: "loaded", qrToken: "QR-PRC-1001", eta: inMinutes(210), healthStatus: "stable" },
  { id: "prc-1002", senderId: "usr-log-2", fromCity: "Warangal", destinationCity: "Vijayawada", dimensions: { length: 24, width: 20, height: 14 }, weightKg: 6, assignedBusId: "bus-201", status: "in_transit", qrToken: "QR-PRC-1002", eta: inMinutes(140), healthStatus: "temperature_warning" },
  { id: "prc-1003", senderId: "usr-log-3", fromCity: "Vijayawada", destinationCity: "Rajahmundry", dimensions: { length: 28, width: 24, height: 18 }, weightKg: 8, assignedBusId: "bus-401", status: "loaded", qrToken: "QR-PRC-1003", eta: inMinutes(160), healthStatus: "stable" },
  { id: "prc-1004", senderId: "usr-log-4", fromCity: "Guntur", destinationCity: "Vijayawada", dimensions: { length: 16, width: 12, height: 10 }, weightKg: 2, assignedBusId: "bus-402", status: "arrived", qrToken: "QR-PRC-1004", eta: inMinutes(30), healthStatus: "stable" },
  { id: "prc-1005", senderId: "usr-log-5", fromCity: "Khammam", destinationCity: "Guntur", dimensions: { length: 30, width: 24, height: 20 }, weightKg: 9, assignedBusId: "bus-102", status: "in_transit", qrToken: "QR-PRC-1005", eta: inMinutes(95), healthStatus: "shock_warning" },
  { id: "prc-1006", senderId: "usr-log-1", fromCity: "Hyderabad", destinationCity: "Vijayawada", dimensions: { length: 12, width: 10, height: 8 }, weightKg: 1, assignedBusId: "bus-301", status: "booked", qrToken: "QR-PRC-1006", eta: inMinutes(180), healthStatus: "stable" },
  { id: "prc-1007", senderId: "usr-log-2", fromCity: "Warangal", destinationCity: "Guntur", dimensions: { length: 22, width: 16, height: 15 }, weightKg: 5, assignedBusId: "bus-201", status: "loaded", qrToken: "QR-PRC-1007", eta: inMinutes(210), healthStatus: "stable" },
  { id: "prc-1008", senderId: "usr-log-3", fromCity: "Vijayawada", destinationCity: "Eluru", dimensions: { length: 18, width: 18, height: 18 }, weightKg: 4, assignedBusId: "bus-302", status: "loaded", qrToken: "QR-PRC-1008", eta: inMinutes(70), healthStatus: "stable" },
  { id: "prc-1009", senderId: "usr-log-4", fromCity: "Guntur", destinationCity: "Rajahmundry", dimensions: { length: 26, width: 22, height: 20 }, weightKg: 7, assignedBusId: "bus-401", status: "in_transit", qrToken: "QR-PRC-1009", eta: inMinutes(155), healthStatus: "temperature_warning" },
  { id: "prc-1010", senderId: "usr-log-5", fromCity: "Khammam", destinationCity: "Vijayawada", dimensions: { length: 14, width: 12, height: 10 }, weightKg: 2, assignedBusId: "bus-201", status: "delivered", qrToken: "QR-PRC-1010", eta: inMinutes(-10), healthStatus: "stable" }
];

export const parcelScanEvents: ParcelScanEvent[] = [
  { id: "psc-1", parcelId: "prc-1001", busId: "bus-101", city: "Hyderabad", action: "loaded", timestamp: inMinutes(-55) },
  { id: "psc-2", parcelId: "prc-1002", busId: "bus-201", city: "Warangal", action: "loaded", timestamp: inMinutes(-110) },
  { id: "psc-3", parcelId: "prc-1004", busId: "bus-402", city: "Vijayawada", action: "unloaded", timestamp: inMinutes(-12) },
  { id: "psc-4", parcelId: "prc-1005", busId: "bus-102", city: "Khammam", action: "loaded", timestamp: inMinutes(-95) }
];

export const notifications: NotificationItem[] = [
  { id: "ntf-1", userId: "usr-pass-1", title: "Seat availability improved", message: "Bus RTC101 is now in the green band for your route to Guntur.", createdAt: inMinutes(-15), read: false },
  { id: "ntf-2", userId: "usr-log-2", title: "Parcel health warning", message: "Parcel prc-1002 reported a temperature warning at Khammam.", createdAt: inMinutes(-5), read: false }
];

export const revenueRecords: RevenueRecord[] = [
  { id: "rev-1", source: "ticket", amount: 420, city: "Hyderabad", timestamp: inMinutes(-80) },
  { id: "rev-2", source: "ticket", amount: 260, city: "Warangal", timestamp: inMinutes(-45) },
  { id: "rev-3", source: "parcel", amount: 180, city: "Hyderabad", timestamp: inMinutes(-55) },
  { id: "rev-4", source: "parcel", amount: 140, city: "Warangal", timestamp: inMinutes(-110) }
];

export const seatPredictions: SeatPredictionResult[] = [
  { routeId: "rt-100", stopId: "st-khm", timeWindow: "11:00-12:00", predictedLoad: 32, availabilityIndicator: "yellow", confidence: 0.82 },
  { routeId: "rt-100", stopId: "st-vjw", timeWindow: "12:00-13:00", predictedLoad: 24, availabilityIndicator: "green", confidence: 0.71 },
  { routeId: "rt-200", stopId: "st-vjw-2", timeWindow: "11:30-12:30", predictedLoad: 35, availabilityIndicator: "red", confidence: 0.76 },
  { routeId: "rt-400", stopId: "st-rjy", timeWindow: "13:00-14:00", predictedLoad: 18, availabilityIndicator: "green", confidence: 0.66 }
];

export const analyticsAggregate: AnalyticsAggregate = {
  totalBuses: buses.length,
  activeTrips: 8,
  ticketsToday: 1648,
  parcelsInTransit: parcels.filter((parcel) => ["loaded", "in_transit"].includes(parcel.status)).length,
  revenueToday: 128400,
  averageOccupancy: 68
};
