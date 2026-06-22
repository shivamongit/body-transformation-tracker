import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Upload, Trash2, ImageIcon } from "lucide-react";
import { fetchPhotos, uploadPhoto, photoUrl, deletePhoto, todayStr } from "../lib/db";
import { SectionTitle, Spinner, Toast, Empty } from "./ui";

const POSES = ["Front", "Side (Left)", "Side (Right)", "Back", "Back-Angle", "Other"];
const FILTERS = ["All", "Front", "Side", "Back"];

export default function Photos({ user }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [filter, setFilter] = useState("All");
  const [meta, setMeta] = useState({ pose: "Front", weight: "", taken_on: todayStr() });
  const fileRef = useRef();

  const filtered = useMemo(() => {
    if (filter === "All") return photos;
    return photos.filter((p) => (p.pose || "").toLowerCase().includes(filter.toLowerCase()));
  }, [photos, filter]);

  const toast = (text, type = "info") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  async function load() {
    try { setPhotos(await fetchPhotos()); }
    catch (e) { toast(e.message, "error"); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function onFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadPhoto(user.id, file, {
        pose: meta.pose,
        weight: meta.weight === "" ? null : Number(meta.weight),
        taken_on: meta.taken_on,
      });
      toast("Photo uploaded", "success");
      load();
    } catch (e) {
      toast(e.message.includes("Bucket") ? "Create a public 'progress-photos' storage bucket in Supabase first." : e.message, "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function remove(p) {
    try { await deletePhoto(p); load(); }
    catch (e) { toast(e.message, "error"); }
  }

  return (
    <div className="space-y-6">
      <Toast msg={msg} />

      <div className="card">
        <SectionTitle icon={Camera} title="Add Progress Photo"
          subtitle="Track your visual change over time. Same pose + lighting works best." />
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="label">Pose</label>
            <select className="input" value={meta.pose}
              onChange={(e) => setMeta({ ...meta, pose: e.target.value })}>
              {POSES.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input className="input" type="number" step="0.1" placeholder="optional"
              value={meta.weight} onChange={(e) => setMeta({ ...meta, weight: e.target.value })} />
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={meta.taken_on}
              onChange={(e) => setMeta({ ...meta, taken_on: e.target.value })} />
          </div>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
        <button className="btn-primary w-full mt-4" disabled={uploading}
          onClick={() => fileRef.current?.click()}>
          {uploading ? <Spinner /> : <Upload size={18} />}
          {uploading ? "Uploading…" : "Upload Photo"}
        </button>
      </div>

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="grid place-items-center w-8 h-8 rounded-lg bg-accent text-accent-on shadow-glow">
              <ImageIcon size={16} />
            </div>
            <div>
              <h2 className="section-title">Your Gallery</h2>
              <p className="section-subtitle">Tap a filter to narrow by pose.</p>
            </div>
          </div>
          <div className="flex bg-base-lowest p-1 rounded-lg border border-base-border self-start">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-xs font-bold rounded-md transition-all ${
                  filter === f ? "bg-accent text-accent-on" : "text-text-secondary hover:text-text-primary"
                }`}>
                {f}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-text-secondary"><Spinner /> Loading…</div>
        ) : filtered.length ? (
          <div className="columns-2 sm:columns-3 gap-3 [column-fill:_balance]">
            {filtered.map((p) => (
              <div key={p.id}
                className="group relative mb-3 break-inside-avoid rounded-xl overflow-hidden border border-base-border bg-base-surface transition-all hover:scale-[1.02] hover:z-10">
                <img src={photoUrl(p.storage_path)} alt={p.pose}
                  className="w-full h-auto object-cover" loading="lazy" />
                <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex justify-between items-end gap-2">
                    <div className="min-w-0">
                      <p className="text-white font-semibold text-sm">{p.taken_on}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-accent/15 text-accent text-[10px] font-bold uppercase tracking-widest border border-accent/25">
                        {p.pose}
                      </span>
                    </div>
                    {p.weight != null && (
                      <p className="text-accent font-bold text-sm shrink-0">{p.weight} kg</p>
                    )}
                  </div>
                </div>
                <button onClick={() => remove(p)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/60 text-red-400 opacity-0 group-hover:opacity-100 transition">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Empty icon={Camera} title={photos.length ? "No photos in this view" : "No photos yet"}
            hint={photos.length ? "Try a different filter." : "Upload your first progress photo."} />
        )}
      </div>
    </div>
  );
}
