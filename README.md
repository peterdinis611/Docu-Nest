# DocuNest Frontend

Next.js application for DocuNest — AI-powered document notebooks.

## Getting Started

Install dependencies:

```bash
npm install
```

Copy environment variables and add your Clerk keys from [dashboard.clerk.com](https://dashboard.clerk.com):

```bash
cp .env.example .env.local
```

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database (Drizzle + SQLite)

Initialize the local SQLite database:

```bash
mkdir -p data
npm run db:generate   # create migrations from schema
npm run db:migrate    # apply migrations
npm run db:seed       # seed with mock data
```

Other database commands:

- `npm run db:push` — push schema directly (dev shortcut)
- `npm run db:studio` — open Drizzle Studio

Database files live in `data/` (gitignored). Set `DATABASE_URL` in `.env.local` (default: `file:./data/sqlite.db`).

Schema: `src/db/schema.ts` · Client: `src/db/index.ts` · Queries: `src/db/queries.ts`

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint
- `npm run db:generate` — generate SQL migrations
- `npm run db:migrate` — run migrations
- `npm run db:seed` — seed development data
- `npm run cypress:open` — open Cypress (dev server must be running)
- `npm run cypress:run` — run Cypress headless (dev server must be running)
- `npm run test:e2e` — start dev server and run Cypress tests
- `npm run test:e2e:open` — start dev server and open Cypress UI

## E2E Tests (Cypress)

Tests live in `cypress/e2e/`. The landing page test runs without credentials. Authenticated tests use [@clerk/testing](https://clerk.com/docs/guides/development/testing/cypress/overview) and require a Clerk test user with password sign-in enabled.

Add to `.env.local`:

```bash
CYPRESS_TEST_EMAIL=your-test-user@example.com
CYPRESS_TEST_PASSWORD=your-test-password
```

Run the full suite:

```bash
npm run test:e2e
```

Or start the dev server separately, then:

```bash
npm run cypress:open
```

## Project Structure

- `src/app/` — Next.js App Router routes and layouts
- `src/views/` — page-level view components
- `src/components/` — shared UI and layout components
- `src/db/` — Drizzle schema, client, queries, seed
- `src/hooks/` — React hooks
- `src/lib/` — utilities and search index
- `src/machines/` — XState state machines
- `src/actors/` — XState actors
- `cypress/` — Cypress E2E tests and support files

## Routes

| Route | Description |
|-------|-------------|
| `/` | Clerk sign-in |
| `/app` | Home dashboard |
| `/app/library` | Document library |
| `/app/analytics` | Usage analytics |
| `/app/settings` | Settings |
| `/notebook/[notebookId]` | Notebook workspace |
