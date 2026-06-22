<div align="center">

# 🔥 FORGE — My Body Transformation Tracker

**A modern, AI-powered fitness web app I built to track my own 4-month body recomposition.**

Log daily weight & workouts · set goals · upload progress photos · generate
new training plans with AI — all synced to the cloud and usable from any device.

`React` · `Vite` · `Tailwind CSS` · `Supabase` · `OpenAI` · `Recharts`

</div>

---

## ✨ Features

- **Dashboard** — daily check-in (weight, waist, workout, 6 habit toggles, notes), live stats, weight-trend chart, and a workout streak counter.
- **Goals** — set target weight / waist / body-fat / habit goals with deadlines and tick them off.
- **Progress Photos** — upload photos by pose & date to build a visual timeline (Supabase Storage).
- **AI Plan Generator** — generates a personalized, evidence-based training plan via OpenAI, tuned to my goal, split, equipment and weak points. The API key stays server-side in a Supabase Edge Function (never exposed to the browser).
- **My Program** — the full photo analysis, priority ranking, 4-month roadmap, day-by-day workout, and diet plan.
- **Guest mode** — no login screen. An anonymous Supabase session is created automatically, and data syncs via the cloud.

---

## 🧱 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS (custom glassmorphism design system) |
| Charts | Recharts |
| Icons | Lucide |
| Backend / DB / Auth / Storage | Supabase |
| AI | OpenAI (via Supabase Edge Function) |
| Hosting | Render |

---

## 🚀 Run Locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

Supabase keys are read from `import.meta.env.VITE_SUPABASE_*` with safe public
fallbacks baked in, so it runs out of the box. To override, copy `.env.example`
to `.env`.

---

## ⚙️ Backend Setup (Supabase)

1. **Database** — open **SQL Editor → New query**, paste [`schema.sql`](./schema.sql), and **Run**. This creates the `daily_logs`, `goals`, `photos`, and `ai_plans` tables with row-level security, plus the `progress-photos` storage bucket and its policies.
2. **Guest login** — go to **Authentication → Providers** and enable **Anonymous sign-ins**.
3. **Storage** — the schema creates the public `progress-photos` bucket automatically. (If your project blocks bucket creation via SQL, create it manually as a **public** bucket of the same name.)

---

## 🤖 AI Setup (secure OpenAI key)

The OpenAI key is **never** in the frontend. It lives in a Supabase Edge Function.

```bash
# one-time
npm i -g supabase
supabase login
supabase link --project-ref tipfzlfrbpeybvupqebn

# set the secret key (server-side only)
supabase secrets set OPENAI_API_KEY=sk-your-key

# deploy the function
supabase functions deploy generate-plan
```

The app calls it through `supabase.functions.invoke("generate-plan")`.
Optionally set `OPENAI_MODEL` (defaults to `gpt-4o-mini`).

---

## ☁️ Deploy to Render

The repo includes [`render.yaml`](./render.yaml) so Render auto-configures it.

1. Push to GitHub, then on **render.com** → **New → Static Site** and connect the repo.
2. Render reads `render.yaml`. If asked manually:
   - **Build Command:** `npm ci && npm run build`
   - **Publish Directory:** `dist`
3. **Create Static Site.** Every push to `main` auto-deploys.

> Tip: open the Render URL on your phone and **Add to Home Screen** for an app-like icon.

---

## 📁 Project Structure

```
src/
  App.jsx                # layout + sidebar navigation
  lib/
    supabase.js          # client + anonymous guest session
    db.js                # data access (logs, goals, photos, plans)
  data/plan.js           # my analysis, roadmap, workout & diet content
  components/
    Dashboard.jsx        # daily check-in, stats, weight chart, history
    Goals.jsx            # goals CRUD
    Photos.jsx           # progress photo upload + gallery
    AIPlans.jsx          # AI plan generator + saved plans
    PlanContent.jsx      # analysis / roadmap / workout / diet
    ui.jsx               # shared UI primitives
supabase/functions/generate-plan/  # OpenAI edge function
schema.sql               # database + storage setup
```

---

## 🩺 Troubleshooting

- **"Connection error" on load** → enable **Anonymous sign-ins** in Supabase Auth.
- **Logs/goals don't save** → run `schema.sql`.
- **Photo upload fails** → ensure the public `progress-photos` bucket + storage policies exist (in `schema.sql`).
- **AI generation fails** → deploy the `generate-plan` function and set `OPENAI_API_KEY`.
