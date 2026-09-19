import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const code = searchParams.get("code");
  const next = searchParams.get("next");

  if (code) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },

          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch {
              // Cookie setting can fail in some server contexts.
            }
          },
        },
      }
    );

    const { data, error } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      const { data: profile, error: profileError } =
        await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .maybeSingle();

      if (profileError) {
        await supabase.auth.signOut();

        return NextResponse.redirect(
          `${origin}/admin/login?error=profile_check_failed`
        );
      }

      if (next === "/admin") {
        if (!profile || profile.role !== "admin") {
          await supabase.auth.signOut();

          return NextResponse.redirect(
            `${origin}/admin/login?error=admin_access_denied`
          );
        }

        return NextResponse.redirect(`${origin}/admin`);
      }

      return NextResponse.redirect(`${origin}/account`);
    }
  }

  return NextResponse.redirect(
    `${origin}/account/login?error=auth_callback_failed`
  );
}