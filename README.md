<div align="center">

# FORGE

### An open-source, AI-powered body recomposition tracker

Log daily check-ins, set goals, build a progress-photo timeline, and generate
evidence-based training plans with AI — synced to the cloud, usable on any device.

[**Live Demo**](https://shivamongit.github.io/body-transformation-tracker/) ·
[Report Bug](https://github.com/shivamongit/body-transformation-tracker/issues) ·
[Request Feature](https://github.com/shivamongit/body-transformation-tracker/issues)

![License](https://img.shields.io/badge/license-MIT-22c55e)
![React](https://img.shields.io/badge/React-18-149eca)
![Vite](https://img.shields.io/badge/Vite-5-646cff)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38bdf8)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ecf8e)

</div>

---

## Overview

FORGE is a single-page web app for tracking a body transformation end to end —
daily metrics, habits, goals, progress photos, and AI-generated training plans.
It ships with a polished **"Elite Performance"** dark design system, a Supabase
backend (Postgres + Auth + Storage), and zero-config guest mode so it runs the
moment you open it.

## Features

- **Dashboard** — daily check-in (weight, waist, workout, habit toggles, notes), live KPIs with trend chips, a gradient weight-trend chart, and a workout streak counter.
- **Goals** — target weight / waist / body-fat / habit goals with deadlines, animated progress rings, and active vs. completed sections.
- **Progress Photos** — upload by pose & date into a filterable masonry gallery (Supabase Storage).
- **AI Plan Generator** — produces a personalized training plan via OpenAI, tuned to your goal, split, equipment and weak points. The API key stays **server-side** in a Supabase Edge Function and is never exposed to the browser.
- **Program** — analysis, priority ranking, multi-phase roadmap, day-by-day workout, and diet reference.
- **Guest mode** — no login screen; an anonymous Supabase session is created automatically and data syncs to the cloud.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite 5 (code-split, lazy-loaded routes) |
| Styling | Tailwind CSS — custom FORGE design system |
| Charts | Recharts (lazy-loaded) |
| Icons | Lucide |
| Backend / DB / Auth / Storage | Supabase (Postgres + Row Level Security) |
| AI | OpenAI, via a Supabase Edge Function |
| Hosting | GitHub Pages &middot; Render (both supported) |

## Quick Start

```bash
git clone https://github.com/shivamongit/body-transformation-tracker.git
cd body-transformation-tracker
npm install
npm run dev      # http://localhost:5173
```

```bash
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

### Configuration

Copy `.env.example` to `.env` and add your Supabase project values:

```bash
cp .env.example .env
```

```ini
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-or-publishable-key
```

The anon key is safe to expose in the browser — all access is gated by Row
Level Security (see [`schema.sql`](./schema.sql)).

---

## Backend Setup (Supabase)

1. **Database** — open **SQL Editor → New query**, paste [`schema.sql`](./schema.sql), and **Run**. This creates the `daily_logs`, `goals`, `photos`, and `ai_plans` tables with row-level security, plus the `progress-photos` storage bucket and its policies.
2. **Guest login** — go to **Authentication → Providers** and enable **Anonymous sign-ins**.
3. **Storage** — the schema creates the public `progress-photos` bucket automatically. (If your project blocks bucket creation via SQL, create it manually as a **public** bucket of the same name.)

---

## AI Setup (secure OpenAI key)

The OpenAI key is **never** in the frontend. It lives in a Supabase Edge Function.

```bash
# one-time
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# set the secret key (server-side only)
supabase secrets set OPENAI_API_KEY=sk-your-key

# deploy the function
supabase functions deploy generate-plan
```

The app calls it through `supabase.functions.invoke("generate-plan")`.
Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`).

---

## Deployment

### GitHub Pages (automated)

A workflow at [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml)
builds and deploys on every push to `main`. One-time setup:

1. **Settings → Pages → Build and deployment → Source:** select **GitHub Actions**.
2. Push to `main` (or run the workflow manually from the **Actions** tab).

The site publishes to `https://<user>.github.io/body-transformation-tracker/`.
The Vite `base` path is applied only for Pages builds (via the `GITHUB_PAGES`
flag), so local dev and Render stay at the root.

### Render (Blueprint)

The repo includes [`render.yaml`](./render.yaml):

1. On **render.com** → **New → Blueprint**, connect the repo, then **Apply**.
2. Or **New → Static Site** with build `npm ci && npm run build`, publish `dist`,
   and an SPA rewrite `/*` → `/index.html`.

---

## Project Structure

```
.github/workflows/deploy.yml   # CI: build + deploy to GitHub Pages
private/                       # personal reference photos (gitignored)
supabase/functions/            # OpenAI edge function (server-side key)
schema.sql                     # database + storage setup (run in Supabase)
src/
  App.jsx                      # app shell: sidebar, header, routing
  lib/
    supabase.js                # client + anonymous guest session
    db.js                      # data access (logs, goals, photos, plans)
  data/plan.js                 # program/analysis reference content
  components/
    Dashboard.jsx              # KPIs, daily check-in, weight chart, history
    Goals.jsx                  # goals with progress rings
    Photos.jsx                 # progress-photo upload + masonry gallery
    AIPlans.jsx                # AI plan generator + saved plans
    PlanContent.jsx            # analysis / roadmap / workout / diet
    ui.jsx                     # shared UI primitives
```

## Performance

- **Route-level code splitting** — each screen is `React.lazy`-loaded behind `<Suspense>`.
- **Vendor chunking** — React, Recharts, Supabase and icons are split into cacheable chunks; the initial JS payload is ~13 KB (gzip ~5 KB), with charts loaded only when the Dashboard opens.
- **Lazy images** and a static, dependency-light design system.

## Privacy

Personal body photos are **never committed**. They live in the gitignored
`private/` folder and are loaded optionally at build time — drop your own
`front.jpg`, `side-left.jpg`, `side-right.jpg`, `back-raised.jpg`, and
`back-relaxed.jpg` there to populate the Program analysis. Without them, the app
shows neutral placeholders. Photos uploaded via the **Photos** tab are stored in
your own Supabase Storage bucket, scoped to your session by Row Level Security.

## Contributing

Contributions are welcome. Please open an issue to discuss substantial changes
first, then submit a pull request from a feature branch. Keep changes focused
and match the existing code style.

## Troubleshooting

- **"Connection error" on load** → enable **Anonymous sign-ins** in Supabase Auth.
- **Logs/goals don't save** → run [`schema.sql`](./schema.sql) in the Supabase SQL editor.
- **Photo upload fails** → ensure the public `progress-photos` bucket and storage policies exist (created by `schema.sql`).
- **AI generation fails** → deploy the `generate-plan` function and set `OPENAI_API_KEY` (see AI Setup above).

## License

[MIT](./LICENSE) © 2026 Shivam ([@shivamongit](https://github.com/shivamongit))
