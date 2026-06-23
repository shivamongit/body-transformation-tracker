import { lazy, Suspense, useEffect, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Camera,
  Dumbbell,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { ensureGuestSession, supabase } from "./lib/supabase";
import { Spinner } from "./components/ui";

const Dashboard = lazy(() => import("./components/Dashboard"));
const Goals = lazy(() => import("./components/Goals"));
const Photos = lazy(() => import("./components/Photos"));
const AIPlans = lazy(() => import("./components/AIPlans"));
const PlanContent = lazy(() => import("./components/PlanContent"));

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, title: "Performance Overview", desc: "Real-time physiological progress tracking." },
  { id: "goals", label: "Goals", icon: Target, title: "Performance Objectives", desc: "Track your transformation and daily consistency." },
  { id: "photos", label: "Photos", icon: Camera, title: "Visual Evolution", desc: "Your body composition, captured over time." },
  { id: "ai", label: "AI Plans", icon: Sparkles, title: "AI Transformation Plans", desc: "Protocols engineered for your physiology." },
  { id: "plan", label: "Program", icon: Dumbbell, title: "Elite Program", desc: "Your structured transformation protocol." },
];

export default function App() {
  const [user, setUser] = useState(null);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    ensureGuestSession()
      .then((u) => setUser(u))
      .catch((e) => setAuthError(e?.message || String(e)))
      .finally(() => setAuthLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) {
        setUser(session.user);
        setAuthError(null);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const go = (id) => {
    setView(id);
    setNavOpen(false);
  };

  const needsAuth = view !== "plan";

  function renderView() {
    if (view === "plan") return <PlanContent />;
    if (authLoading)
      return (
        <div className="flex items-center gap-3 text-text-secondary py-16 justify-center">
          <Spinner /> Connecting…
        </div>
      );
    if (!user)
      return (
        <div className="card max-w-lg mx-auto text-center">
          <h2 className="text-lg font-semibold text-amber-400 mb-2">Guest sign-in unavailable</h2>
          <p className="text-sm text-text-secondary">{authError}</p>
          <p className="text-xs text-text-muted mt-3">
            Enable <strong>Anonymous sign-ins</strong> in Supabase → Authentication → Providers, then reload. You can still browse <strong>Program</strong> meanwhile.
          </p>
          <button className="btn-primary mt-4" onClick={() => go("plan")}>
            View Program
          </button>
        </div>
      );
    if (view === "dashboard") return <Dashboard user={user} />;
    if (view === "goals") return <Goals user={user} />;
    if (view === "photos") return <Photos user={user} />;
    if (view === "ai") return <AIPlans user={user} />;
    return null;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-60 bg-base-surface border-r border-base-border p-5 transition-transform ${
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-2xl font-bold text-accent tracking-tighter leading-none">FORGE</h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mt-1">Elite Performance</p>
          </div>
          <button className="lg:hidden text-text-secondary" onClick={() => setNavOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1.5">
          {NAV.map((n) => {
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all active:scale-[0.98] ${
                  active
                    ? "text-accent font-bold bg-accent/10 border-r-2 border-accent"
                    : "text-text-secondary font-medium hover:text-text-primary hover:bg-base-elevated"
                }`}
              >
                <n.icon size={18} />
                {n.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="rounded-lg border border-base-border bg-base-lowest p-3 text-xs text-text-secondary">
            <span className="text-accent-text font-bold">Guest mode</span> — data is synced via Supabase.
          </div>
        </div>
      </aside>

      {navOpen && (
        <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setNavOpen(false)} />
      )}

      <main className="relative min-h-screen bg-base-bg overflow-hidden">
        {/* ambient glow */}
        <div className="pointer-events-none absolute -top-40 -right-40 w-[480px] h-[480px] rounded-full bg-accent/10 blur-[120px]" />
        <div className="pointer-events-none absolute top-1/3 -left-40 w-[360px] h-[360px] rounded-full bg-accent/5 blur-[120px]" />

        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 px-4 sm:px-6 h-16 bg-base-bg/80 backdrop-blur-md border-b border-base-border">
          <div className="flex items-center gap-3">
            <button className="lg:hidden text-text-secondary" onClick={() => setNavOpen(true)}>
              <Menu size={22} />
            </button>
            <h2 className="font-semibold text-base text-text-primary">
              {NAV.find((n) => n.id === view)?.label}
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-full border border-base-border bg-base-surface">
            <span className={`w-1.5 h-1.5 rounded-full ${user ? "bg-accent animate-pulse" : "bg-amber-400"}`} />
            <span className="text-text-secondary">{user ? "Synced" : "Guest"}</span>
          </div>
        </header>

        <div className="relative p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-up">
          {/* page hero */}
          {(() => {
            const meta = NAV.find((n) => n.id === view);
            return (
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-text-primary">{meta?.title}</h1>
                <p className="text-text-secondary mt-1.5 max-w-2xl">{meta?.desc}</p>
              </div>
            );
          })()}

          {authError && needsAuth && (
            <div className="mb-5 rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm px-4 py-3">
              Cloud sync is off: enable <strong>Anonymous sign-ins</strong> in Supabase Auth → Providers to save your data.
            </div>
          )}

          <Suspense
            fallback={
              <div className="flex items-center gap-3 text-text-secondary py-16 justify-center">
                <Spinner /> Loading…
              </div>
            }
          >
            {renderView()}
          </Suspense>
        </div>
      </main>
    </div>
  );
}
