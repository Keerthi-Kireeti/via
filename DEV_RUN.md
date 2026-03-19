# TransitLink MVP - Quick Start & Implementation Guide

## Quick Dev Start (60 seconds)

Prerequisites: Node.js 18+, npm

```bash
# Install dependencies
npm install

# Terminal 1: Start API (Express + WebSocket server)
npm run dev:api
# → http://localhost:4000/health

# Terminal 2: Start Web (Next.js frontend)
npm run dev:web
# → http://localhost:3000
```

**Demo Login Accounts** (use any email below to login):
- Passenger: `neha@transitlink.app` → redirects to `/passenger`
- Conductor: `ramesh@transitlink.app` → redirects to `/conductor`
- Admin: `asha@transitlink.app` → redirects to `/admin`
- Logistics: `parcel1@transitlink.app` → redirects to `/logistics`

## Project Structure

### `/apps/api` - Express Backend
- **server.ts**: HTTP & Socket.io initialization
- **app.ts**: 58 REST endpoints + CORS + JWT middleware
- **domain.ts**: 90+ business logic functions (ticket validation, cargo fit, occupancy)
- **seed.ts**: Mock data (10 buses, 20 stops, 19 users, 10 parcels)

**Key Endpoints:**
- `POST /auth/login` - Email-based demo login
- `POST /tickets/purchase` - Buy digital ticket
- `POST /tickets/scan` - Conductor scan validation
- `POST /parcels/book` - Logistics shipment booking
- `POST /parcels/scan` - Load/unload tracking
- `GET /dashboard/admin` - KPI dashboard

