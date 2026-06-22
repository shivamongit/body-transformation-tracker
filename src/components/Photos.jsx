import { useEffect, useRef, useState } from "react";
import { Camera, Upload, Trash2, ImageIcon } from "lucide-react";
import { fetchPhotos, uploadPhoto, photoUrl, deletePhoto, todayStr } from "../lib/db";
import { SectionTitle, Spinner, Toast, Empty } from "./ui";

const POSES = ["Front", "Side (Left)", "Side (Right)", "Back", "Back-Angle", "Other"];

export default function Photos({ user }) {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState(null);
  const [meta, setMeta] = useState({ pose: "Front", weight: "", taken_on: todayStr() });
  const fileRef = useRef();

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
      toast("Photo uploaded 📸", "success");
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
              value={meta.weight}
              onChange={(e) => setMeta({ ...meta, weight: e.target.value })} />
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
          {uploading ? "Uploading…" : "Choose & Upload Photo"}
        </button>
      </div>

      <div className="card">
        <SectionTitle icon={ImageIcon} title="Your Gallery" />
        {loading ? (
          <div className="flex items-center gap-2 text-slate-400"><Spinner /> Loading…</div>
        ) : photos.length ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((p) => (
              <div key={p.id} className="group relative rounded-xl overflow-hidden border border-white/10">
                <img src={photoUrl(p.storage_path)} alt={p.pose}
                  className="w-full aspect-[3/4] object-cover" loading="lazy" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 text-xs">
                  <div className="font-semibold">{p.pose}</div>
                  <div className="text-slate-300">
                    {p.taken_on}{p.weight != null ? ` · ${p.weight} kg` : ""}
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
          <Empty icon={Camera} title="No photos yet"
            hint="Upload your first progress photo to build a visual timeline." />
        )}
      </div>
    </div>
  );
}
