import { useEffect, useState } from "react";
import { Target, Plus, Trash2, CheckCircle2, Circle } from "lucide-react";
import { fetchGoals, addGoal, updateGoal, deleteGoal } from "../lib/db";
import { profile } from "../data/plan";
import { SectionTitle, Spinner, Toast, Empty } from "./ui";

const TYPES = [
  { v: "weight", l: "Target Weight (kg)" },
  { v: "waist", l: "Target Waist (cm)" },
  { v: "bodyfat", l: "Target Body Fat (%)" },
  { v: "habit", l: "Habit / Milestone" },
];

export default function Goals({ user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [form, setForm] = useState({
    title: "", type: "weight", target_value: "", deadline: "",
  });

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  async function load() {
    try { setGoals(await fetchGoals()); }
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
      toast("Goal added 🎯", "success");
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
          subtitle={`Starting point: ${profile.startWeight} kg · Target: ${profile.goalWeight} kg`} />
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label">Goal title</label>
            <input className="input" placeholder="e.g. Reach 85 kg by March"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
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
              value={form.target_value}
              onChange={(e) => setForm({ ...form, target_value: e.target.value })} />
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

      <div className="card">
        <SectionTitle icon={CheckCircle2} title="Your Goals" />
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400"><Spinner /> Loading…</div>
        ) : goals.length ? (
          <div className="space-y-2">
            {goals.map((g) => (
              <div key={g.id}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  g.achieved ? "border-accent/40 bg-accent/5" : "border-white/10 bg-ink-950/60"
                }`}>
                <button onClick={() => toggle(g)} className="shrink-0">
                  {g.achieved
                    ? <CheckCircle2 className="text-accent" size={22} />
                    : <Circle className="text-slate-500" size={22} />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className={`font-semibold ${g.achieved ? "line-through text-slate-400" : ""}`}>
                    {g.title}
                  </div>
                  <div className="text-xs text-slate-500 flex gap-2 flex-wrap mt-0.5">
                    <span className="chip bg-white/5 text-slate-300">{g.type}</span>
                    {g.target_value != null && <span>target: {g.target_value}</span>}
                    {g.deadline && <span>by {g.deadline}</span>}
                  </div>
                </div>
                <button onClick={() => remove(g.id)} className="text-slate-500 hover:text-red-400">
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={Target} title="No goals yet"
            hint="Add your first goal above to stay accountable." />
        )}
      </div>
    </div>
  );
}
