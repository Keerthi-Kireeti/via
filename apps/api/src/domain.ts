import type {
  AnalyticsAggregate,
  Bus,
  BusOccupancyStatus,
  CargoFitResult,
  NotificationItem,
  Parcel,
  ParcelDimensions,
  ParcelHealthStatus,
  ParcelTrackingStatus,
  Route,
  RouteLineage,
  Schedule,
  SeatAvailabilityIndicator,
  SeatPredictionResult,
  Ticket,
  User,
  UserRole
} from "@transitlink/types";
import {
  analyticsAggregate,
  boardingEvents,
  buses,
  notifications,
  parcelScanEvents,
  parcels,
  revenueRecords,
  routeLineages,
  routes,
  schedules,
  seatAlertSubscriptions,
  seatPredictions,
  tickets,
  users
} from "./seed.js";

export const store = {
  users,
  routes,
  routeLineages,
  buses,
  schedules,
  tickets,
  parcels,
  parcelScanEvents,
  notifications,
  boardingEvents,
  revenueRecords,
  seatAlertSubscriptions
};

export function getIndicator(occupied: number, seats: number): SeatAvailabilityIndicator {
  const ratio = occupied / seats;
  if (ratio < 0.6) return "green";
  if (ratio <= 0.85) return "yellow";
  return "red";
}

export function getOccupancyStatus(bus: Bus): BusOccupancyStatus {
  return {
    busId: bus.id,
    occupiedSeats: bus.occupancy,
    availableSeats: Math.max(bus.capacity.seats - bus.occupancy, 0),
    indicator: getIndicator(bus.occupancy, bus.capacity.seats),
    updatedAt: bus.telemetry.lastUpdated
  };
}

export function getEtaMinutes(bus: Bus, route: Route): number {
  const currentStop = route.stops.find((stop) => stop.id === bus.telemetry.currentStopId)?.order ?? 0;
  const segmentsRemaining = Math.max(route.stops.length - 1 - currentStop, 0);
  return Math.round(segmentsRemaining * route.averageSegmentMinutes * 0.7);
}

export function getNearbyBuses(lat: number, lng: number) {
  return store.buses
    .map((bus) => {
      const route = store.routes.find((routeItem) => routeItem.id === bus.routeId)!;
      const distance = Math.sqrt(
        Math.pow((bus.telemetry.coordinates.lat - lat) * 111, 2) +
          Math.pow((bus.telemetry.coordinates.lng - lng) * 111, 2)
      );
      return {
        bus,
        route,
        occupancy: getOccupancyStatus(bus),
        etaMinutes: getEtaMinutes(bus, route),
        distanceKm: Number(distance.toFixed(1))
      };
    })
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 6);
}

export function createJwtPayload(user: User) {
  return { sub: user.id, role: user.role, email: user.email, name: user.name };
}

export function getProfile(userId: string) {
  const user = store.users.find((entry) => entry.id === userId);
  if (!user) return null;
  return {
    user,
    notifications: store.notifications.filter((notification) => notification.userId === userId)
  };
}

export function quoteFare(routeId: string, originStopId: string, destinationStopId: string) {
  const route = store.routes.find((entry) => entry.id === routeId);
  if (!route) throw new Error("Route not found");
  const originOrder = route.stops.find((stop) => stop.id === originStopId)?.order ?? 0;
  const destinationOrder = route.stops.find((stop) => stop.id === destinationStopId)?.order ?? route.stops.length - 1;
  const segments = Math.max(destinationOrder - originOrder, 1);
  return { routeId, originStopId, destinationStopId, fare: 90 + segments * 85 };
}

export function purchaseTicket(input: {
  passengerId: string;
  routeId: string;
  originStopId: string;
  destinationStopId: string;
}) {
  const route = store.routes.find((entry) => entry.id === input.routeId);
  if (!route) throw new Error("Route not found");
  const originOrder = route.stops.find((stop) => stop.id === input.originStopId)?.order ?? 0;
  const destinationOrder = route.stops.find((stop) => stop.id === input.destinationStopId)?.order ?? route.stops.length - 1;
  const fare = quoteFare(input.routeId, input.originStopId, input.destinationStopId).fare;
  const ticket: Ticket = {
    ticketId: `tkt-${Date.now()}`,
    passengerId: input.passengerId,
    lineageId: route.lineageId,
    originStopId: input.originStopId,
    destinationStopId: input.destinationStopId,
    allowedSegments: Array.from({ length: Math.max(destinationOrder - originOrder, 1) }, (_, index) => originOrder + index),
    status: "active",
    qrToken: `QR-TKT-${Date.now()}`,
    fare,
    issuedAt: new Date().toISOString(),
    validUntil: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
  };
  store.tickets.unshift(ticket);
  return ticket;
}

