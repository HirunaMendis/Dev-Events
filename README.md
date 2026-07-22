# DevEvent

A directory site for discovering tech conferences, meetups, and hackathons — built with Next.js 16 (App Router), MongoDB/Mongoose, and a Gemini-powered chatbot for asking questions about the event catalog.

## Features

- **Event listing & detail pages** — browse and search upcoming tech events with dates, locations, agendas, and tags.
- **Admin dashboard** (`/admin`) — credential-based login (Auth.js) to create, view, and delete events.
- **Image uploads** — event banners upload to Vercel Blob storage.
- **Event chatbot** — a floating assistant (Google Gemini + function calling) that answers questions about the event catalog using live data, not hallucinated details.
- **Offline-friendly fallback** — if MongoDB Atlas is unreachable, reads fall back to a local seed catalog and writes fall back to local JSON files, so the site and admin dashboard keep working during local development.

## Getting Started

Install dependencies and run the dev server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

Copy the variables below into a `.env` file at the project root:

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas (or any MongoDB) connection string. |
| `MONGODB_DB` | Yes | Database name, e.g. `dev-events`. |
| `USE_SEED_EVENTS` | No | Set to `true` to skip MongoDB entirely and run on local seed data only. Default `false`. |
| `AUTH_SECRET` | Yes | Session secret for Auth.js. Generate with `npx auth secret`. |
| `ADMIN_USERNAME` / `ADMIN_PASSWORD` | Yes | Credentials for the `/admin` dashboard login. |
| `GEMINI_API_KEY` | No | Google Gemini API key (free tier: [aistudio.google.com/apikey](https://aistudio.google.com/apikey)). Without it, the chat widget shows "Chat is not configured." |
| `BLOB_READ_WRITE_TOKEN` | No (local) / Yes (prod) | Vercel Blob token for event image uploads. Auto-injected when a Blob store is connected to a Vercel project; needed locally only if you want uploads to work outside of Vercel. |

If `MONGODB_URI` is unreachable, the app automatically falls back to the local seed catalog (`data/events.json`) for reads, and to local JSON files (`data/events.json`, `data/bookings.json`) for writes made through the admin dashboard — so local development works without a live database.

### Seeding MongoDB

Once `MONGODB_URI` is set and reachable, load the seed catalog into MongoDB:

```bash
npm run seed
```

### Checking the database connection

```bash
npm run check-db
```

Prints a clear diagnostic if Atlas is unreachable (e.g. an IP not yet whitelisted in Atlas Network Access).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server (Turbopack). |
| `npm run build` | Production build. |
| `npm run start` | Run the production build. |
| `npm run lint` | Run ESLint. |
| `npm run seed` | Seed MongoDB with the catalog in `data/events.json`. |
| `npm run check-db` | Test the MongoDB Atlas connection. |

## Project Structure

```
app/
  admin/            Admin dashboard (event management)
  api/
    admin/events/    Create/delete events (auth-gated)
    admin/uploads/   Event image uploads (Vercel Blob)
    auth/            Auth.js route handler
    bookings/        Event signup/booking
    chat/            Gemini-powered chatbot endpoint
    events/          Public event data
  events/[slug]/     Public event detail page
  login/             Admin login page
components/          UI components (Navbar, ChatWidget, EventCard, admin forms, ...)
database/            Mongoose models (Event, Booking)
lib/                 Data access (events, bookings, MongoDB connection, local fallbacks)
data/                Seed catalog + local fallback storage for bookings/events
scripts/             seed-events.mjs, check-db.mjs
proxy.ts             Route protection for /admin and /login (Next.js 16 proxy convention)
```

## Deploying to Vercel

1. Whitelist `0.0.0.0/0` (or Vercel's IPs) in MongoDB Atlas → Network Access, since Vercel functions don't have a fixed outbound IP.
2. In the Vercel project, add a **Blob** store under Storage and connect it — this injects `BLOB_READ_WRITE_TOKEN` automatically.
3. Set all required environment variables (see table above) in Vercel → Settings → Environment Variables.
4. Import the repository at [vercel.com/new](https://vercel.com/new) and deploy — no custom build configuration needed.

After deploying, verify: admin login works, creating an event with an uploaded image works end-to-end, and the chat widget answers a question about the event catalog.

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack)
- [MongoDB](https://www.mongodb.com/) / [Mongoose](https://mongoosejs.com/)
- [Auth.js](https://authjs.dev/) (credentials provider)
- [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) for image storage
- [Google Gemini API](https://ai.google.dev/) for the event chatbot
- [Tailwind CSS](https://tailwindcss.com/)
