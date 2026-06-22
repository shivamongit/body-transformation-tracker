import { useEffect, useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import {
  Scale,
  TrendingDown,
  Flame,
  CalendarCheck,
  Target,
  Save,
} from "lucide-react";
import { fetchLogs, upsertLog, todayStr } from "../lib/db";
import { profile } from "../data/plan";
import { StatCard, SectionTitle, Spinner, Toast, Empty } from "./ui";

const CHECKS = [
  { key: "workout", label: "💪 Completed my workout" },
  { key: "protein", label: "🥩 Hit my protein (180-200g)" },
  { key: "steps", label: "🚶 Hit my step goal" },
  { key: "posture", label: "🦴 Did posture routine" },
  { key: "diet", label: "🥗 Stayed in calorie deficit" },
  { key: "sleep", label: "😴 Slept 7-8 hours" },
];

const WORKOUTS = [
  "Push A (Heavy Chest)", "Push B (Delt Focus)", "Pull A (Width)",
  "Pull B (Thickness)", "Legs", "Upper A", "Upper B", "Upper C",
  "Lower", "Arms + Abs + Finishers", "Cardio only", "Rest day",
];

export default function Dashboard({ user }) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  const [form, setForm] = useState({
    weight: "", waist: "", workout_name: "", notes: "",
    checks: {},
  });

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  async function load() {
    try {
      const data = await fetchLogs();
      setLogs(data);
      const t = data.find((l) => l.log_date === todayStr());
      if (t) {
        setForm({
          weight: t.weight ?? "", waist: t.waist ?? "",
          workout_name: t.workout_name ?? "", notes: t.notes ?? "",
          checks: t.checks ?? {},
        });
      }
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function save() {
    setSaving(true);
    try {
      await upsertLog(user.id, {
        log_date: todayStr(),
        weight: form.weight === "" ? null : Number(form.weight),
        waist: form.waist === "" ? null : Number(form.waist),
        workout_name: form.workout_name || null,
        notes: form.notes || null,
        checks: form.checks,
      });
      toast("Saved! Keep the streak alive 🔥", "success");
      await load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const toggle = (key) =>
    setForm((f) => ({ ...f, checks: { ...f.checks, [key]: !f.checks[key] } }));

  // ----- derived stats -----
  const stats = useMemo(() => {
    const withW = logs.filter((l) => l.weight != null);
    const current = withW.length ? withW[0].weight : null;
    const start = withW.length ? withW[withW.length - 1].weight : profile.startWeight;
    const change = current != null ? current - start : null;
    const toGoal = current != null ? Math.max(0, current - profile.goalWeight) : null;

    const done = new Set(logs.filter((l) => l.checks?.workout).map((l) => l.log_date));
    let streak = 0;
    let d = new Date();
    if (!done.has(todayStr(d))) d.setDate(d.getDate() - 1);
    while (done.has(todayStr(d))) { streak++; d.setDate(d.getDate() - 1); }

    const monday = new Date();
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    monday.setHours(0, 0, 0, 0);
    const week = logs.filter(
      (l) => l.checks?.workout && new Date(l.log_date) >= monday
    ).length;

    return { current, change, toGoal, streak, week };
  }, [logs]);

  const chartData = useMemo(
    () =>
      logs
        .filter((l) => l.weight != null)
        .slice()
        .reverse()
        .map((l) => ({ date: l.log_date.slice(5), weight: l.weight })),
    [logs]
  );

  if (loading)
    return (
      <div className="flex items-center gap-2 text-slate-400">
        <Spinner /> Loading your data…
      </div>
    );

  return (
    <div className="space-y-6">
      <Toast msg={msg} />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Scale} label="Current" tone="accent"
          value={stats.current != null ? `${stats.current} kg` : "—"} />
        <StatCard icon={TrendingDown} label="Total Change" tone={stats.change > 0 ? "warn" : "accent"}
          value={stats.change != null ? `${stats.change > 0 ? "+" : ""}${stats.change.toFixed(1)} kg` : "—"} />
        <StatCard icon={Flame} label="Workout Streak" tone="pink"
          value={`${stats.streak}d`} />
        <StatCard icon={CalendarCheck} label="This Week" tone="blue"
          value={`${stats.week}`} sub="workouts" />
        <StatCard icon={Target} label={`To Goal (${profile.goalWeight}kg)`} tone="purple"
          value={stats.toGoal != null ? `${stats.toGoal.toFixed(1)} kg` : "—"} />
      </div>

      {/* Daily check-in */}
      <div className="card">
        <SectionTitle icon={CalendarCheck} title="Today's Check-in"
          subtitle={todayStr()} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Weight (kg)</label>
            <input className="input" type="number" step="0.1" placeholder="e.g. 93.5"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })} />
          </div>
          <div>
            <label className="label">Waist (cm) — optional</label>
            <input className="input" type="number" step="0.1" placeholder="e.g. 92"
              value={form.waist}
              onChange={(e) => setForm({ ...form, waist: e.target.value })} />
          </div>
        </div>

        <div className="mt-3">
          <label className="label">Today's Workout</label>
          <select className="input" value={form.workout_name}
            onChange={(e) => setForm({ ...form, workout_name: e.target.value })}>
            <option value="">— Select session —</option>
            {WORKOUTS.map((w) => <option key={w}>{w}</option>)}
          </select>
        </div>

        <div className="grid sm:grid-cols-2 gap-2 mt-4">
          {CHECKS.map((c) => {
            const on = !!form.checks[c.key];
            return (
              <button key={c.key} onClick={() => toggle(c.key)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-left text-sm transition ${
                  on ? "border-accent/60 bg-accent/10 text-accent-soft"
                     : "border-white/10 bg-ink-950/60 text-slate-300 hover:border-white/20"
                }`}>
                <span className={`grid place-items-center w-5 h-5 rounded-md border ${
                  on ? "bg-accent border-accent text-ink-950" : "border-white/20"
                }`}>{on ? "✓" : ""}</span>
                {c.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3">
          <label className="label">Notes — optional</label>
          <textarea className="input" rows={2} placeholder="Energy, lifts hit, how you felt…"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>

        <button className="btn-primary w-full mt-4" onClick={save} disabled={saving}>
          {saving ? <Spinner /> : <Save size={18} />} Save Today's Log
        </button>
      </div>

      {/* Weight chart */}
      <div className="card">
        <SectionTitle icon={TrendingDown} title="Weight Trend" />
        {chartData.length ? (
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                <XAxis dataKey="date" stroke="#888" fontSize={12} />
                <YAxis stroke="#888" fontSize={12} domain={["auto", "auto"]} />
                <Tooltip contentStyle={{ background: "#13161d", border: "1px solid #272c38", borderRadius: 12 }} />
                <ReferenceLine y={profile.goalWeight} stroke="#60a5fa" strokeDasharray="6 6"
                  label={{ value: `Goal ${profile.goalWeight}`, fill: "#60a5fa", fontSize: 11, position: "insideTopRight" }} />
                <Line type="monotone" dataKey="weight" stroke="#4ade80" strokeWidth={3}
                  dot={{ r: 3, fill: "#4ade80" }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <Empty icon={Scale} title="No weigh-ins yet"
            hint="Log your weight above to see your trend." />
        )}
      </div>

      {/* History */}
      <div className="card">
        <SectionTitle icon={CalendarCheck} title="Recent Logs" />
        {logs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="py-2 pr-4">Date</th>
                  <th className="py-2 pr-4">Weight</th>
                  <th className="py-2 pr-4">Workout</th>
                  <th className="py-2 pr-4">Done</th>
                  <th className="py-2">Score</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 30).map((l) => {
                  const score = CHECKS.filter((c) => l.checks?.[c.key]).length;
                  return (
                    <tr key={l.id} className="border-t border-white/5">
                      <td className="py-2 pr-4">{l.log_date}</td>
                      <td className="py-2 pr-4">{l.weight != null ? `${l.weight} kg` : "—"}</td>
                      <td className="py-2 pr-4 text-slate-300">{l.workout_name || "—"}</td>
                      <td className="py-2 pr-4">{l.checks?.workout ? "✅" : "—"}</td>
                      <td className="py-2">
                        <span className="chip bg-white/5 text-slate-300">{score}/6</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={CalendarCheck} title="No logs yet"
            hint="Save your first check-in to get started 🚀" />
        )}
      </div>
    </div>
  );
}