export function validateTicketScan(ticketId: string, busId: string) {
  const ticket = store.tickets.find((entry) => entry.ticketId === ticketId);
  if (!ticket) return { ok: false, reason: "Ticket not found" };
  if (ticket.status !== "active") return { ok: false, reason: `Ticket is ${ticket.status}` };
  if (new Date(ticket.validUntil).getTime() < Date.now()) {
    ticket.status = "expired";
    return { ok: false, reason: "Ticket expired" };
  }
  const bus = store.buses.find((entry) => entry.id === busId);
  const route = bus ? store.routes.find((entry) => entry.id === bus.routeId) : null;
  if (!bus || !route || route.lineageId !== ticket.lineageId) return { ok: false, reason: "Bus does not belong to ticket lineage" };
  const currentStopOrder = route.stops.find((stop) => stop.id === bus.telemetry.currentStopId)?.order ?? 0;
  const destinationOrder = route.stops.find((stop) => stop.id === ticket.destinationStopId)?.order ?? Infinity;
  if (currentStopOrder > destinationOrder) return { ok: false, reason: "Journey already beyond destination segment" };
  ticket.activeBusId = busId;
  bus.occupancy = Math.min(bus.occupancy + 1, bus.capacity.seats);
  store.boardingEvents.unshift({
    id: `brd-${Date.now()}`,
    ticketId,
    busId,
    conductorId: bus.conductorId,
    stopId: bus.telemetry.currentStopId,
    timestamp: new Date().toISOString()
  });
  return { ok: true, ticket, bus, occupancy: getOccupancyStatus(bus) };
}

export function updateSeatOccupancy(busId: string, occupiedSeats: number) {
  const bus = store.buses.find((entry) => entry.id === busId);
  if (!bus) throw new Error("Bus not found");
  bus.occupancy = Math.max(0, Math.min(occupiedSeats, bus.capacity.seats));
  bus.telemetry.lastUpdated = new Date().toISOString();
  return getOccupancyStatus(bus);
}

export function getSeatPredictions(routeId?: string): SeatPredictionResult[] {
  return routeId ? seatPredictions.filter((entry) => entry.routeId === routeId) : seatPredictions;
}

export function predictCargoFit(parcelId: string, busId: string): CargoFitResult {
  const parcel = store.parcels.find((entry) => entry.id === parcelId);
  const bus = store.buses.find((entry) => entry.id === busId);
  if (!parcel || !bus) throw new Error("Parcel or bus not found");
  const parcelVolume = (parcel.dimensions.length * parcel.dimensions.width * parcel.dimensions.height) / 1000;
  const remainingVolume = Math.max(bus.capacity.luggageVolume - bus.luggageUsed, 0);
  const fits = parcelVolume <= remainingVolume && parcel.weightKg <= 20;
  return {
    busId,
    parcelId,
    fits,
    remainingVolume,
    score: Number(Math.max(0, Math.min(1, remainingVolume / Math.max(parcelVolume, 1))).toFixed(2)),
    reason: fits ? "Parcel fits within available luggage capacity." : "Remaining luggage volume is insufficient for this parcel."
  };
}

export function createParcelBooking(input: {
  senderId: string;
  fromCity: string;
  destinationCity: string;
  dimensions: ParcelDimensions;
  weightKg: number;
}) {
  const candidate = store.buses.find((bus) => {
    const route = store.routes.find((entry) => entry.id === bus.routeId)!;
    return route.stops.some((stop) => stop.city === input.fromCity) && route.stops.some((stop) => stop.city === input.destinationCity);
  });
  const parcel: Parcel = {
    id: `prc-${Date.now()}`,
    senderId: input.senderId,
    fromCity: input.fromCity,
    destinationCity: input.destinationCity,
    dimensions: input.dimensions,
    weightKg: input.weightKg,
    assignedBusId: candidate?.id,
    status: "booked",
    qrToken: `QR-PRC-${Date.now()}`,
    eta: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    healthStatus: "stable"
  };
  store.parcels.unshift(parcel);
  return { parcel, fit: candidate ? predictCargoFit(parcel.id, candidate.id) : null };
}

export function updateParcelScan(parcelId: string, busId: string, action: "loaded" | "unloaded") {
  const parcel = store.parcels.find((entry) => entry.id === parcelId);
  const bus = store.buses.find((entry) => entry.id === busId);
  if (!parcel || !bus) throw new Error("Parcel or bus not found");
  parcel.assignedBusId = busId;
  parcel.status = action === "loaded" ? "loaded" : "arrived";
  const route = store.routes.find((entry) => entry.id === bus.routeId)!;
  store.parcelScanEvents.unshift({
    id: `psc-${Date.now()}`,
    parcelId,
    busId,
    city: route.stops.find((stop) => stop.id === bus.telemetry.currentStopId)?.city ?? route.origin,
    action,
    timestamp: new Date().toISOString()
  });
  return { parcel, tracking: getParcelTracking(parcelId) };
}

