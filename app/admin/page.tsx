import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";
import AdminLogout from "../../components/AdminLogout";
import AdminNavLink from "../../components/AdminNavLink";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // User must be logged in
  if (!user) {
    redirect("/account/login");
  }

  // Check the user's profile role
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("full_name, role")
    .eq("id", user.id)
    .maybeSingle();

   // Profile must exist and user must be an admin
  if (error || !profile || profile.role !== "admin") {
    redirect("/");
  }

  const { data: latestProduct } = await supabase
    .from("products")
    .select("id, name, images")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const latestProductImage =
    Array.isArray(latestProduct?.images) &&
    latestProduct.images.length > 0 &&
    typeof latestProduct.images[0]?.url === "string"
      ? latestProduct.images[0].url
      : null;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              MIZO DEALS
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-5">
  <div className="text-right">
    <p className="text-sm text-white/70">
      {profile.full_name || "Administrator"}
    </p>

    <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/40">
      Administrator
    </p>
  </div>

  <AdminLogout />
</div>
        </div>
      </header>

      {/* Dashboard */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Control Center
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Welcome back.
          </h2>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
            Manage your MIZO DEALS store, products, orders, customers, and
            payments from one place.
          </p>
        </div>

        {/* Dashboard cards */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <AdminNavLink
            href="/admin/products"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/25 hover:bg-white/[0.07]"
          >
                        <div className="flex items-center gap-4">
              {latestProductImage ? (
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                  <Image
                    src={latestProductImage}
                    alt={latestProduct?.name || "Product"}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-lg text-white/30">
                  👕
                </div>
              )}

              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                Products
              </p>
            </div>

            <h3 className="mt-3 text-xl font-semibold">
              Product Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Add, edit, and manage products, prices, stock, sizes, colours,
              and images.
            </p>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/60 transition group-hover:text-white">
              OPEN →
            </p>
          </AdminNavLink>

          <AdminNavLink
            href="/admin/orders"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/25 hover:bg-white/[0.07]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Orders
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              Order Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              View customer orders and manage their order status.
            </p>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/60 transition group-hover:text-white">
              OPEN →
            </p>
         </AdminNavLink>

         <AdminNavLink
            href="/admin/payments"
            className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:border-white/25 hover:bg-white/[0.07]"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Payments
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              UPI Verification
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Review submitted UTR numbers and verify UPI payments.
            </p>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/60 transition group-hover:text-white">
              OPEN →
            </p>
         </AdminNavLink>

         <AdminNavLink
  href="/admin/enquiries"
  className="group rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:-translate-y-1 hover:border-orange-400/30 hover:bg-white/[0.07]"
>
  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
    Enquiries
  </p>

  <h3 className="mt-3 text-xl font-semibold">
    Customer Enquiries
  </h3>

  <p className="mt-2 text-sm leading-6 text-white/50">
    View and manage questions, requests, and messages from customers.
  </p>

  <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/60 transition group-hover:text-orange-300">
    OPEN →
  </p>
</AdminNavLink>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Categories
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              Category Management
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Manage Men, Women, Kids, Accessories, and future categories.
            </p>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/30">
              COMING NEXT
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Store
            </p>

            <h3 className="mt-3 text-xl font-semibold">
              Store Settings
            </h3>

            <p className="mt-2 text-sm leading-6 text-white/50">
              Configure store information and other administrative settings.
            </p>

            <p className="mt-6 text-xs font-semibold tracking-[0.15em] text-white/30">
              COMING NEXT
            </p>
          </div>
        </div>

        {/* Quick navigation */}
        <div className="mt-10 flex flex-wrap gap-4">
          <Link
            href="/"
            className="rounded-full border border-white/15 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            STORE HOME
          </Link>

          <Link
            href="/shop"
            className="rounded-full border border-white/15 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            VIEW SHOP
          </Link>

          <Link
            href="/account"
            className="rounded-full border border-white/15 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            MY ACCOUNT
          </Link>
        </div>
      </section>
    </main>
  );
}