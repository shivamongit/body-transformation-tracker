import { useEffect, useMemo, useState } from "react";
import { Target, Plus, Trash2, CheckCircle, MoreHorizontal } from "lucide-react";
import { fetchGoals, addGoal, updateGoal, deleteGoal, fetchLogs } from "../lib/db";
import { profile } from "../data/plan";
import { SectionTitle, Spinner, Toast, Empty } from "./ui";

const TYPES = [
  { v: "weight", l: "Target Weight (kg)" },
  { v: "waist", l: "Target Waist (cm)" },
  { v: "bodyfat", l: "Target Body Fat (%)" },
  { v: "habit", l: "Habit / Milestone" },
];

const TYPE_CHIP = {
  weight: "bg-accent/10 text-accent border-accent/20",
  waist: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  bodyfat: "bg-sky-500/10 text-sky-300 border-sky-500/20",
  habit: "bg-base-elevated text-text-secondary border-base-border",
};

function Ring({ pct }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  const off = c * (1 - Math.max(0, Math.min(100, pct)) / 100);
  return (
    <div className="relative w-20 h-20">
      <svg width="80" height="80" className="-rotate-90">
        <circle cx="40" cy="40" r={r} fill="transparent" stroke="#26262f" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="transparent" stroke="#4be277" strokeWidth="6"
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={off}
          className="transition-all duration-700" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-base font-semibold text-accent">
        {Math.round(pct)}%
      </div>
    </div>
  );
}

function computeProgress(g, logs) {
  if (g.achieved) return 100;
  if (g.target_value == null) return 0;
  const withWeight = logs.filter((l) => l.weight != null);
  const withWaist = logs.filter((l) => l.waist != null);
  const calc = (start, current, target) => {
    if (start == null || current == null || start === target) return 0;
    return Math.max(0, Math.min(100, ((start - current) / (start - target)) * 100));
  };
  if (g.type === "weight") {
    const current = withWeight[0]?.weight ?? profile.startWeight;
    return calc(profile.startWeight, current, g.target_value);
  }
  if (g.type === "waist") {
    const start = withWaist[withWaist.length - 1]?.waist;
    const current = withWaist[0]?.waist;
    return calc(start, current, g.target_value);
  }
  return 0;
}

export default function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    title: "", type: "weight", target_value: "", deadline: "",
  });

  const active = useMemo(() => goals.filter((g) => !g.achieved), [goals]);
  const completed = useMemo(() => goals.filter((g) => g.achieved), [goals]);

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  async function load() {
    try {
      const [g, l] = await Promise.all([fetchGoals(), fetchLogs().catch(() => [])]);
      setGoals(g);
      setLogs(l);
    }
    catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function create() {
    if (!form.title.trim()) return toast("Give your goal a title", "error");
    try {
      await addGoal(user.id, {
        title: form.title.trim(),
        type: form.type,
        target_value: form.target_value === "" ? null : Number(form.target_value),
        deadline: form.deadline || null,
        achieved: false,
      });
      setForm({ title: "", type: "weight", target_value: "", deadline: "" });
      toast("Goal added", "success");
      load();
    } catch (e) { toast(e.message, "error"); }
  }

  async function toggle(g) {
    try { await updateGoal(g.id, { achieved: !g.achieved }); load(); }
    catch (e) { toast(e.message, "error"); }
  }
  async function remove(id) {
    try { await deleteGoal(id); load(); }
    catch (e) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-6">
      <Toast msg={msg} />

      <div className="card">
        <SectionTitle icon={Target} title="Set a New Goal"
          subtitle={`${profile.startWeight} kg → ${profile.goalWeight} kg`} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Goal title</label>
            <input className="input" placeholder="e.g. Reach 85 kg by March"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className="label">Type</label>
            <select className="input" value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {TYPES.map((t) => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Target value</label>
            <input className="input" type="number" step="0.1" placeholder="optional"
              value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Deadline</label>
            <input className="input" type="date" value={form.deadline}
              onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
        </div>
        <button className="btn-primary w-full mt-4" onClick={create}>
          <Plus size={18} /> Add Goal
        </button>
      </div>

      {loading ? (
        <div className="card flex items-center gap-2 text-text-secondary"><Spinner /> Loading…</div>
      ) : !goals.length ? (
        <div className="card"><Empty icon={Target} title="No goals yet" hint="Add your first goal above." /></div>
      ) : (
        <>
          {active.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-5 bg-accent rounded-full" />
                <h4 className="text-lg font-semibold tracking-tight">Active Goals</h4>
                <span className="chip bg-accent/10 text-accent border border-accent/20 uppercase text-[10px] font-bold">
                  {active.length} Active
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((g) => {
                  const pct = computeProgress(g, logs);
                  return (
                    <div key={g.id}
                      className="group bg-base-elevated/40 border border-base-border p-6 rounded-xl hover:border-accent/40 transition-all">
                      <div className="flex justify-between items-start mb-5">
                        <Ring pct={pct} />
                        <span className={`chip border uppercase text-[10px] font-bold tracking-widest ${TYPE_CHIP[g.type] || TYPE_CHIP.habit}`}>
                          {g.type}
                        </span>
                      </div>
                      <h5 className="font-semibold text-base mb-1 group-hover:text-accent transition-colors">{g.title}</h5>
                      <p className="text-xs text-text-secondary mb-5">
                        {g.target_value != null ? `Target: ${g.target_value}` : "Milestone"}
                        {g.deadline ? ` · by ${g.deadline}` : ""}
                      </p>
                      <div className="flex justify-between items-center pt-4 border-t border-base-border/60">
                        <button onClick={() => toggle(g)}
                          className="text-xs font-bold text-text-secondary hover:text-accent transition-colors flex items-center gap-1.5">
                          <CheckCircle size={15} /> Mark done
                        </button>
                        <button onClick={() => remove(g.id)} className="text-text-muted hover:text-red-400">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-1.5 h-5 bg-text-muted rounded-full" />
                <h4 className="text-lg font-semibold tracking-tight">Completed Goals</h4>
                <span className="text-[10px] text-text-muted uppercase tracking-widest font-bold">Archived</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                {completed.map((g) => (
                  <div key={g.id}
                    className="bg-base-surface border border-base-border/50 p-4 rounded-lg flex items-center gap-3 group hover:bg-base-elevated/40 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 grid place-items-center text-accent shrink-0">
                      <CheckCircle size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h6 className="text-sm font-medium text-text-primary truncate">{g.title}</h6>
                      <p className="text-[11px] text-text-muted capitalize">{g.type}</p>
                    </div>
                    <button onClick={() => toggle(g)} className="text-text-muted hover:text-text-primary" title="Reactivate">
                      <MoreHorizontal size={16} />
                    </button>
                    <button onClick={() => remove(g.id)} className="text-text-muted hover:text-red-400">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
