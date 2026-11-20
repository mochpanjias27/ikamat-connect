// Kunci publishable aman berada di kode klien; akses data dijaga oleh RLS di database.
// Nilai di Vercel (Environment Variables) diutamakan bila tersedia.
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://amrjmixkrzjgwhabtvtk.supabase.co";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_iBmoLPujXmj3i3jboyrRbw_16nyRGxF";
