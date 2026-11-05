import { createBrowserClient } from "@supabase/ssr";

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // During Vercel/CI prerender, env may be unset — avoid crashing the build.
  // Runtime still needs real values configured in the Vercel project.
  if (!url || !key) {
    return createBrowserClient("https://placeholder.supabase.co", "public-anon-key");
  }

  return createBrowserClient(url, key);
}
