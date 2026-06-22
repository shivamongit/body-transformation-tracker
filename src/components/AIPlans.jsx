import { useEffect, useState } from "react";
import { Sparkles, Trash2, Wand2, ChevronDown } from "lucide-react";
import { fetchPlans, savePlan, deletePlan, generatePlan } from "../lib/db";
import { profile } from "../data/plan";
import { SectionTitle, Spinner, Toast, Empty } from "./ui";

const GOALS = ["Build muscle + lose fat (recomp)", "Pure fat loss", "Lean bulk", "Strength", "Posture correction focus"];
const SPLITS = ["Push/Pull/Legs", "Upper/Lower", "Full Body", "Bro Split"];
const EQUIP = ["Full gym", "Home dumbbells only", "Bodyweight only", "Resistance bands"];

export default function AIPlans({ user }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [open, setOpen] = useState(null);
  const [form, setForm] = useState({
    goal: GOALS[0], days: 5, split: SPLITS[0], equipment: EQUIP[0],
    experience: "Beginner", focus: "Chest, back width, delts, arms", notes: "",
  });

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 4000);
  };

  async function load() {
    try { setPlans(await fetchPlans()); }
    catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function generate() {
    setBusy(true);
    try {
      const result = await generatePlan({
        profile: {
          weight: profile.startWeight, goalWeight: profile.goalWeight,
          height: profile.height, age: profile.age, bodyFat: profile.bodyFat,
        },
        ...form,
      });
      const content = result?.plan || result?.content || result;
      await savePlan(user.id, {
        title: `${form.goal} · ${form.days}d ${form.split}`,
        params: form,
        content: typeof content === "string" ? content : JSON.stringify(content, null, 2),
      });
      toast("Plan generated", "success");
      load();
    } catch (e) {
      toast(
        e.message?.includes("Function")
          ? "Edge function not deployed yet. See README → AI setup."
          : e.message || "Generation failed.",
        "error"
      );
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    try { await deletePlan(id); load(); }
    catch (e) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-6">
      <Toast msg={msg} />

      <div className="card">
        <SectionTitle icon={Sparkles} title="Generate a New Plan with AI"
          subtitle="Powered by OpenAI — tailored to your body, goal, and schedule." />

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Primary goal</label>
            <select className="input" value={form.goal}
              onChange={(e) => setForm({ ...form, goal: e.target.value })}>
              {GOALS.map((g) => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Days / week</label>
            <select className="input" value={form.days}
              onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}>
              {[3, 4, 5, 6].map((d) => <option key={d} value={d}>{d} days</option>)}
            </select>
          </div>
          <div>
            <label className="label">Split</label>
            <select className="input" value={form.split}
              onChange={(e) => setForm({ ...form, split: e.target.value })}>
              {SPLITS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Equipment</label>
            <select className="input" value={form.equipment}
              onChange={(e) => setForm({ ...form, equipment: e.target.value })}>
              {EQUIP.map((eq) => <option key={eq}>{eq}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience</label>
            <select className="input" value={form.experience}
              onChange={(e) => setForm({ ...form, experience: e.target.value })}>
              {["Beginner", "Intermediate", "Advanced"].map((x) => <option key={x}>{x}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Focus areas</label>
            <input className="input" value={form.focus}
              onChange={(e) => setForm({ ...form, focus: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Extra notes</label>
            <textarea className="input" rows={2} value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </div>
        </div>

        <button className="btn-primary w-full mt-4" onClick={generate} disabled={busy}>
          {busy ? <Spinner /> : <Wand2 size={18} />}
          {busy ? "Generating…" : "Generate Plan"}
        </button>
      </div>

      <div className="card">
        <SectionTitle icon={Sparkles} title="Saved AI Plans" />
        {loading ? (
          <div className="flex items-center gap-2 text-text-secondary"><Spinner /> Loading…</div>
        ) : plans.length ? (
          <div className="space-y-2">
            {plans.map((p) => (
              <div key={p.id} className="rounded-lg border border-base-border bg-base-bg">
                <button
                  onClick={() => setOpen(open === p.id ? null : p.id)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left">
                  <Sparkles size={16} className="text-accent shrink-0" />
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-text-primary truncate">{p.title}</div>
                    <div className="text-xs text-text-muted">
                      {new Date(p.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(p.id); }}
                    className="text-text-muted hover:text-red-400"><Trash2 size={16} /></button>
                  <ChevronDown size={18}
                    className={`text-text-muted transition ${open === p.id ? "rotate-180" : ""}`} />
                </button>
                {open === p.id && (
                  <pre className="px-4 pb-4 text-sm text-text-secondary whitespace-pre-wrap font-sans leading-relaxed">
                    {p.content}
                  </pre>
                )}
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={Sparkles} title="No AI plans yet" hint="Fill the form above and generate your first plan." />
        )}
      </div>
    </div>
  );
}
