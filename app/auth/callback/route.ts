import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { supabaseServer } from "@/lib/supabase/server";

// Menangani tautan dari email: konfirmasi pendaftaran dan atur ulang kata sandi.
// Mendukung alur PKCE (?code=) dan token_hash (?token_hash=&type=).
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const rawNext = url.searchParams.get("next") || "/akun";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/akun";

  const supabase = await supabaseServer();
  let ok = false;
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    ok = !error;
  } else if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    ok = !error;
  }

  if (ok) return NextResponse.redirect(new URL(type === "recovery" ? "/akun/sandi-baru" : next, url.origin));

  const desc = url.searchParams.get("error_description");
  const back = new URL("/akun/masuk", url.origin);
  back.searchParams.set("galat", desc ? "tautan" : "konfirmasi");
  return NextResponse.redirect(back);
}
