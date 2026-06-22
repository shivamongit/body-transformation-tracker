# Body Transformation Tracker

A 4-month body transformation roadmap with a built-in daily logging dashboard:
login, log your weight + workout check-ins, see your weight-trend chart, and a
workout streak — all synced across every device via Supabase.

The app is a static site (HTML + JS + CDN libraries). No build step.

---

## 1. Set up Supabase (the database + login) — ~3 min

1. Go to <https://supabase.com> and create a free account + new project.
2. Wait for the project to finish provisioning.
3. In the project, open **SQL Editor → New query**, paste the contents of
   [`schema.sql`](./schema.sql), and click **Run**. This creates the
   `daily_logs` table and security rules.
4. Open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key
5. Open [`config.js`](./config.js) and paste both values:
   ```js
   window.SUPABASE_URL = "https://xxxx.supabase.co";
   window.SUPABASE_ANON_KEY = "eyJhbGciOi...";
   ```
6. (Optional) In Supabase **Authentication → Providers → Email**, turn **OFF**
   "Confirm email" if you want to log in instantly without email verification.

---

## 2. Push to GitHub

From this `body/` folder:

```bash
git init
git add .
git commit -m "Body transformation tracker"
git branch -M main
# create an empty repo on github.com first, then:
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

> `config.js` is committed on purpose — the Supabase anon key is safe to expose
> in the browser (Row Level Security protects your data). Do **not** put any
> service-role/secret keys here.

---

## 3. Deploy to Render

The repo includes [`render.yaml`](./render.yaml) so Render auto-configures it.

1. Go to <https://render.com> and log in with GitHub.
2. **New → Static Site** and connect your repo.
3. Render reads `render.yaml` automatically. If asked manually:
   - **Build Command**: leave empty
   - **Publish Directory**: `.` (or `body` if you pushed the whole `maaq` repo)
4. Click **Create Static Site**.

Your site will be live at `https://<your-site>.onrender.com` and the home page
opens the roadmap. Tap **📈 My Log** to sign up / log in.

> The `routes` rewrite in `render.yaml` serves `transformation.html` at the
> root URL. Every push to `main` auto-deploys.

---

## 4. Use it from your phone

Open the Render URL on your phone and **Add to Home Screen** for an app-like
shortcut. Log in with the same email/password and your data appears everywhere.

---

## Files

| File | Purpose |
|------|---------|
| `transformation.html` | The full app UI (roadmap, workout, diet, My Log dashboard) |
| `app.js` | Auth + daily logging + chart logic |
| `config.js` | Your Supabase keys (you fill these in) |
| `schema.sql` | Database table + security policies |
| `render.yaml` | Serves the app at the root URL on Render |
| `IMG_*.PNG` | Your progress photos |

---

## Troubleshooting

- **"Supabase is not configured"** banner → you haven't filled in `config.js`.
- **Login works but logs don't save** → make sure you ran `schema.sql`.
- **"Email not confirmed"** → either confirm via the email link, or disable
  email confirmation in Supabase Auth settings.
