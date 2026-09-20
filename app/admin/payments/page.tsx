import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase-server";

type PaymentOrder = {
  id: string;
  user_id: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_id: string | null;
  created_at: string;
  updated_at: string;
};

async function updateUpiPaymentStatus(
  formData: FormData,
  newPaymentStatus: "paid" | "failed"
) {
  "use server";

  const orderId = String(formData.get("order_id") ?? "").trim();

  if (!orderId) {
    return;
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/");
  }

  const { error } = await supabase
    .from("orders")
    .update({
      payment_status: newPaymentStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("payment_method", "upi")
    .eq("payment_status", "pending")
    .not("payment_id", "is", null);

  if (error) {
    console.error("Error updating UPI payment:", error);
    return;
  }

  revalidatePath("/admin/payments");
  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

async function verifyPayment(formData: FormData) {
  "use server";

  await updateUpiPaymentStatus(formData, "paid");
}

async function rejectPayment(formData: FormData) {
  "use server";

  await updateUpiPaymentStatus(formData, "failed");
}

export default async function AdminPaymentsPage() {
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

  if (
    profileError ||
    !profile ||
    profile.role !== "admin"
  ) {
    redirect("/");
  }

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select(`
      id,
      user_id,
      total,
      status,
      payment_status,
      payment_method,
      payment_id,
      created_at,
      updated_at
    `)
    .eq("payment_method", "upi")
    .not("payment_id", "is", null)
    .eq("payment_status", "pending")
    .order("created_at", { ascending: false });

  if (ordersError) {
    console.error("Error loading UPI payments:", ordersError);
  }

  const paymentOrders = (orders ?? []) as PaymentOrder[];

  function formatDate(dateString: string) {
  const utcDate = dateString.endsWith("Z")
    ? dateString
    : `${dateString}Z`;

  return new Date(utcDate).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

  function formatCurrency(value: number) {
    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  return (
    <main className="min-h-screen bg-black px-6 py-12 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
              Payments
            </p>

            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
              UPI Verification
            </h1>

            <p className="mt-4 max-w-2xl text-sm leading-6 text-white/50">
              Review customer-submitted UTR numbers and verify payments
              against your actual UPI transaction records.
            </p>
          </div>

          <Link
            href="/admin"
            className="inline-flex w-fit rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-white/70 transition hover:bg-white hover:text-black"
          >
            ← ADMIN DASHBOARD
          </Link>
        </div>

        <div className="mt-10 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <p className="text-sm font-semibold text-yellow-200">
            Manual verification required
          </p>

          <p className="mt-2 text-sm leading-6 text-yellow-100/60">
            A submitted UTR is only a payment reference. Confirm the
            transaction in your bank or UPI records before marking it as paid.
          </p>
        </div>

        <div className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Awaiting verification
              </p>

              <p className="mt-2 text-2xl font-semibold">
                {paymentOrders.length}
              </p>
            </div>
          </div>

          {paymentOrders.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
              <p className="text-sm uppercase tracking-[0.15em] text-white/50">
                No UPI payments awaiting verification
              </p>

              <p className="mt-3 text-sm text-white/30">
                New submitted UPI payment references will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {paymentOrders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-6"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
                          UPI PAYMENT
                        </p>

                        <span className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-xs text-yellow-300">
                          PENDING
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-semibold">
                        {formatCurrency(order.total)}
                      </h2>

                      <div className="mt-5 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                            Order ID
                          </p>

                          <p className="mt-2 break-all text-sm text-white/70">
                            {order.id}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                            Submitted
                          </p>

                          <p className="mt-2 text-sm text-white/70">
                            {formatDate(order.updated_at)}
                          </p>
                        </div>
                      </div>

                      <div className="mt-5 rounded-xl border border-white/10 bg-black/30 p-4">
                        <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                          Customer UTR / Transaction Reference
                        </p>

                        <p className="mt-2 break-all font-mono text-sm font-medium text-white">
                          {order.payment_id}
                        </p>
                      </div>

                      <div className="mt-4 text-xs text-white/30">
                        Order created: {formatDate(order.created_at)}
                      </div>
                    </div>

                    <div className="flex flex-col justify-center gap-3 lg:min-w-[190px]">
                      <form action={verifyPayment}>
                        <input
                          type="hidden"
                          name="order_id"
                          value={order.id}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-full bg-white px-5 py-3 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-white/90"
                        >
                          VERIFY PAYMENT
                        </button>
                      </form>

                      <form action={rejectPayment}>
                        <input
                          type="hidden"
                          name="order_id"
                          value={order.id}
                        />

                        <button
                          type="submit"
                          className="w-full rounded-full border border-red-400/30 bg-red-400/10 px-5 py-3 text-xs font-semibold tracking-[0.15em] text-red-300 transition hover:bg-red-400/20"
                        >
                          REJECT PAYMENT
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10">
          <Link
            href="/admin/orders"
            className="inline-flex rounded-full border border-white/20 px-6 py-3 text-xs font-semibold tracking-[0.15em] text-white/60 transition hover:bg-white hover:text-black"
          >
            VIEW ALL ORDERS →
          </Link>
        </div>
      </div>
    </main>
  );
}