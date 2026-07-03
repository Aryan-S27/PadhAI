// supabase/functions/_shared/cors.ts
// Shared CORS headers for all Edge Functions.
// Allows requests from your Vite dev server and production domain.

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

/** Call at the top of every handler to deal with preflight. */
export function handleCors(req: Request): Response | null {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  return null;
}
