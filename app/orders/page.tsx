"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../lib/supabase-browser";

type Order = {
  id: string;
  status: string;
  total: number;
  payment_status: string;
  payment_id: string | null;
  payment_method: string;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
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

type OrderWithItems = Order & {
  items: OrderItem[];
};

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Ordered the wrong size",
  "Ordered the wrong product",
  "Found a better option",
  "Order placed by mistake",
  "Other",
];

export default function OrdersPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const [cancellingOrder, setCancellingOrder] = useState<string | null>(
    null
  );
  const [cancellationReason, setCancellationReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  useEffect(() => {
    async function loadOrders() {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/account/login");
        return;
      }

      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select(
          `
            id,
            status,
            total,
            payment_status,
            payment_id,
            payment_method,
            cancellation_reason,
            created_at,
            updated_at
          `
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (orderError) {
        console.error("Error loading orders:", orderError);
        setOrders([]);
        setLoading(false);
        return;
      }

      if (!orderData || orderData.length === 0) {
        setOrders([]);
        setLoading(false);
        return;
      }

      const orderIds = orderData.map((order) => order.id);

      const { data: itemData, error: itemError } = await supabase
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

      if (itemError) {
        console.error("Error loading order items:", itemError);
      }

      const items = itemData ?? [];

      const ordersWithItems: OrderWithItems[] = orderData.map((order) => ({
        ...order,
        items: items.filter((item) => item.order_id === order.id),
      }));

      setOrders(ordersWithItems);
      setLoading(false);
    }

    loadOrders();
  }, [router, supabase]);

  function toggleOrder(orderId: string) {
    setExpandedOrder((current) =>
      current === orderId ? null : orderId
    );
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleString("en-IN", {
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

  function getStatusClass(status: string) {
    switch (status.toLowerCase()) {
      case "completed":
      case "delivered":
        return "border-green-400/30 bg-green-400/10 text-green-300";

      case "cancelled":
      case "canceled":
        return "border-red-400/30 bg-red-400/10 text-red-300";

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
      case "completed":
        return "text-green-300";

      case "failed":
        return "text-red-300";

      default:
        return "text-yellow-300";
    }
  }

  function openCancellation(orderId: string) {
    setCancellingOrder(orderId);
    setCancellationReason("");
    setCustomReason("");
    setCancelError("");
  }

  function closeCancellation() {
    if (cancelling) {
      return;
    }

    setCancellingOrder(null);
    setCancellationReason("");
    setCustomReason("");
    setCancelError("");
  }

  async function handleCancelOrder() {
    if (!cancellingOrder) {
      return;
    }

    const finalReason =
      cancellationReason === "Other"
        ? customReason.trim()
        : cancellationReason;

    if (!finalReason) {
      setCancelError("Please select or enter a cancellation reason.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmed) {
      return;
    }

    setCancelling(true);
    setCancelError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.replace("/account/login");
      return;
    }

    const { data: currentOrder, error: orderCheckError } =
      await supabase
        .from("orders")
        .select("id, status")
        .eq("id", cancellingOrder)
        .eq("user_id", user.id)
        .maybeSingle();

    if (orderCheckError || !currentOrder) {
      setCancelError("Unable to find this order.");
      setCancelling(false);
      return;
    }

    if (
      currentOrder.status !== "pending" &&
      currentOrder.status !== "confirmed"
    ) {
      setCancelError(
        "This order can no longer be cancelled."
      );
      setCancelling(false);
      return;
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "cancelled",
        cancellation_reason: finalReason,
        updated_at: new Date().toISOString(),
      })
      .eq("id", cancellingOrder)
      .eq("user_id", user.id);

    if (updateError) {
      console.error(
        "Error cancelling order:",
        updateError
      );

      setCancelError(
        updateError.message ||
          "Unable to cancel the order."
      );
      setCancelling(false);
      return;
    }

    setOrders((currentOrders) =>
      currentOrders.map((order) =>
        order.id === cancellingOrder
          ? {
              ...order,
              status: "cancelled",
              cancellation_reason: finalReason,
              updated_at: new Date().toISOString(),
            }
          : order
      )
    );

    setCancellingOrder(null);
    setCancellationReason("");
    setCustomReason("");
    setCancelling(false);
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm tracking-[0.3em] text-white/50">
          LOADING ORDERS...
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div>
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            My Orders
          </h1>

          <p className="mt-5 text-white/50">
            View your orders and track their current status.
          </p>
        </div>

        {/* Navigation */}
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/account"
            className="rounded-full border border-white/20 px-6 py-3 text-sm tracking-widest transition hover:border-white hover:bg-white hover:text-black"
          >
            BACK TO ACCOUNT
          </Link>

          <Link
            href="/shop"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {/* No orders */}
        {orders.length === 0 ? (
          <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 p-10 text-center">
            <p className="text-xl font-medium">
              No orders yet.
            </p>

            <p className="mt-3 text-white/50">
              Your orders will appear here after you place your first
              order.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-white px-7 py-3 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
            >
              SHOP NOW
            </Link>
          </div>
        ) : (
          <div className="mt-12 space-y-5">
            {orders.map((order) => {
              const isExpanded = expandedOrder === order.id;

              const canCancel =
                order.status === "pending" ||
                order.status === "confirmed";

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-white/5"
                >
                  {/* Order summary */}
                  <button
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    className="w-full p-6 text-left transition hover:bg-white/[0.07] md:p-8"
                  >
                    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Order
                        </p>

                        <p className="mt-2 break-all font-mono text-sm text-white/80">
                          #{order.id}
                        </p>

                        <p className="mt-3 text-sm text-white/40">
                          {formatDate(order.created_at)}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4">
                        <span
                          className={`rounded-full border px-4 py-2 text-xs uppercase tracking-widest ${getStatusClass(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>

                        <span className="text-xl font-semibold">
                          {formatCurrency(order.total)}
                        </span>

                        <span className="text-white/40">
                          {isExpanded ? "−" : "+"}
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* Expanded order details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 px-6 py-6 md:px-8 md:py-8">
                      {/* Order status */}
                      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Order Status
                          </p>

                          <p className="mt-2 capitalize">
                            {order.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Payment Method
                          </p>

                          <p className="mt-2 uppercase">
                            {order.payment_method}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Payment Status
                          </p>

                          <p
                            className={`mt-2 capitalize ${getPaymentStatusClass(
                              order.payment_status
                            )}`}
                          >
                            {order.payment_status}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Total
                          </p>

                          <p className="mt-2 font-semibold">
                            {formatCurrency(order.total)}
                          </p>
                        </div>
                      </div>

                      {/* Cancellation information */}
                      {order.status === "cancelled" &&
                        order.cancellation_reason && (
                          <div className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                            <p className="text-xs uppercase tracking-[0.2em] text-red-300/70">
                              Cancellation Reason
                            </p>

                            <p className="mt-2 text-sm text-red-100">
                              {order.cancellation_reason}
                            </p>
                          </div>
                        )}

                      {/* Cancel Order */}
                      {canCancel && (
                        <div className="mt-8 border-t border-white/10 pt-8">
                          {cancellingOrder === order.id ? (
                            <div className="rounded-2xl border border-red-400/20 bg-red-400/5 p-5">
                              <p className="text-sm font-medium">
                                Cancel this order
                              </p>

                              <p className="mt-1 text-sm text-white/40">
                                Please tell us why you want to cancel
                                this order.
                              </p>

                              <div className="mt-5">
                                <label className="text-xs uppercase tracking-[0.2em] text-white/40">
                                  Reason
                                </label>

                                <select
                                  value={cancellationReason}
                                  onChange={(event) =>
                                    setCancellationReason(
                                      event.target.value
                                    )
                                  }
                                  className="mt-2 w-full rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none focus:border-white/40"
                                >
                                  <option
                                    value=""
                                    className="bg-black"
                                  >
                                    Select a reason
                                  </option>

                                  {CANCELLATION_REASONS.map(
                                    (reason) => (
                                      <option
                                        key={reason}
                                        value={reason}
                                        className="bg-black"
                                      >
                                        {reason}
                                      </option>
                                    )
                                  )}
                                </select>
                              </div>

                              {cancellationReason === "Other" && (
                                <div className="mt-4">
                                  <label className="text-xs uppercase tracking-[0.2em] text-white/40">
                                    Your reason
                                  </label>

                                  <textarea
                                    value={customReason}
                                    onChange={(event) =>
                                      setCustomReason(
                                        event.target.value
                                      )
                                    }
                                    placeholder="Enter your cancellation reason..."
                                    rows={3}
                                    maxLength={500}
                                    className="mt-2 w-full resize-none rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/40"
                                  />
                                </div>
                              )}

                              {cancelError && (
                                <p className="mt-4 text-sm text-red-300">
                                  {cancelError}
                                </p>
                              )}

                              <div className="mt-5 flex flex-wrap gap-3">
                                <button
                                  type="button"
                                  onClick={handleCancelOrder}
                                  disabled={cancelling}
                                  className="rounded-full bg-red-500 px-6 py-3 text-sm font-semibold tracking-widest text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                  {cancelling
                                    ? "CANCELLING..."
                                    : "CONFIRM CANCELLATION"}
                                </button>

                                <button
                                  type="button"
                                  onClick={closeCancellation}
                                  disabled={cancelling}
                                  className="rounded-full border border-white/20 px-6 py-3 text-sm tracking-widest transition hover:border-white disabled:opacity-50"
                                >
                                  KEEP ORDER
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                openCancellation(order.id)
                              }
                              className="rounded-full border border-red-500/30 px-6 py-3 text-sm tracking-widest text-red-300 transition hover:border-red-400 hover:bg-red-500/10"
                            >
                              CANCEL ORDER
                            </button>
                          )}
                        </div>
                      )}

                      {/* UPI payment ID */}
                      {order.payment_id && (
                        <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                            Payment Reference
                          </p>

                          <p className="mt-2 break-all font-mono text-sm text-white/80">
                            {order.payment_id}
                          </p>
                        </div>
                      )}

                      {/* Products */}
                      <div className="mt-8">
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                          Items
                        </p>

                        <div className="mt-4 space-y-3">
                          {order.items.length === 0 ? (
                            <p className="text-sm text-white/40">
                              No item details available.
                            </p>
                          ) : (
                            order.items.map((item) => (
                              <div
                                key={item.id}
                                className="rounded-2xl border border-white/10 bg-black/30 p-4"
                              >
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                  <div>
                                    <p className="font-medium">
                                      {item.product_name}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-white/40">
                                      <span>
                                        Quantity: {item.quantity}
                                      </span>

                                      {item.size && (
                                        <span>
                                          Size: {item.size}
                                        </span>
                                      )}

                                      {item.color && (
                                        <span>
                                          Color: {item.color}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  <div className="text-left md:text-right">
                                    <p className="font-medium">
                                      {formatCurrency(item.price)}
                                    </p>

                                    <p className="mt-1 text-xs text-white/40">
                                      each
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}