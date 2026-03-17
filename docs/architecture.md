# TransitLink architecture

## Monorepo layout
- `apps/web`: Next.js passenger, conductor, admin, and logistics UI
- `apps/api`: Express API with WebSocket event emission and seed-backed domain logic
- `packages/types`: shared contracts for routes, buses, tickets, parcels, analytics
- `packages/ui`: shared card, pill, layout, and section primitives
- `infra/db`: Prisma schema and Docker compose for Postgres

## Realtime model
- API emits `bus.location.updated`, `bus.occupancy.updated`, `ticket.boarded`, `parcel.loaded`, `parcel.unloaded`, `parcel.health.updated`, and `alert.triggered`.
- MVP currently simulates realtime from in-memory seed updates.

## Route-lineage ticket rule
- Ticket stores one lineage id and a segment range from origin to destination.
- Any conductor scan is valid only if the scanned bus belongs to the same lineage and has not passed the passenger destination stop.

## AI simulation
- Seat prediction uses seeded demand forecasts per route and stop time window.
- Cargo fit uses remaining luggage volume versus parcel volume as a deterministic fit score.
