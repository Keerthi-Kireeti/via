# TransitLink

TransitLink is a smart public transport and parcel logistics MVP built as a monorepo with:

- `apps/web`: Next.js role-based frontend
- `apps/api`: Express + WebSocket backend
- `packages/types`: shared contracts and domain types
- `packages/ui`: shared React UI primitives
- `packages/config`: shared configuration helpers
- `infra/db`: Prisma schema and local Postgres compose
- `docs`: architecture and API notes

## Quick start

1. Install dependencies with `npm install`
2. Start the API with `npm run dev:api`
3. Start the web app with `npm run dev:web`

Environment examples are included in each app package.
