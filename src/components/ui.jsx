import { Loader2 } from "lucide-react";

export function Spinner({ className = "" }) {
  return <Loader2 className={`animate-spin ${className}`} size={18} />;
}

export function Toast({ msg }) {
  if (!msg) return null;
  const tone =
    msg.type === "error"
      ? "bg-red-500/10 text-red-300 border-red-500/25"
      : msg.type === "success"
      ? "bg-accent/10 text-accent-text border-accent/25"
      : "bg-base-elevated text-text-secondary border-base-border";
  return (
    <div
      className={`fixed bottom-5 left-1/2 -translate-x-1/2 z-50 px-4 py-3 rounded-lg border text-sm font-medium animate-fade-up ${tone}`}
    >
      {msg.text}
    </div>
  );
}

export function StatCard({ icon: Icon, label, value, unit, sub, chip, chipTone = "accent", pips }) {
  const chipMap = {
    accent: "bg-accent/10 text-accent",
    error: "bg-red-500/10 text-red-300",
    muted: "bg-base-elevated text-text-secondary",
  };
  return (
    <div className="card !p-4 flex flex-col justify-between gap-4">
      <div className="flex justify-between items-start">
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-secondary">{label}</span>
        {Icon && <Icon size={18} className="text-accent/60" />}
      </div>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold leading-none text-text-primary tabular-nums">
          {value}
          {unit && <span className="text-base text-text-secondary ml-1">{unit}</span>}
        </span>
        {chip != null && (
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${chipMap[chipTone] || chipMap.accent}`}>
            {chip}
          </span>
        )}
        {pips && (
          <div className="flex gap-1 pb-1">
            {Array.from({ length: pips.total }).map((_, i) => (
              <span key={i} className={`h-1.5 w-3.5 rounded-full ${i < pips.filled ? "bg-accent" : "bg-base-border"}`} />
            ))}
          </div>
        )}
      </div>
      {sub && <div className="text-xs text-text-muted -mt-2 truncate">{sub}</div>}
    </div>
  );
}

export function SectionTitle({ icon: Icon, title, subtitle, right }) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div className="flex items-center gap-2.5">
        {Icon && (
          <div className="grid place-items-center w-8 h-8 rounded-lg bg-accent text-accent-on shadow-glow">
            <Icon size={16} />
          </div>
        )}
        <div>
          <h2 className="section-title">{title}</h2>
          {subtitle && <p className="section-subtitle">{subtitle}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function Empty({ icon: Icon, title, hint }) {
  return (
    <div className="text-center py-12 text-text-secondary">
      {Icon && <Icon size={32} className="mx-auto mb-3 opacity-40" />}
      <p className="font-medium text-text-primary">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}
