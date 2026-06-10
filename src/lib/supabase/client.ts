import { createBrowserClient } from "@supabase/ssr";

// Instantiates a secure, reactive client singleton for client-side pages and realtime streams
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
);
