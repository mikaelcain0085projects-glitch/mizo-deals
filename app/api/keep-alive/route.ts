import { createClient } from "@supabase/supabase-js";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (
    !process.env.CRON_SECRET ||
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    return Response.json(
      {
        success: false,
        error: "Supabase environment variables are missing",
      },
      { status: 500 }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const { error } = await supabase
    .from("enquiries")
    .select("id")
    .limit(1);

  if (error) {
    console.error("Supabase keep-alive error:", error);

    return Response.json(
      {
        success: false,
        error: "Supabase request failed",
      },
      { status: 500 }
    );
  }

  return Response.json({
    success: true,
    message: "Supabase keep-alive successful",
    timestamp: new Date().toISOString(),
  });
}