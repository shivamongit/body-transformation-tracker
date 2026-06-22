import { supabase } from "./supabase";

export function todayStr(d = new Date()) {
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
}

// ---------- Daily logs ----------
export async function fetchLogs() {
  const { data, error } = await supabase
    .from("daily_logs")
    .select("*")
    .order("log_date", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function upsertLog(userId, row) {
  const payload = { user_id: userId, ...row };
  const { error } = await supabase
    .from("daily_logs")
    .upsert(payload, { onConflict: "user_id,log_date" });
  if (error) throw error;
}

// ---------- Goals ----------
export async function fetchGoals() {
  const { data, error } = await supabase
    .from("goals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function addGoal(userId, goal) {
  const { error } = await supabase.from("goals").insert({ user_id: userId, ...goal });
  if (error) throw error;
}

export async function updateGoal(id, patch) {
  const { error } = await supabase.from("goals").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteGoal(id) {
  const { error } = await supabase.from("goals").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Progress photos ----------
const BUCKET = "progress-photos";

export async function fetchPhotos() {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("taken_on", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function uploadPhoto(userId, file, meta = {}) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${Date.now()}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;

  const { error: insErr } = await supabase.from("photos").insert({
    user_id: userId,
    storage_path: path,
    pose: meta.pose || null,
    weight: meta.weight ?? null,
    taken_on: meta.taken_on || todayStr(),
    note: meta.note || null,
  });
  if (insErr) throw insErr;
}

export function photoUrl(path) {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function deletePhoto(photo) {
  await supabase.storage.from(BUCKET).remove([photo.storage_path]);
  const { error } = await supabase.from("photos").delete().eq("id", photo.id);
  if (error) throw error;
}

// ---------- AI plans ----------
export async function fetchPlans() {
  const { data, error } = await supabase
    .from("ai_plans")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function savePlan(userId, plan) {
  const { error } = await supabase.from("ai_plans").insert({ user_id: userId, ...plan });
  if (error) throw error;
}

export async function deletePlan(id) {
  const { error } = await supabase.from("ai_plans").delete().eq("id", id);
  if (error) throw error;
}

// Calls the secure Edge Function (OpenAI key stays server-side).
export async function generatePlan(input) {
  const { data, error } = await supabase.functions.invoke("generate-plan", {
    body: input,
  });
  if (error) throw error;
  return data;
}
