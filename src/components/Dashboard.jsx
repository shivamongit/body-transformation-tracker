import { useEffect, useMemo, useState } from "react";
import {
  AreaChart,
  Area,
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
  { key: "workout", label: "Completed workout", short: "Workout" },
  { key: "protein", label: "Hit protein (180-200g)", short: "Protein" },
  { key: "steps", label: "Hit step goal", short: "Steps" },
  { key: "posture", label: "Posture routine", short: "Posture" },
  { key: "diet", label: "Stayed in deficit", short: "Diet" },
  { key: "sleep", label: "Slept 7-8 hours", short: "Sleep" },
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
      toast("Saved!", "success");
      await load();
    } catch (e) {
      toast(e.message, "error");
    } finally {
      setSaving(false);
    }
  }

  const toggle = (key) =>
    setForm((f) => ({ ...f, checks: { ...f.checks, [key]: !f.checks[key] } }));

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
    const week = logs.filter((l) => l.checks?.workout && new Date(l.log_date) >= monday).length;

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
      <div className="flex items-center gap-2 text-text-secondary">
        <Spinner /> Loading your data…
      </div>
    );

  return (
    <div className="space-y-6">
      <Toast msg={msg} />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <StatCard icon={Scale} label="Current" unit={stats.current != null ? "kg" : ""}
          value={stats.current != null ? stats.current : "—"} />
        <StatCard icon={TrendingDown} label="Total Change" unit={stats.change != null ? "kg" : ""}
          value={stats.change != null ? `${stats.change > 0 ? "+" : ""}${stats.change.toFixed(1)}` : "—"}
          chip="ALL TIME" chipTone={stats.change > 0 ? "error" : "accent"} />
        <StatCard icon={Flame} label="Streak" unit="days" value={stats.streak}
          chip={stats.streak > 0 ? "ACTIVE" : null} />
        <StatCard icon={CalendarCheck} label="This Week" value={`${stats.week} / 5`}
          pips={{ filled: Math.min(stats.week, 5), total: 5 }} />
        <StatCard icon={Target} label="To Goal" unit={stats.toGoal != null ? "kg" : ""}
          value={stats.toGoal != null ? stats.toGoal.toFixed(1) : "—"}
          chip="REMAINING" chipTone="error" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2 flex flex-col">
          <SectionTitle icon={TrendingDown} title="Weight Trend"
            subtitle="Progress toward your goal weight" />
          {chartData.length ? (
            <div className="flex-grow h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="weightFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#22c55e" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#26262f" vertical={false} />
                  <XAxis dataKey="date" stroke="#869585" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#869585" fontSize={12} domain={["auto", "auto"]} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "#161d16", border: "1px solid #26262f", borderRadius: 8, color: "#dce5d9" }} />
                  <ReferenceLine y={profile.goalWeight} stroke="#4be277" strokeDasharray="4 4"
                    label={{ value: `Goal ${profile.goalWeight}`, fill: "#4be277", fontSize: 11, position: "insideTopRight" }} />
                  <Area type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5}
                    fill="url(#weightFill)" dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <Empty icon={Scale} title="No weigh-ins yet" hint="Log your weight to see your trend." />
          )}
        </div>

        <div className="card">
          <SectionTitle icon={CalendarCheck} title="Daily Check-in" subtitle={todayStr()} />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" step="0.1" placeholder="93.5"
                value={form.weight} onChange={(e) => setForm({ ...form, weight: e.target.value })} />
            </div>
            <div>
              <label className="label">Waist (cm)</label>
              <input className="input" type="number" step="0.1" placeholder="92"
                value={form.waist} onChange={(e) => setForm({ ...form, waist: e.target.value })} />
            </div>
          </div>

          <div className="mt-3">
            <label className="label">Today's Workout</label>
            <select className="input" value={form.workout_name}
              onChange={(e) => setForm({ ...form, workout_name: e.target.value })}>
              <option value="">Select session</option>
              {WORKOUTS.map((w) => <option key={w}>{w}</option>)}
            </select>
          </div>

          <div className="mt-4">
            <label className="label">Habit Completion</label>
            <div className="flex flex-wrap gap-2">
              {CHECKS.map((c) => {
                const on = !!form.checks[c.key];
                return (
                  <button key={c.key} onClick={() => toggle(c.key)} type="button"
                    className={`px-3 py-1.5 rounded-full border text-xs font-bold transition-all ${
                      on ? "border-accent bg-accent/10 text-accent"
                        : "border-base-border text-text-secondary hover:border-text-muted"
                    }`}>
                    {c.short || c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-3">
            <label className="label">Notes</label>
            <textarea className="input" rows={2} placeholder="Energy, lifts, how you felt…"
              value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>

          <button className="btn-primary w-full mt-4" onClick={save} disabled={saving}>
            {saving ? <Spinner /> : <Save size={18} />} Save Daily Entry
          </button>
        </div>
      </div>

      <div className="card">
        <SectionTitle icon={CalendarCheck} title="Recent Logs" />
        {logs.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-text-muted">
                  <th className="py-2 pr-4 font-medium">Date</th>
                  <th className="py-2 pr-4 font-medium">Weight</th>
                  <th className="py-2 pr-4 font-medium">Workout</th>
                  <th className="py-2 pr-4 font-medium">Done</th>
                  <th className="py-2 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {logs.slice(0, 30).map((l) => {
                  const score = CHECKS.filter((c) => l.checks?.[c.key]).length;
                  return (
                    <tr key={l.id} className="border-t border-base-border">
                      <td className="py-2 pr-4 text-text-secondary">{l.log_date}</td>
                      <td className="py-2 pr-4 text-text-secondary">{l.weight != null ? `${l.weight} kg` : "—"}</td>
                      <td className="py-2 pr-4 text-text-primary">{l.workout_name || "—"}</td>
                      <td className="py-2 pr-4 text-text-secondary">{l.checks?.workout ? "✓" : "—"}</td>
                      <td className="py-2">
                        <span className="chip bg-base-elevated text-text-secondary border border-base-border">{score}/6</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <Empty icon={CalendarCheck} title="No logs yet" hint="Save your first check-in to get started." />
        )}
      </div>
    </div>
  );
}
