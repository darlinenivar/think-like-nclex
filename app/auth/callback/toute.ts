import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";

// ⚠️ En App Router, este route se ejecuta en el server.
// Pero tu client de supabase probablemente está hecho para client-side.
// Aun así, esto funciona en muchos setups. Si te da error, dímelo y te lo adapto al setup exacto.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") || "/dashboard";

  if (code) {
    // Si tu setup usa PKCE (lo normal), esto crea la sesión
    // En algunos setups puede necesitar createRouteHandlerClient.
    try {
      // @ts-ignore
      await supabase.auth.exchangeCodeForSession(code);
    } catch {
      // si falla, igual redirigimos a reset-password; ahí verás el error y me dices.
    }
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
