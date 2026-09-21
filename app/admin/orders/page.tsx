import Link from "next/link";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../lib/supabase-server";
import AdminDeleteOrderButton from "../../../components/AdminDeleteOrderButton";
import AdminOrderStatusUpdate from "../../../components/AdminOrderStatusUpdate";
import AdminPaymentStatusUpdate from "../../../components/AdminPaymentStatusUpdate";
import AdminDashboardBackButton from "../../../components/AdminDashboardBackButton";
import AdminOrdersPagination from "../../../components/AdminOrdersPagination";

type Order = {
  order_number: number;
  id: string;
  user_id: string;
  status: string;
  total: number;
  shipping_address: Record<string, unknown> | null;
  payment_status: string;
  payment_id: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  payment_method: string;
};

type OrderItem = {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string | null;
  color: string | null;
};

const ORDER_STATUSES = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
];

async function updateOrderStatus(formData: FormData) {
  "use server";

  const orderId = String(formData.get("order_id") ?? "");
  const newStatus = String(formData.get("status") ?? "");

  if (!orderId || !ORDER_STATUSES.includes(newStatus)) {
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
      status: newStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (error) {
    console.error("Error updating order status:", error);
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

async function updatePaymentStatus(formData: FormData) {
  "use server";

  const orderId = String(formData.get("order_id") ?? "");
  const newPaymentStatus = String(
    formData.get("payment_status") ?? ""
  );

  if (
    !orderId ||
    !PAYMENT_STATUSES.includes(newPaymentStatus)
  ) {
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
    .eq("id", orderId);

  if (error) {
    console.error("Error updating payment status:", error);
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}
async function deleteOrder(formData: FormData) {
  "use server";

  const orderId = String(formData.get("order_id") ?? "");

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
    .delete()
    .eq("id", orderId);

  if (error) {
    console.error("Error deleting order:", error);
    return;
  }

  revalidatePath("/admin/orders");
  revalidatePath("/orders");
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const { page: pageParam } = await searchParams;

  const currentPage = Math.max(
    1,
    Number.parseInt(pageParam ?? "1", 10) || 1
  );

  const ORDERS_PER_PAGE = 20;
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

  const {
  data: orders,
  error: ordersError,
  count: totalOrders,
} = await supabase
    .from("orders")
    .select(
  `
        id,
        order_number,
        user_id,
        status,
        total,
        shipping_address,
        payment_status,
        payment_id,
        cancellation_reason,
        created_at,
        updated_at,
        payment_method
      `
      ,
    { count: "exact" }
    )
    .order("created_at", { ascending: false })
.range(
  (currentPage - 1) * ORDERS_PER_PAGE,
  currentPage * ORDERS_PER_PAGE - 1
);

  if (ordersError) {
    console.error("Error loading orders:", ordersError);
  }

  const orderList = (orders ?? []) as Order[];
  const totalPages = Math.max(
  1,
  Math.ceil((totalOrders ?? 0) / ORDERS_PER_PAGE)
);
if (currentPage > totalPages) {
  redirect(`/admin/orders?page=${totalPages}`);
}

  const orderIds = orderList.map((order) => order.id);

  let orderItems: OrderItem[] = [];

  if (orderIds.length > 0) {
    const { data: items, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
          id,
          order_id,
          product_id,
          product_name,
          quantity,
          price,
          size,
          color
        `
      )
      .in("order_id", orderIds);

    if (itemsError) {
      console.error("Error loading order items:", itemsError);
    }

    orderItems = (items ?? []) as OrderItem[];
  }

  function formatDate(dateString: string) {
  let normalized = dateString.trim();

  // PostgreSQL/Supabase may return:
  // 2026-09-20 17:20:03+00
  // 2026-09-20 17:20:03+00:00
  // 2026-09-20T17:20:03+00:00
  // Normalize the PostgreSQL space separator.
  normalized = normalized.replace(" ", "T");

  // If no timezone is included, explicitly treat it as UTC.
  if (
    !normalized.endsWith("Z") &&
    !/[+-]\d{2}:?\d{2}$/.test(normalized) &&
    !/[+-]\d{2}$/.test(normalized)
  ) {
    normalized += "Z";
  }

  // PostgreSQL +00 → JavaScript-compatible +00:00
  normalized = normalized.replace(/([+-]\d{2})$/, "$1:00");
  console.log("ORDER TIME DEBUG:", {
  original: dateString,
  parsed: new Date(dateString).toString(),
  iso: new Date(dateString).toISOString(),
});

  return new Date(normalized).toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

  function formatCurrency(value: number) {
    return `₹${Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "border-green-400/30 bg-green-400/10 text-green-300";

      case "cancelled":
        return "border-red-400/30 bg-red-400/10 text-red-300";

      case "confirmed":
      case "processing":
      case "shipped":
        return "border-blue-400/30 bg-blue-400/10 text-blue-300";

      default:
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }
  }

  function getPaymentStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "paid":
        return "border-green-400/30 bg-green-400/10 text-green-300";

      case "failed":
        return "border-red-400/30 bg-red-400/10 text-red-300";

      case "refunded":
        return "border-purple-400/30 bg-purple-400/10 text-purple-300";

      default:
        return "border-yellow-400/30 bg-yellow-400/10 text-yellow-300";
    }
  }

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
              Order Management
            </h1>
          </div>

          <AdminDashboardBackButton />
        </div>
      </header>

      {/* Main */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/40">
            Orders
          </p>

          <h2 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
            Customer Orders
          </h2>

          <p className="mt-4 text-sm text-white/50">
            View customer orders and manage order and payment status.
          </p>
        </div>

        {/* No orders */}
        {orderList.length === 0 ? (
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/[0.04] p-10 text-center">
            <p className="text-lg font-medium">
              No orders found.
            </p>

            <p className="mt-2 text-sm text-white/40">
              Customer orders will appear here after they place an order.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            {orderList.map((order) => {
              const items = orderItems.filter(
                (item) => item.order_id === order.id
              );

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]"
                >
                  {/* Order Header */}
                  <div className="border-b border-white/10 p-6 md:p-8">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Order ID
                        </p>

                        <p className="mt-2 font-mono text-sm text-white/80">
  #MD-OID-{String(order.order_number).padStart(6, "0")}
</p>

                        <p className="mt-3 text-sm text-white/40">
                          {formatDate(order.created_at)}
                        </p>
                      </div>
                     

                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span
                          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${getPaymentStatusClass(
                            order.payment_status
                          )}`}
                        >
                          PAYMENT: {order.payment_status}
                        </span>

                        <span className="rounded-full border border-white/10 px-4 py-2 text-xs uppercase tracking-widest text-white/50">
                          {order.payment_method}
                        </span>

                        <span className="text-xl font-semibold">
                          {formatCurrency(order.total)}
                        </span>
                        <AdminDeleteOrderButton
  orderId={order.id}
  orderNumber={order.order_number}
  deleteOrder={deleteOrder}
/>
                      </div>
                    </div>
                  </div>

                  {/* Cancellation Reason */}
                  {order.status === "cancelled" &&
                    order.cancellation_reason && (
                      <div className="border-b border-red-400/10 bg-red-400/[0.04] p-6 md:p-8">
                        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                          <p className="text-xs uppercase tracking-[0.2em] text-red-300/70">
                            Customer Cancellation Reason
                          </p>

                          <p className="mt-3 text-base text-red-100">
                            {order.cancellation_reason}
                          </p>
                        </div>
                      </div>
                    )}

                  {/* Status Management */}
                  <div className="grid gap-6 border-b border-white/10 bg-white/[0.02] p-6 md:grid-cols-2 md:p-8">
                    {/* Order Status */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Update Order Status
                      </p>

                      <AdminOrderStatusUpdate
  updateOrderStatus={updateOrderStatus}
  orderId={order.id}
  currentStatus={order.status}
  statuses={ORDER_STATUSES}
/>
                    </div>

                    {/* Payment Status */}
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Update Payment Status
                      </p>

                     <AdminPaymentStatusUpdate
  updatePaymentStatus={updatePaymentStatus}
  orderId={order.id}
  currentPaymentStatus={order.payment_status}
  statuses={PAYMENT_STATUSES}
/>
                    </div>
                  </div>

                  {/* Customer */}
                  <div className="grid gap-6 border-b border-white/10 p-6 md:grid-cols-2 md:p-8">
                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Customer User ID
                      </p>

                      <p className="mt-2 break-all font-mono text-sm text-white/70">
                        {order.user_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Payment Information
                      </p>

                      <p className="mt-2 capitalize">
                        {order.payment_status}
                      </p>

                      {order.payment_id && (
                        <p className="mt-2 break-all font-mono text-xs text-white/40">
                          Reference: {order.payment_id}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  {order.shipping_address && (
                    <div className="border-b border-white/10 p-6 md:p-8">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                        Shipping Address
                      </p>

                      <div className="mt-4 grid gap-4 text-sm text-white/70 sm:grid-cols-2 lg:grid-cols-4">
                        {Object.entries(order.shipping_address).map(
                          ([key, value]) => (
                            <div key={key}>
                              <p className="text-xs capitalize text-white/30">
                                {key.replaceAll("_", " ")}
                              </p>

                              <p className="mt-1">
                                {String(value ?? "")}
                              </p>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Items */}
                  <div className="p-6 md:p-8">
                    <p className="text-xs uppercase tracking-[0.2em] text-orange-500">
                      Order Items
                    </p>

                    <div className="mt-5 space-y-3">
                      {items.length === 0 ? (
                        <p className="text-sm text-white/40">
                          No item details found.
                        </p>
                      ) : (
                        items.map((item) => (
                          <div
                            key={item.id}
                            className="rounded-2xl border border-white/10 bg-black/30 p-5"
                          >
                            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-medium">
                                  {item.product_name}
                                </p>

                                <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm text-white/40">
                                  <span>
                                    Quantity: {item.quantity}
                                  </span>

                                  <span>
                                    Size: {item.size || "—"}
                                  </span>

                                  <span>
                                    Color: {item.color || "—"}
                                  </span>
                                </div>
                              </div>

                              <div className="md:text-right">
                                <p className="font-semibold">
                                  {formatCurrency(item.price)}
                                </p>

                                <p className="mt-1 text-xs text-white/40">
                                  per item
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
           <AdminOrdersPagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </section>
    </main>
  );
}