export function updateParcelHealth(parcelId: string, healthStatus: ParcelHealthStatus) {
  const parcel = store.parcels.find((entry) => entry.id === parcelId);
  if (!parcel) throw new Error("Parcel not found");
  parcel.healthStatus = healthStatus;
  return getParcelTracking(parcelId);
}

export function getParcelTracking(parcelId: string): ParcelTrackingStatus {
  const parcel = store.parcels.find((entry) => entry.id === parcelId);
  if (!parcel) throw new Error("Parcel not found");
  const bus = parcel.assignedBusId ? store.buses.find((entry) => entry.id === parcel.assignedBusId) : undefined;
  const route = bus ? store.routes.find((entry) => entry.id === bus.routeId) : undefined;
  return {
    parcelId: parcel.id,
    currentBusId: parcel.assignedBusId,
    currentCity: route?.stops.find((stop) => stop.id === bus?.telemetry.currentStopId)?.city ?? parcel.fromCity,
    eta: parcel.eta,
    healthStatus: parcel.healthStatus,
    scanHistory: store.parcelScanEvents.filter((event) => event.parcelId === parcelId)
  };
}

export function getAdminDashboard(): AnalyticsAggregate & {
  congestionRoutes: Array<{ routeId: string; routeName: string; occupancy: number }>;
  routePerformance: Array<{ routeId: string; ticketRevenue: number; parcelRevenue: number }>;
  conductorActivity: Array<{ conductorId: string; conductorName: string; scansToday: number }>;
} {
  return {
    ...analyticsAggregate,
    congestionRoutes: store.buses
      .map((bus) => ({
        routeId: bus.routeId,
        routeName: store.routes.find((route) => route.id === bus.routeId)?.name ?? bus.routeId,
        occupancy: Math.round((bus.occupancy / bus.capacity.seats) * 100)
      }))
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 4),
    routePerformance: store.routes.map((route) => ({
      routeId: route.id,
      ticketRevenue: store.tickets.filter((ticket) => ticket.lineageId === route.lineageId).reduce((sum, ticket) => sum + ticket.fare, 0),
      parcelRevenue: store.revenueRecords
        .filter((record) => record.source === "parcel" && route.stops.some((stop) => stop.city === record.city))
        .reduce((sum, record) => sum + record.amount, 0)
    })),
    conductorActivity: store.users.filter((user) => user.role === "conductor").map((conductor) => ({
      conductorId: conductor.id,
      conductorName: conductor.name,
      scansToday:
        store.boardingEvents.filter((event) => event.conductorId === conductor.id).length +
        store.parcelScanEvents.filter((event) => store.buses.find((bus) => bus.id === event.busId)?.conductorId === conductor.id).length
    }))
  };
}

export function listNotifications(userId?: string): NotificationItem[] {
  return userId ? store.notifications.filter((notification) => notification.userId === userId) : store.notifications;
}

export function listSchedules(): Schedule[] {
  return store.schedules;
}

export function listRoutes(): Route[] {
  return store.routes;
}

export function listLineages(): RouteLineage[] {
  return store.routeLineages;
}

export function listBuses() {
  return store.buses.map((bus) => ({
    ...bus,
    occupancyStatus: getOccupancyStatus(bus),
    route: store.routes.find((route) => route.id === bus.routeId)
  }));
}

export function listParcels() {
  return store.parcels.map((parcel) => ({
    ...parcel,
    tracking: getParcelTracking(parcel.id)
  }));
}

export function resolveRoleRedirect(role: UserRole) {
  switch (role) {
    case "admin":
      return "/admin";
    case "conductor":
      return "/conductor";
    case "logistics_user":
      return "/logistics";
    default:
      return "/passenger";
  }
}

// 3D Cargo Optimization
export interface CargoForOptimization {
  id: string;
  length: number;
  width: number;
  height: number;
  weightKg: number;
}

export interface BusCapacity {
  length: number; // cm
  width: number;
  height: number;
  maxWeightKg: number;
}

export interface PlacedCargo extends CargoForOptimization {
  position: { x: number; y: number; z: number };
}

export interface OptimizationResult {
  placed: PlacedCargo[];
  unplaced: CargoForOptimization[];
  volumeUtilization: number;
  weightUtilization: number;
  totalWeight: number;
}

