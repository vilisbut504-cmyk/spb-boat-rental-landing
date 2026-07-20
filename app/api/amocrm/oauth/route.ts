import { NextResponse } from "next/server";

/**
 * Redirect URI placeholder for the amoCRM integration settings.
 * Does not accept, store, or return tokens.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "amocrm-callback",
    message: "amoCRM integration endpoint is available",
  });
}
