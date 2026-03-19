export type UserRole = "passenger" | "conductor" | "admin" | "logistics_user";

export type SeatAvailabilityIndicator = "green" | "yellow" | "red";
export type ParcelHealthStatus = "stable" | "temperature_warning" | "shock_warning";
export type ParcelStatus = "booked" | "loaded" | "in_transit" | "arrived" | "delivered";
export type TicketStatus = "active" | "completed" | "expired";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  city: string;
}

export interface Depot {
  id: string;
  name: string;
  city: string;
}

export interface Stop {
  id: string;
  name: string;
  city: string;
  order: number;
  coordinates: Coordinates;
}

export interface Route {
  id: string;
  lineageId: string;
  code: string;
  name: string;
  origin: string;
  destination: string;
  distanceKm: number;
  averageSegmentMinutes: number;
  stops: Stop[];
}

export interface RouteLineage {
  id: string;
  name: string;
  routeIds: string[];
  cityChain: string[];
}

export interface BusCapacity {
  seats: number;
  luggageVolume: number;
}

export interface BusTelemetry {
  speedKmph: number;
  coordinates: Coordinates;
  heading: number;
  lastUpdated: string;
  currentStopId: string;
  nextStopId: string;
}

export interface Bus {
  id: string;
  code: string;
  routeId: string;
  depotId: string;
  conductorId: string;
  occupancy: number;
  capacity: BusCapacity;
  telemetry: BusTelemetry;
  luggageUsed: number;
}

export interface BusOccupancyStatus {
  busId: string;
  occupiedSeats: number;
  availableSeats: number;
  indicator: SeatAvailabilityIndicator;
  updatedAt: string;
}

export interface Schedule {
  busId: string;
  routeId: string;
  departureTime: string;
  arrivalTime: string;
}

export interface RouteLineageTicket {
  ticketId: string;
  lineageId: string;
  originStopId: string;
  destinationStopId: string;
  allowedSegments: number[];
  status: TicketStatus;
  qrToken: string;
}

export interface Ticket extends RouteLineageTicket {
  passengerId: string;
  fare: number;
  issuedAt: string;
  validUntil: string;
  activeBusId?: string;
}

export interface BoardingEvent {
  id: string;
  ticketId: string;
  busId: string;
  conductorId: string;
  stopId: string;
  timestamp: string;
}

export interface SeatAlertSubscription {
  id: string;
  userId: string;
  routeId: string;
  targetIndicator: SeatAvailabilityIndicator;
}

export interface ParcelDimensions {
  length: number;
  width: number;
  height: number;
}

export interface Parcel {
  id: string;
  senderId: string;
  fromCity: string;
  destinationCity: string;
  dimensions: ParcelDimensions;
  weightKg: number;
  assignedBusId?: string;
  status: ParcelStatus;
  qrToken: string;
  eta: string;
  healthStatus: ParcelHealthStatus;
}

export interface ParcelScanEvent {
  id: string;
  parcelId: string;
  busId: string;
  city: string;
  action: "loaded" | "unloaded";
  timestamp: string;
}

export interface ParcelTrackingStatus {
  parcelId: string;
  currentBusId?: string;
  currentCity: string;
  eta: string;
  healthStatus: ParcelHealthStatus;
  scanHistory: ParcelScanEvent[];
}

export interface SeatPredictionResult {
  routeId: string;
  stopId: string;
  timeWindow: string;
  predictedLoad: number;
  availabilityIndicator: SeatAvailabilityIndicator;
  confidence: number;
}

export interface CargoFitResult {
  busId: string;
  parcelId: string;
  fits: boolean;
  remainingVolume: number;
  score: number;
  reason: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface RevenueRecord {
  id: string;
  source: "ticket" | "parcel";
  amount: number;
  city: string;
  timestamp: string;
}

export interface AnalyticsAggregate {
  totalBuses: number;
  activeTrips: number;
  ticketsToday: number;
  parcelsInTransit: number;
  revenueToday: number;
  averageOccupancy: number;
}

export interface LiveBusCardData {
  bus: Bus;
  route: Route;
  occupancy: BusOccupancyStatus;
  etaMinutes: number;
}

export interface ParcelContainerHealth {
  id: string;
  parcelId: string;
  healthStatus: ParcelHealthStatus;
  temperatureC?: number;
  impactG?: number;
  recordedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  notificationType: "seat_available" | "parcel_status" | "delay" | "alert";
  relatedId?: string;
  read: boolean;
  createdAt: string;
}

export interface OccupancySnapshot {
  id: string;
  busId: string;
  occupiedSeats: number;
  totalSeats: number;
  snapshotAt: string;
}

export interface AnalyticsDashboard {
  totalTicketsSold: number;
  totalRevenueTickets: number;
  totalParcelsDelivered: number;
  totalRevenueParcel: number;
  avgOccupancy: number;
  peakHour: number;
  busCount: number;
  activeTrips: number;
}

export interface LineageTransferInfo {
  lineageId: string;
  sourceTicketId: string;
  sourceRouteId: string;
  destinationRouteId: string;
  transferStopId: string;
  transferTime: string;
  newTicketId?: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  iat: number;
  exp: number;
}
