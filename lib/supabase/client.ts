import { createClient } from "@supabase/supabase-js";
// Publishable browser configuration supplied by the project owner.
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "https://kbphftwnggadpfbyctve.supabase.co",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "sb_publishable_e5yQwNGx2QjM1nj0vBhnWA_rdLHikaP",
);
