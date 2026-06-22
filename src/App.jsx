import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Target,
  Camera,
  Dumbbell,
  Sparkles,
  Salad,
  Map,
  Activity,
  Menu,
  X,
} from "lucide-react";
import { ensureGuestSession, supabase } from "./lib/supabase";
import { Spinner } from "./components/ui";
import Dashboard from "./components/Dashboard";
import Goals from "./components/Goals";
import Photos from "./components/Photos";
import AIPlans from "./components/AIPlans";
import PlanContent from "./components/PlanContent";

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "goals", label: "Goals", icon: Target },
  { id: "photos", label: "Progress Photos", icon: Camera },
  { id: "ai", label: "AI Plan Generator", icon: Sparkles, accent: true },
  { id: "plan", label: "My Program", icon: Dumbbell },
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

  // Views that require a signed-in (guest) session to read/write data.
  const needsAuth = view !== "plan";

  function renderView() {
    if (view === "plan") return <PlanContent />;
    if (authLoading)
      return (
        <div className="flex items-center gap-3 text-slate-400 py-16 justify-center">
          <Spinner /> Connecting to your account…
        </div>
      );
    if (!user)
      return (
        <div className="card max-w-lg mx-auto text-center">
          <h2 className="text-lg font-bold text-amber-400 mb-2">Guest sign-in unavailable</h2>
          <p className="text-sm text-slate-400">{authError}</p>
          <p className="text-xs text-slate-500 mt-3">
            Enable <strong>Anonymous sign-ins</strong> in Supabase → Authentication →
            Providers, then reload. You can still browse <strong>My Program</strong> meanwhile.
          </p>
          <button className="btn-primary mt-4" onClick={() => go("plan")}>
            View My Program
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
    <div className="min-h-screen lg:grid lg:grid-cols-[260px_1fr]">
      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-ink-900/90 backdrop-blur-xl border-r border-white/5 p-5 transition-transform ${
          navOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="flex items-center gap-2.5 mb-8">
          <div className="grid place-items-center w-9 h-9 rounded-xl bg-grad-accent text-ink-950">
            <Activity size={20} />
          </div>
          <div>
            <div className="font-extrabold leading-none">FORGE</div>
            <div className="text-[10px] uppercase tracking-widest text-slate-500">
              Body Transformation
            </div>
          </div>
          <button
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setNavOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {NAV.map((n) => {
            const active = view === n.id;
            return (
              <button
                key={n.id}
                onClick={() => go(n.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  active
                    ? "bg-white/10 text-white border border-white/10"
                    : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                <n.icon
                  size={18}
                  className={active || n.accent ? "text-accent" : ""}
                />
                {n.label}
                {n.accent && (
                  <span className="ml-auto chip bg-grad-purple text-ink-950 !px-2 !py-0.5 text-[10px]">
                    AI
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-5 left-5 right-5">
          <div className="rounded-xl bg-white/5 border border-white/10 p-3 text-xs text-slate-400">
            <span className="text-accent font-semibold">Guest mode</span> — your data
            is saved to this device and synced via Supabase.
          </div>
        </div>
      </aside>

      {navOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 lg:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      {/* Main */}
      <main className="min-h-screen">
        <header className="sticky top-0 z-20 flex items-center gap-3 px-4 sm:px-6 py-3 bg-ink-950/80 backdrop-blur-xl border-b border-white/5">
          <button
            className="lg:hidden text-slate-300"
            onClick={() => setNavOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="font-bold text-lg capitalize">
            {NAV.find((n) => n.id === view)?.label}
          </h1>
        </header>

        {authError && needsAuth && (
          <div className="mx-4 sm:mx-6 mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 text-amber-200 text-sm px-4 py-3">
            Cloud sync is off: enable <strong>Anonymous sign-ins</strong> in Supabase
            Auth → Providers to save your data.
          </div>
        )}
        <div className="p-4 sm:p-6 max-w-5xl mx-auto animate-fade-up">{renderView()}</div>
      </main>
    </div>
  );
}
