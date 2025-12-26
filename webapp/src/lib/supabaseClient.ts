import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

// Create Supabase client with realtime enabled
export const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: {
          params: {
            eventsPerSecond: 10,
          },
        },
      })
    : null;

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseKey && supabase);
};

// Log configuration status in development
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  if (!isSupabaseConfigured()) {
    console.warn(
      "⚠️ Supabase not configured. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local",
    );
    console.info("📖 See supabase/README.md for setup instructions");
  } else {
    console.info("✅ Supabase configured and ready");
  }
}

