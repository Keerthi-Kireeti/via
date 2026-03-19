const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ApiResponse<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("transitlink-token");
}

function getAuthHeader(): HeadersInit {
  const token = getToken();
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` })
  };
}

// Auth endpoints
export async function login(email: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ email })
  });
  if (!res.ok) throw new Error("Login failed");
  return res.json();
}

export async function signup(name: string, email: string, role: string, city: string) {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ name, email, role, city })
  });
  if (!res.ok) throw new Error("Signup failed");
  return res.json();
}

export async function getProfile(userId: string) {
  const res = await fetch(`${API_BASE}/auth/profile/${userId}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error("Failed to fetch profile");
  return res.json();
}

// Route and bus endpoints
export async function getRoutes() {
  const res = await fetch(`${API_BASE}/routes`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch routes");
  return res.json();
}

export async function getBuses() {
  const res = await fetch(`${API_BASE}/buses`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch buses");
  return res.json();
}

export async function getNearbyBuses(lat: number, lng: number) {
  const res = await fetch(`${API_BASE}/buses/nearby?lat=${lat}&lng=${lng}`, {
    headers: getAuthHeader()
  });
  if (!res.ok) throw new Error("Failed to fetch nearby buses");
  return res.json();
}

export async function getEta(busId: string) {
  const res = await fetch(`${API_BASE}/eta/${busId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch ETA");
  return res.json();
}

// Ticket endpoints
export async function quoteFare(routeId: string, originStopId: string, destinationStopId: string) {
  const res = await fetch(`${API_BASE}/tickets/quote`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ routeId, originStopId, destinationStopId })
  });
  if (!res.ok) throw new Error("Failed to quote fare");
  return res.json();
}

export async function purchaseTicket(
  passengerId: string,
  routeId: string,
  originStopId: string,
  destinationStopId: string
) {
  const res = await fetch(`${API_BASE}/tickets/purchase`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ passengerId, routeId, originStopId, destinationStopId })
  });
  if (!res.ok) throw new Error("Failed to purchase ticket");
  return res.json();
}

export async function getTicket(ticketId: string) {
  const res = await fetch(`${API_BASE}/tickets/${ticketId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch ticket");
  return res.json();
}

export async function validateTicketScan(ticketId: string, busId: string) {
  const res = await fetch(`${API_BASE}/tickets/scan`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ ticketId, busId })
  });
  return res.json();
}

// Occupancy endpoints
export async function getOccupancy(busId: string) {
  const res = await fetch(`${API_BASE}/occupancy/${busId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch occupancy");
  return res.json();
}

export async function updateOccupancy(busId: string, occupiedSeats: number) {
  const res = await fetch(`${API_BASE}/occupancy/update`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ busId, occupiedSeats })
  });
  if (!res.ok) throw new Error("Failed to update occupancy");
  return res.json();
}

// Predictions and alerts
export async function getSeatPredictions(routeId?: string) {
  const url = new URL(`${API_BASE}/predictions/seats`);
  if (routeId) url.searchParams.append("routeId", routeId);
  const res = await fetch(url.toString(), { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch predictions");
  return res.json();
}

export async function subscribeSeatAlert(userId: string, routeId: string, targetIndicator: string) {
  const res = await fetch(`${API_BASE}/alerts/subscribe`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ userId, routeId, targetIndicator })
  });
  if (!res.ok) throw new Error("Failed to subscribe to alert");
  return res.json();
}

// Parcel endpoints
export async function bookParcel(
  senderId: string,
  fromCity: string,
  destinationCity: string,
  dimensions: { length: number; width: number; height: number },
  weightKg: number
) {
  const res = await fetch(`${API_BASE}/parcels/book`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ senderId, fromCity, destinationCity, dimensions, weightKg })
  });
  if (!res.ok) throw new Error("Failed to book parcel");
  return res.json();
}

export async function getParcels() {
  const res = await fetch(`${API_BASE}/parcels`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch parcels");
  return res.json();
}

export async function getParcelTracking(parcelId: string) {
  const res = await fetch(`${API_BASE}/parcels/${parcelId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch parcel tracking");
  return res.json();
}

export async function predictCargoFit(parcelId: string, busId: string) {
  const res = await fetch(`${API_BASE}/parcels/fit`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ parcelId, busId })
  });
  if (!res.ok) throw new Error("Failed to predict cargo fit");
  return res.json();
}

export async function scanParcel(parcelId: string, busId: string, action: "loaded" | "unloaded") {
  const res = await fetch(`${API_BASE}/parcels/scan`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ parcelId, busId, action })
  });
  if (!res.ok) throw new Error("Failed to scan parcel");
  return res.json();
}

export async function updateParcelHealth(parcelId: string, healthStatus: string) {
  const res = await fetch(`${API_BASE}/parcels/health`, {
    method: "POST",
    headers: getAuthHeader(),
    body: JSON.stringify({ parcelId, healthStatus })
  });
  if (!res.ok) throw new Error("Failed to update parcel health");
  return res.json();
}

// Admin endpoints
export async function getAdminDashboard() {
  const res = await fetch(`${API_BASE}/dashboard/admin`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch admin dashboard");
  return res.json();
}

// Notifications
export async function getNotifications(userId: string) {
  const res = await fetch(`${API_BASE}/notifications/${userId}`, { headers: getAuthHeader() });
  if (!res.ok) throw new Error("Failed to fetch notifications");
  return res.json();
}
