import AdminEnquiries from "../../../components/AdminEnquiries";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";

export default async function AdminEnquiriesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: enquiries, error } = await supabase
    .from("enquiries")
    .select(
      "id, name, email, phone, subject, message, status, created_at, updated_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              MIZO DEALS
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Customer Enquiries
            </h1>
          </div>

          <Link
            href="/admin"
            className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-white/70 transition hover:border-orange-400/40 hover:bg-white/[0.08] hover:text-white"
          >
            ← DASHBOARD
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Inbox
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Customer messages.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
            View questions, requests, and messages submitted through the MIZO
            DEALS enquiry form.
          </p>
        </div>

        {error ? (
          <div className="mt-10 rounded-2xl border border-red-400/20 bg-red-400/5 p-6">
            <p className="text-sm text-red-300">
              Failed to load enquiries.
            </p>
            <p className="mt-2 text-xs text-white/40">
              {error.message}
            </p>
          </div>
        ) : enquiries && enquiries.length > 0 ? (
  <AdminEnquiries enquiries={enquiries} />
) : (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <p className="text-sm text-white/50">
              No customer enquiries yet.
            </p>
          </div>
        )}
      </section>
    </main>
  );
}