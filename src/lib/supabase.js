import { createClient } from "@supabase/supabase-js";

// The anon / publishable key is designed to be public (protected by RLS).
// Falls back to the project defaults so no env setup is needed to deploy.
const url =
  import.meta.env.VITE_SUPABASE_URL ||
  "https://tipfzlfrbpeybvupqebn.supabase.co";
const anonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "sb_publishable_zk11d8pGtGy020nxov1gMg_nH_ao6yW";

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Ensures there is always a (guest) user so RLS + storage work with no login UI.
export async function ensureGuestSession() {
  const { data } = await supabase.auth.getSession();
  if (data.session) return data.session.user;
  const { data: anon, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  return anon.user;
}