function generateRotations(cargo: CargoForOptimization): CargoForOptimization[] {
  const rotations: CargoForOptimization[] = [];
  const dimensions = [cargo.length, cargo.width, cargo.height];
  const permutations = [
    [dimensions[0], dimensions[1], dimensions[2]],
    [dimensions[0], dimensions[2], dimensions[1]],
    [dimensions[1], dimensions[0], dimensions[2]],
    [dimensions[1], dimensions[2], dimensions[0]],
    [dimensions[2], dimensions[0], dimensions[1]],
    [dimensions[2], dimensions[1], dimensions[0]]
  ];

  const seen = new Set<string>();
  for (const [length, width, height] of permutations) {
    const key = `${length},${width},${height}`;
    if (!seen.has(key)) {
      seen.add(key);
      rotations.push({ ...cargo, length, width, height });
    }
  }

  return rotations;
}

interface Rectangle {
  x: number;
  y: number;
  z: number;
  width: number;
  height: number;
  depth: number;
}

function splitRectangle(
  rect: Rectangle,
  itemPos: { x: number; y: number; z: number },
  item: PlacedCargo
): Rectangle[] {
  const newRects: Rectangle[] = [];

  if (itemPos.x + item.width < rect.x + rect.width) {
    newRects.push({
      x: itemPos.x + item.width,
      y: rect.y,
      z: rect.z,
      width: rect.x + rect.width - (itemPos.x + item.width),
      height: rect.height,
      depth: rect.depth
    });
  }

  if (itemPos.y + item.height < rect.y + rect.height) {
    newRects.push({
      x: rect.x,
      y: itemPos.y + item.height,
      z: rect.z,
      width: rect.width,
      height: rect.y + rect.height - (itemPos.y + item.height),
      depth: rect.depth
    });
  }

  if (itemPos.z + item.length < rect.z + rect.depth) {
    newRects.push({
      x: rect.x,
      y: rect.y,
      z: itemPos.z + item.length,
      width: rect.width,
      height: rect.height,
      depth: rect.z + rect.depth - (itemPos.z + item.length)
    });
  }

  return newRects;
}

export function optimizeCargoPlacement(
  cargo: CargoForOptimization[],
  bay: BusCapacity
): OptimizationResult {
  const sortedCargo = [...cargo].sort(
    (a, b) =>
      b.length * b.width * b.height - (a.length * a.width * a.height)
  );

  const placed: PlacedCargo[] = [];
  const unplaced: CargoForOptimization[] = [];
  let totalWeight = 0;

  const freeRectangles: Rectangle[] = [
    {
      x: 0,
      y: 0,
      z: 0,
      width: bay.width,
      height: bay.height,
      depth: bay.length
    }
  ];

  for (const item of sortedCargo) {
    if (totalWeight + item.weightKg > bay.maxWeightKg) {
      unplaced.push(item);
      continue;
    }

    const rotations = generateRotations(item);
    let bestFit: {
      position: { x: number; y: number; z: number };
      rotation: CargoForOptimization;
      rectangleIndex: number;
      wastedSpace: number;
    } | null = null;

    for (let rectIdx = 0; rectIdx < freeRectangles.length; rectIdx++) {
      const rect = freeRectangles[rectIdx];

      for (const rotatedItem of rotations) {
        if (
          rotatedItem.width <= rect.width &&
          rotatedItem.height <= rect.height &&
          rotatedItem.length <= rect.depth
        ) {
          const wastedSpace =
            rect.width * rect.height * rect.depth -
            (rotatedItem.width * rotatedItem.height * rotatedItem.length);

          if (!bestFit || wastedSpace < bestFit.wastedSpace) {
            bestFit = {
              position: { x: rect.x, y: rect.y, z: rect.z },
              rotation: rotatedItem,
              rectangleIndex: rectIdx,
              wastedSpace
            };
          }
        }
      }
    }

    if (bestFit) {
      const placedItem: PlacedCargo = {
        ...bestFit.rotation,
        id: item.id,
        weightKg: item.weightKg,
        position: bestFit.position
      };

      placed.push(placedItem);
      totalWeight += item.weightKg;

      const rect = freeRectangles[bestFit.rectangleIndex];
      freeRectangles.splice(bestFit.rectangleIndex, 1);

      const newRectangles = splitRectangle(rect, placedItem.position, placedItem);
      freeRectangles.push(...newRectangles);
    } else {
      unplaced.push(item);
    }
  }

  const totalVolume = bay.length * bay.width * bay.height;
  const usedVolume = placed.reduce(
    (sum, p) => sum + p.length * p.width * p.height,
    0
  );

  return {
    placed,
    unplaced,
    volumeUtilization: usedVolume / totalVolume,
    weightUtilization: totalWeight / bay.maxWeightKg,
    totalWeight
  };
}
