import cors from "cors";
import express from "express";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import {
  createJwtPayload,
  createParcelBooking,
  getAdminDashboard,
  getNearbyBuses,
  getParcelTracking,
  getProfile,
  getSeatPredictions,
  listBuses,
  listLineages,
  listNotifications,
  listParcels,
  listRoutes,
  listSchedules,
  optimizeCargoPlacement,
  predictCargoFit,
  purchaseTicket,
  quoteFare,
  resolveRoleRedirect,
  store,
  updateParcelHealth,
  updateParcelScan,
  updateSeatOccupancy,
  validateTicketScan
} from "./domain.js";

export function createApp(io?: { emit: (event: string, payload: unknown) => void }) {
  const app = express();
  const jwtSecret = process.env.JWT_SECRET ?? "transitlink-dev-secret";

  app.use(cors({ origin: process.env.CLIENT_URL ?? "*" }));
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "transitlink-api" });
  });

  app.post("/auth/login", (req, res) => {
    const { email } = req.body as { email?: string };
    const user = email ? store.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase()) : undefined;
    if (!user) return res.status(401).json({ message: "Invalid credentials for demo login." });
    const token = jwt.sign(createJwtPayload(user), jwtSecret, { expiresIn: "8h" });
    return res.json({ token, user, redirectTo: resolveRoleRedirect(user.role) });
  });

  app.post("/auth/signup", (req, res) => {
    const { name, email, role = "passenger", city = "Hyderabad" } = req.body as {
      name?: string;
      email?: string;
      role?: typeof store.users[number]["role"];
      city?: string;
    };
    if (!name || !email) return res.status(400).json({ message: "Name and email are required." });
    const user = { id: `usr-${Date.now()}`, name, email, role, city };
    store.users.unshift(user);
    const token = jwt.sign(createJwtPayload(user), jwtSecret, { expiresIn: "8h" });
    return res.status(201).json({ token, user, redirectTo: resolveRoleRedirect(role) });
  });

  app.post("/auth/refresh", (_req, res) => res.json({ ok: true }));
  app.get("/auth/profile/:userId", (req, res) => {
    const profile = getProfile(req.params.userId);
    if (!profile) return res.status(404).json({ message: "User not found." });
    return res.json(profile);
  });

  app.get("/routes", (_req, res) => res.json({ routes: listRoutes(), lineages: listLineages(), schedules: listSchedules() }));
  app.get("/buses", (_req, res) => res.json({ buses: listBuses() }));
  app.get("/buses/nearby", (req, res) => res.json({ buses: getNearbyBuses(Number(req.query.lat ?? 17.385), Number(req.query.lng ?? 78.4867)) }));
  app.get("/buses/live", (_req, res) => res.json({ events: store.buses.map((bus) => ({ event: "bus.location.updated", busId: bus.id, telemetry: bus.telemetry })) }));
  app.get("/eta/:busId", (req, res) => {
    const bus = listBuses().find((entry) => entry.id === req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found." });
    return res.json({ busId: bus.id, etaMinutes: bus.route ? Math.round(bus.route.averageSegmentMinutes * 0.7) : 0 });
  });

  app.post("/tickets/quote", (req, res) => {
    try {
      return res.json(quoteFare(req.body.routeId, req.body.originStopId, req.body.destinationStopId));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to quote fare." });
    }
  });

  app.post("/tickets/purchase", async (req, res) => {
    try {
      const ticket = purchaseTicket(req.body);
      return res.status(201).json({ ticket, qrCodeDataUrl: await QRCode.toDataURL(ticket.qrToken) });
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to purchase ticket." });
    }
  });

  app.get("/tickets/:ticketId", async (req, res) => {
    const ticket = store.tickets.find((entry) => entry.ticketId === req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found." });
    return res.json({ ticket, qrCodeDataUrl: await QRCode.toDataURL(ticket.qrToken) });
  });

  app.post("/tickets/scan", (req, res) => {
    const result = validateTicketScan(req.body.ticketId, req.body.busId);
    if (!result.ok) return res.status(400).json(result);
    io?.emit("ticket.boarded", result);
    io?.emit("bus.occupancy.updated", result.occupancy);
    return res.json(result);
  });

  app.get("/occupancy/:busId", (req, res) => {
    const bus = listBuses().find((entry) => entry.id === req.params.busId);
    if (!bus) return res.status(404).json({ message: "Bus not found." });
    return res.json({ current: bus.occupancyStatus, timeline: [{ at: bus.telemetry.lastUpdated, occupancy: bus.occupancy }] });
  });

  app.post("/occupancy/update", (req, res) => {
    try {
      const status = updateSeatOccupancy(req.body.busId, Number(req.body.occupiedSeats));
      io?.emit("bus.occupancy.updated", status);
      return res.json(status);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update occupancy." });
    }
  });

  app.get("/predictions/seats", (req, res) => res.json({ predictions: getSeatPredictions(typeof req.query.routeId === "string" ? req.query.routeId : undefined) }));
  app.post("/alerts/subscribe", (req, res) => {
    const subscription = { id: `alert-${Date.now()}`, userId: req.body.userId, routeId: req.body.routeId, targetIndicator: req.body.targetIndicator };
    store.seatAlertSubscriptions.unshift(subscription);
    io?.emit("alert.triggered", subscription);
    return res.status(201).json(subscription);
  });

  app.post("/parcels/book", async (req, res) => {
    try {
      const result = createParcelBooking(req.body);
      return res.status(201).json({ ...result, qrCodeDataUrl: await QRCode.toDataURL(result.parcel.qrToken) });
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to book parcel." });
    }
  });

  app.get("/parcels", (_req, res) => res.json({ parcels: listParcels() }));
  app.get("/parcels/:parcelId", (req, res) => {
    try {
      return res.json(getParcelTracking(req.params.parcelId));
    } catch (error) {
      return res.status(404).json({ message: error instanceof Error ? error.message : "Parcel not found." });
    }
  });

  app.post("/parcels/fit", (req, res) => {
    try {
      return res.json(predictCargoFit(req.body.parcelId, req.body.busId));
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to predict cargo fit." });
    }
  });

  app.post("/parcels/scan", (req, res) => {
    try {
      const result = updateParcelScan(req.body.parcelId, req.body.busId, req.body.action);
      io?.emit(req.body.action === "loaded" ? "parcel.loaded" : "parcel.unloaded", result);
      return res.json(result);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update parcel scan." });
    }
  });

  app.post("/parcels/health", (req, res) => {
    try {
      const tracking = updateParcelHealth(req.body.parcelId, req.body.healthStatus);
      io?.emit("parcel.health.updated", tracking);
      return res.json(tracking);
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to update parcel health." });
    }
  });

  app.post("/parcels/optimize", (req, res) => {
    try {
      const { cargo, bay } = req.body as { cargo: any[]; bay: any };
      
      // Convert parcel format to cargo format for optimization
      const cargoItems = cargo.map((item: any) => ({
        id: item.id,
        length: item.dimensions?.length || item.length || 20,
        width: item.dimensions?.width || item.width || 20,
        height: item.dimensions?.height || item.height || 20,
        weightKg: item.weightKg || 5
      }));

      // Default bus luggage bay dimensions if not provided
      const busCapacity = bay || {
        length: 200,
        width: 150,
        height: 100,
        maxWeightKg: 500
      };

      const result = optimizeCargoPlacement(cargoItems, busCapacity);
      
      return res.json({
        placed: result.placed,
        unplaced: result.unplaced,
        statistics: {
          totalCargo: result.placed.length + result.unplaced.length,
          packedCargo: result.placed.length,
          unpackedCargo: result.unplaced.length,
          packingRate: ((result.placed.length / (result.placed.length + result.unplaced.length)) * 100).toFixed(1),
          volumeUtilization: (result.volumeUtilization * 100).toFixed(1),
          weightUtilization: (result.weightUtilization * 100).toFixed(1),
          totalWeight: result.totalWeight.toFixed(1),
          efficiency: ((result.volumeUtilization * 0.7 + result.weightUtilization * 0.3) * 100).toFixed(1)
        }
      });
    } catch (error) {
      return res.status(400).json({ message: error instanceof Error ? error.message : "Unable to optimize cargo placement." });
    }
  });

  app.get("/dashboard/admin", (_req, res) => res.json(getAdminDashboard()));
  app.get("/notifications/:userId", (req, res) => res.json({ notifications: listNotifications(req.params.userId) }));
  return app;
}