### `/apps/web` - Next.js Frontend (App Router + Tailwind + Framer Motion)
- **app/page.tsx**: Landing page with feature overview
- **app/(auth)/login**: Demo login (no password, email-based)
- **app/passenger/**: Dashboard, search, booking, tickets, tracking
- **app/conductor/**: Fast QR scan workflow for tickets & parcels
- **app/admin/**: Dashboard with KPIs, congestion heatmap, operations
- **app/logistics/**: Parcel booking & shipment tracking
- **lib/api.ts**: Client-side API wrapper (all 30+ endpoints)
- **lib/demo-data.ts**: Frontend demo data for fallback

### `/packages/ui` - Shared Component Library
- Layout: `Panel`, `SectionHeading`, `AppShell`
- Data Display: `StatusPill`, `Table`, `Badge`, `StatCard`
- Cards: `BusCard`, `TicketCard`, `ParcelCard`
- Forms: `Button`, `Input`

### `/packages/types` - Shared TypeScript Interfaces
- User roles (passenger, conductor, admin, logistics_user)
- Domain models (Ticket, Parcel, Bus, Route, etc.)
- API response shapes

### `/infra/db` - Database (Prisma + PostgreSQL)
- **schema.prisma**: 15+ models (User, Bus, Ticket, Parcel, Boarding, etc.)
- **docker-compose.yml**: Local PostgreSQL dev setup

## MVP Feature Checklist

### ✅ Ticketing System
- [x] Route-lineage tickets (1 ticket, multiple buses on same lineage)
- [x] Fare quoting by stop segments
- [x] Digital ticket purchase & QR generation
- [x] Conductor scan validation (lineage, stop, expiry checks)
- [x] Boarding event tracking

### ✅ Seat Intelligence
- [x] Live occupancy snapshots (occupied/total)
- [x] 3-tier seat indicators (green <60%, yellow 60-85%, red >85%)
- [x] ETA calculation from current stop + remaining segments
- [x] Seat availability predictions (ML-simulated with confidence)
- [x] Occupancy-triggered alerts

### ✅ Parcel Logistics
- [x] Parcel booking (dimensions, weight)
- [x] Cargo fit prediction (3D bin packing simulation)
- [x] QR generation for each parcel
- [x] Load/unload scan transitions
- [x] Parcel tracking (current bus, city, ETA, health)
- [x] Health status monitoring (stable, temp_warning, shock_warning)

### ✅ Auth & Role Management
- [x] Email-based demo login (JWT tokens)
- [x] Role-aware redirects
- [x] Profile endpoints

### ✅ Admin Analytics
- [x] Dashboard KPIs (buses, trips, revenue, tickets, parcels)
- [x] Congestion watchlist (top occupied routes)
- [x] Revenue aggregation (ticket + parcel by route)
- [x] Conductor activity tracking

### ✅ Infrastructure
- [x] Express API with CORS
- [x] WebSocket server (Socket.io ready)
- [x] Prisma ORM + PostgreSQL schema
- [x] Monorepo with workspaces
- [x] Shared types & UI components
- [x] Dark mode with Tailwind

### 🔲 To Complete (Post-MVP)
- [ ] WebSocket realtime event broadcasting
- [ ] Mapbox integration for bus tracking/maps
- [ ] QR scanning device camera integration
- [ ] Push notifications
- [ ] Payment gateway (Stripe/Razorpay)
- [ ] Database persistence (currently in-memory seed)
- [ ] Comprehensive test suite

## Domain Rules Implemented

### Route-Lineage Ticket Validation
```typescript
// Passenger can board if:
✓ Ticket is active (not expired)
✓ Bus belongs to same lineage
✓ Current stop is NOT beyond destination
✗ Cannot board after destination segment
✗ Expiry checks on validate
```

### Seat Availability Indicator
```
occupied / total < 60%  → Green  (available)
60% to 85%             → Yellow (filling)
> 85%                  → Red    (nearly full)
```

### ETA Calculation
```
remaining_segments = total_stops - current_stop_index - 1
eta_minutes = remaining_segments * avg_segment_minutes * 0.7
```

### Cargo Fit Prediction
```
parcel_volume = (length × width × height) / 1000
available_volume = bus_capacity - used_volume

fits = parcel_volume ≤ available_volume 
    AND weight ≤ 20kg
    
score = min(1.0, available_volume / max(parcel_volume, 0.001))
```

## Seed Data Summary

**Users**: 19 total (1 admin, 3 conductors, 10 passengers, 5 logistics)  
**Buses**: 10 active across 5 routes  
**Routes**: 5 routes across 4 route lineages  
**Stops**: 20+ stops spanning cities  
**Tickets**: 2 sample (1 active route-lineage ticket for transfers)  
**Parcels**: 10 with mixed statuses (booked, loaded, in_transit, delivered)  
**Capacity**: 36-48 seats per bus, 160-240L luggage  

## Testing Key Flows

### Passenger: Book & Travel
1. Login with `neha@transitlink.app`
2. Go to `/passenger` → search buses
3. Click search → `/passenger/search` (form with fare quote)
4. Purchase ticket → get QR code
5. Go to `/passenger/tickets` to view active digital ticket

### Conductor: Fast Scan Workflow
1. Login with `ramesh@transitlink.app`
2. Go to `/conductor` → shows quick scan panel
3. Paste ticket ID or parcel ID
4. Click "Confirm boarding" (validates & updates occupancy)
5. See realtime status updates

### Admin: Monitor Network
1. Login with `asha@transitlink.app`
2. Go to `/admin` → KPI dashboard
3. View congestion heatmap, route watchlist
4. See conductor activity, revenue breakdown

### Logistics: Ship Parcel
1. Login with `parcel1@transitlink.app`
2. Go to `/logistics` → parcel booking form
3. Fill origin, destination, dimensions
4. Get cargo fit score & book
5. Go to `/logistics/tracking` to monitor

## API Debugging

### Health check
```bash
curl http://localhost:4000/health
```

### Demo login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"neha@transitlink.app"}'
# Returns: {token, user, redirectTo}
```

### Get nearby buses
```bash
curl "http://localhost:4000/buses/nearby?lat=17.384&lng=78.4867"
```

### Purchase ticket
```bash
curl -X POST http://localhost:4000/tickets/purchase \
  -H "Content-Type: application/json" \
  -d '{
    "passengerId":"usr-pass-1",
    "routeId":"rt-100",
    "originStopId":"st-hyd",
    "destinationStopId":"st-gnt"
  }'
```

## Type-checking

```bash
npm run typecheck   # Check all packages
npm run build       # Full build
npm run lint        # Linting
```

## Key Files

- **Business Logic**: `apps/api/src/domain.ts` (90+ functions)
- **API Routes**: `apps/api/src/app.ts` (58 endpoints)
- **Data Model**: `infra/db/prisma/schema.prisma`
- **UI Components**: `packages/ui/src/index.tsx`
- **Shared Types**: `packages/types/src/index.ts`
- **API Client**: `apps/web/lib/api.ts`
- **Demo Data**: `apps/web/lib/demo-data.ts`

## Environment Setup (Optional)

Create `.env.local` in `apps/api` and `apps/web`:

**apps/api/.env.local**
```
DATABASE_URL=postgresql://postgres:password@localhost:5432/transitlink
JWT_SECRET=demo-secret-key
PORT=4000
CLIENT_URL=http://localhost:3000
```

**apps/web/.env.local**
```
NEXT_PUBLIC_API_URL=http://localhost:4000
```

## Next Production Steps

1. **Replace in-memory store** with Prisma database client
2. **WebSocket realtime** - connect Socket.io to domain events
3. **Mapbox maps** - integrate for vehicle tracking  
4. **QR scanning** - add camera libraries (QuaggaJS)
5. **Notifications** - push alerts for occupancy & parcels
6. **Docker deployment** - containerize API & web
7. **CI/CD pipeline** - automated testing & deployment
