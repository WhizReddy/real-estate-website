# Real Estate Website

Production-ready Next.js 15 (App Router) project with React 19, TypeScript, Prisma, and Leaflet (client-only). Build is configured to avoid SSR pitfalls and validate environment variables.

## Quick start

- Install deps: `npm install`
- Dev server: `npm run dev`
- Type check: `npm run type-check`
- Lint: `npm run lint`
- Build (prod polyfills enabled): `npm run build`

Open http://localhost:3000 to view.

## Environment variables

These are validated at build and runtime. Create a `.env.local` with at least the following keys. For local development you can use dummy values, but provide real ones in staging/production.

Required keys:
- DATABASE_URL
- NEXTAUTH_URL
- NEXTAUTH_SECRET
- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- BLOB_READ_WRITE_TOKEN
- GOOGLE_MAPS_API_KEY
- NODE_ENV
- PORT
- ENABLE_ANALYTICS
- ENABLE_PERFORMANCE_MONITORING
- ALLOWED_ORIGINS

Example `.env.local` (development-safe):

```
DATABASE_URL="postgres://user:pass@localhost:5432/realestate"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="dev-secret"
SMTP_HOST="smtp.example.com"
SMTP_PORT="587"
SMTP_USER="user"
SMTP_PASS="pass"
BLOB_READ_WRITE_TOKEN="dev-blob-token"
GOOGLE_MAPS_API_KEY="dev-gmaps-key"
NODE_ENV="development"
PORT="3000"
ENABLE_ANALYTICS="false"
ENABLE_PERFORMANCE_MONITORING="false"
ALLOWED_ORIGINS="http://localhost:3000"
```

## Leaflet and SSR

Leaflet is not SSR-safe. All map components are dynamically imported with `ssr: false` and Leaflet CSS is loaded client-side. The production build preloads a minimal server polyfill to avoid “self is not defined” during static generation.

## Testing

- Unit/integration: `npm test`
- Comprehensive runner: `npm run test:comprehensive`

## Notes

- ESLint is configured with flat config. Test files have relaxed rules to cut noise.
- If you change SSR behavior around maps, keep Leaflet out of the server bundle and avoid DOM access on the server.
