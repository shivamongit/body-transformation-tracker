import { Loader2 } from "lucide-react";

export function Spinner({ className = "" }) {
  return <Loader2 className={`animate-spin ${className}`} size={18} />;
}

export function Toast({ msg }) {
  if (!msg) return null;
  const tone =
    msg.type === "error"
      ? "bg-red-500/15 text-red-300 border-red-500/30"
      : msg.type === "success"
      ? "bg-accent/15 text-accent-soft border-accent/30"
      : "bg-brand-blue/15 text-brand-blue border-brand-blue/30";
  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-xl border text-sm font-medium shadow-card animate-fade-up ${tone}`}
    >
      {msg.text}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, sub, tone = "accent" }) {
  const toneMap = {
    accent: "text-accent",
    blue: "text-brand-blue",
    purple: "text-brand-purple",
    pink: "text-brand-pink",
    warn: "text-amber-400",
  };
  return (
    <div className="card flex items-center gap-4">
      <div className="shrink-0 grid place-items-center w-11 h-11 rounded-xl bg-white/5 border border-white/10">
        {Icon && <Icon size={20} className={toneMap[tone]} />}
      </div>
      <div className="min-w-0">
        <div className={`text-2xl font-extrabold leading-tight ${toneMap[tone]}`}>{value}</div>
        <div className="text-xs uppercase tracking-wider text-slate-400">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5 truncate">{sub}</div>}
      </div>
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-4">
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="grid place-items-center w-9 h-9 rounded-lg bg-grad-accent text-ink-950">
            <Icon size={18} />
          </div>
        )}
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="text-center py-12 text-slate-400">
      {Icon && <Icon size={36} className="mx-auto mb-3 opacity-50" />}
      <p className="font-semibold text-slate-300">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}
