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

## Scripts

- `npm run dev` — start the development server
- `npm run build` — create a production build
- `npm run start` — serve the production build
- `npm run lint` — run ESLint

## Project Structure

- `src/app/` — Next.js App Router routes and layouts
- `src/views/` — page-level view components
- `src/components/` — shared UI and layout components
- `src/hooks/` — React hooks
- `src/lib/` — utilities and search index
- `src/machines/` — XState state machines
- `src/actors/` — XState actors

## Routes

| Route | Description |
|-------|-------------|
| `/` | Clerk sign-in |
| `/app` | Home dashboard |
| `/app/library` | Document library |
| `/app/analytics` | Usage analytics |
| `/app/settings` | Settings |
| `/notebook/[notebookId]` | Notebook workspace |
