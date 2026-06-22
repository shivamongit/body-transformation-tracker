import { useState } from "react";
import { Map, Dumbbell, Salad, ScanLine } from "lucide-react";
import { priorities, roadmap, principles, workouts, diet, profile } from "../data/plan";
import { SectionTitle } from "./ui";
import front from "../../IMG_1546.PNG";
import sideR from "../../IMG_1542.PNG";
import sideL from "../../IMG_1545.PNG";
import backRaised from "../../IMG_1543.PNG";
import backRelaxed from "../../IMG_1544.PNG";

const PHOTOS = [
  { src: front, label: "Front View", notes: ["Central body fat (~26%)", "Flat/underdeveloped chest", "Narrow delts", "Thin arms"] },
  { src: sideR, label: "Side Profile (Right)", notes: ["Protruding abdomen", "Anterior pelvic tilt", "Forward head posture", "Rounded shoulders"] },
  { src: sideL, label: "Side Profile (Left)", notes: ["Confirms anterior pelvic tilt", "Belly protrusion", "Forward head + rounded shoulders"] },
  { src: backRaised, label: "Back — Arms Raised", notes: ["No lat width (no V-taper)", "Underdeveloped upper back", "Rear delts absent"] },
  { src: backRelaxed, label: "Back — Relaxed", notes: ["Love handles", "Narrow back taper", "Mild shoulder asymmetry"] },
];

const TABS = [
  { id: "analysis", label: "Analysis", icon: ScanLine },
  { id: "roadmap", label: "Roadmap", icon: Map },
  { id: "workout", label: "Workout", icon: Dumbbell },
  { id: "diet", label: "Diet", icon: Salad },
];

const levelChip = { red: "bg-red-500/15 text-red-300", yellow: "bg-amber-500/15 text-amber-300" };

export default function PlanContent() {
  const [tab, setTab] = useState("analysis");

  return (
    <div className="space-y-6">
      {/* Sub nav */}
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
                <div key={p.rank} className="flex gap-3 items-start px-4 py-3 rounded-xl border border-white/10 bg-ink-950/60">
                  <div className="grid place-items-center w-7 h-7 rounded-lg bg-grad-accent text-ink-950 font-bold text-sm shrink-0">
                    {p.rank}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold">{p.issue}</span>
                      <span className={`chip ${levelChip[p.level]}`}>{p.level === "red" ? "Critical" : "Moderate"}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5">{p.why}</p>
                    <p className="text-sm text-accent-soft mt-0.5">Fix: {p.fix}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {PHOTOS.map((p) => (
              <div key={p.label} className="card !p-0 overflow-hidden">
                <img src={p.src} alt={p.label} className="w-full aspect-[3/4] object-cover" loading="lazy" />
                <div className="p-4">
                  <div className="font-semibold mb-2">{p.label}</div>
                  <ul className="space-y-1">
                    {p.notes.map((n) => (
                      <li key={n} className="text-sm text-slate-400 flex gap-2">
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
          <SectionTitle icon={Map} title="4-Month Accelerated Roadmap"
            subtitle={`${profile.startWeight} kg → ${profile.goalWeight} kg`} />
          <div className="space-y-3">
            {roadmap.map((r) => (
              <div key={r.month} className="pl-4 border-l-2 border-accent/60">
                <div className="flex items-center gap-2">
                  <span className="font-bold">{r.month}</span>
                  <span className="chip bg-accent/15 text-accent-soft">{r.target}</span>
                </div>
                <p className="text-sm text-slate-400 mt-1">{r.milestone}</p>
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
                <div key={p.k} className="px-4 py-3 rounded-xl border border-white/10 bg-ink-950/60">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-accent-soft">{p.k}</span>
                    <span className="text-sm">{p.v}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">{p.why}</p>
                </div>
              ))}
            </div>
          </div>

          {Object.entries(workouts).map(([phase, days]) => (
            <div key={phase} className="card">
              <SectionTitle icon={Dumbbell} title={phase} />
              <div className="space-y-3">
                {days.map((d) => (
                  <div key={d.day} className="rounded-xl border border-white/10 bg-ink-950/60 p-4">
                    <div className="font-semibold text-brand-blue mb-2">{d.day}</div>
                    <div className="flex flex-wrap gap-2">
                      {d.items.map((it) => (
                        <span key={it} className="chip bg-white/5 text-slate-300">{it}</span>
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
                <div key={m.label} className="rounded-xl border border-white/10 bg-ink-950/60 p-4 text-center">
                  <div className="text-xl font-extrabold text-accent">{m.num}</div>
                  <div className="text-xs text-slate-400 mt-1">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <SectionTitle icon={Salad} title="Sample Indian Meal Plan" />
            <div className="space-y-2">
              {diet.meals.map((m) => (
                <div key={m.time} className="rounded-xl border border-white/10 bg-ink-950/60 p-4">
                  <div className="text-sm font-semibold text-accent-soft">{m.time}</div>
                  <div className="text-sm text-slate-300 mt-1">{m.food}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
