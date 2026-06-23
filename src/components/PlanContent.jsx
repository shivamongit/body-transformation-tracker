import { useState } from "react";
import { Map, Dumbbell, Salad, ScanLine, ImageOff } from "lucide-react";
import { priorities, roadmap, principles, workouts, diet, profile } from "../data/plan";
import { SectionTitle } from "./ui";

// Personal reference photos are kept out of version control (see /private,
// which is gitignored). They are loaded optionally at build time, so the app
// builds and runs fine for anyone who clones the repo without them.
const PRIVATE = import.meta.glob("../../private/*.{PNG,png,jpg,jpeg,JPG,JPEG,webp}", {
  eager: true,
  import: "default",
});
const pic = (name) => {
  const hit = Object.keys(PRIVATE).find((k) => k.includes(`/${name}.`));
  return hit ? PRIVATE[hit] : null;
};

const PHOTOS = [
  { src: pic("front"), label: "Front View", notes: ["Central body fat (~26%)", "Flat/underdeveloped chest", "Narrow delts", "Thin arms"] },
  { src: pic("side-right"), label: "Side Profile (Right)", notes: ["Protruding abdomen", "Anterior pelvic tilt", "Forward head posture", "Rounded shoulders"] },
  { src: pic("side-left"), label: "Side Profile (Left)", notes: ["Confirms anterior pelvic tilt", "Belly protrusion", "Forward head + rounded shoulders"] },
  { src: pic("back-raised"), label: "Back — Arms Raised", notes: ["No lat width (no V-taper)", "Underdeveloped upper back", "Rear delts absent"] },
  { src: pic("back-relaxed"), label: "Back — Relaxed", notes: ["Love handles", "Narrow back taper", "Mild shoulder asymmetry"] },
];

const TABS = [
  { id: "analysis", label: "Analysis", icon: ScanLine },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "diet", label: "Diet", icon: Salad },
];

const levelChip = { red: "bg-red-500/10 text-red-300 border-red-500/20", yellow: "bg-amber-500/10 text-amber-300 border-amber-500/20" };

export default function PlanContent() {
  const [tab, setTab] = useState("analysis");

  return (
    <div className="space-y-6">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`btn ${tab === t.id ? "btn-primary" : "btn-ghost"} shrink-0`}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "analysis" && (
        <>
          <div className="card">
            <SectionTitle icon={ScanLine} title="Priority Ranking"
              subtitle="Attack these in order — biggest visual ROI first." />
            <div className="space-y-2">
              {priorities.map((p) => (
                <div key={p.rank} className="flex gap-3 items-start px-4 py-3 rounded-lg border border-base-border bg-base-bg">
                  <div className="grid place-items-center w-7 h-7 rounded-lg bg-accent text-white font-semibold text-sm shrink-0">
                    {p.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-text-primary">{p.issue}</span>
                      <span className={`chip border ${levelChip[p.level]}`}>{p.level === "red" ? "Critical" : "Moderate"}</span>
                    </div>
                    <p className="text-sm text-text-secondary mt-0.5">{p.why}</p>
                    <p className="text-sm text-accent-text mt-0.5">Fix: {p.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {PHOTOS.map((p) => (
              <div key={p.label} className="card !p-0 overflow-hidden">
                {p.src ? (
                  <img src={p.src} alt={p.label} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                ) : (
                  <div className="w-full aspect-[3/4] bg-base-lowest grid place-items-center text-text-muted">
                    <div className="text-center px-4">
                      <ImageOff size={28} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Add <code className="text-accent">private/{p.label.toLowerCase().includes("front") ? "front" : p.label.toLowerCase().includes("right") ? "side-right" : p.label.toLowerCase().includes("left") ? "side-left" : p.label.toLowerCase().includes("raised") ? "back-raised" : "back-relaxed"}.jpg</code></p>
                    </div>
                  </div>
                )}
                <div className="p-4">
                  <div className="font-medium text-text-primary mb-2">{p.label}</div>
                  <ul className="space-y-1">
                    {p.notes.map((n) => (
                      <li key={n} className="text-sm text-text-secondary flex gap-2">
                        <span className="text-accent">•</span>{n}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "roadmap" && (
        <div className="card">
          <SectionTitle icon={Map} title="4-Month Roadmap"
            subtitle={`${profile.startWeight} kg → ${profile.goalWeight} kg`} />
          <div className="space-y-3">
            {roadmap.map((r) => (
              <div key={r.month} className="pl-4 border-l-2 border-accent">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-text-primary">{r.month}</span>
                  <span className="chip bg-accent/10 text-accent-text border border-accent/25">{r.target}</span>
                </div>
                <p className="text-sm text-text-secondary mt-1">{r.milestone}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "workout" && (
        <>
          <div className="card">
            <SectionTitle icon={Dumbbell} title="Evidence-Based Principles" />
            <div className="space-y-2">
              {principles.map((p) => (
                <div key={p.k} className="px-4 py-3 rounded-lg border border-base-border bg-base-bg">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-medium text-accent-text">{p.k}</span>
                    <span className="text-sm text-text-primary">{p.v}</span>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">{p.why}</p>
                </div>
              ))}
            </div>
          </div>

          {Object.entries(workouts).map(([phase, days]) => (
            <div key={phase} className="card">
              <SectionTitle icon={Dumbbell} title={phase} />
              <div className="space-y-3">
                {days.map((d) => (
                  <div key={d.day} className="rounded-lg border border-base-border bg-base-bg p-4">
                    <div className="font-medium text-accent-text mb-2">{d.day}</div>
                    <div className="flex flex-wrap gap-2">
                      {d.items.map((it) => (
                        <span key={it} className="chip bg-base-elevated text-text-secondary border border-base-border">{it}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>
      )}

      {tab === "diet" && (
        <>
          <div className="card">
            <SectionTitle icon={Salad} title="Daily Targets" />
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {diet.macros.map((m) => (
                <div key={m.label} className="rounded-lg border border-base-border bg-base-bg p-4 text-center">
                  <div className="text-xl font-semibold text-accent">{m.num}</div>
                  <div className="text-xs text-text-secondary mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <SectionTitle icon={Salad} title="Sample Indian Meal Plan" />
            <div className="space-y-2">
              {diet.meals.map((m) => (
                <div key={m.time} className="rounded-lg border border-base-border bg-base-bg p-4">
                  <div className="text-sm font-medium text-accent-text">{m.time}</div>
                  <div className="text-sm text-text-secondary mt-1">{m.food}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
