import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { safeNext } from "@/lib/redirects";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Lien de confirmation d'e-mail Supabase (flux PKCE "code" ou "token_hash").
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const next = safeNext(searchParams.get("suite"));
  const supabase = await createSupabaseServerClient();

  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const { error } = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : { error: new Error("Lien invalide") };

  if (error) return NextResponse.redirect(`${origin}/connexion?erreur=lien`);
  return NextResponse.redirect(`${origin}${next}`);
}
