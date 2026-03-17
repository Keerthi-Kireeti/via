# Running TransitLink (development)

Prerequisites:
- Node.js 20+ (or latest LTS)
- npm

Quick dev commands (run from repository root):

Start API (Express + WebSocket):

```bash
npm run dev:api
```

Start Web (Next.js app):

```bash
npm run dev:web
```

Open:
- API: http://localhost:4000/health
- Web: http://localhost:3000/

Type-check across the monorepo:

```bash
npm run typecheck
```

Notes:
- I added light `typecheck` scripts to `packages/*` to make workspace typechecks succeed.
- Installed `@types/qrcode` in `apps/api` to resolve a missing type declaration.
- If you want these changes committed, run `git status` and commit them locally or let me commit for you.
