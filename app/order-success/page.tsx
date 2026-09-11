import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";

type OrderItem = {
  id: string;
  product_name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type Order = {
  id: string;
  status: string;
  total: number;
  shipping_address: {
    full_name?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  payment_status: string;
  created_at: string;
};

export default async function OrderSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { order: orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  const { data: orderData, error: orderError } =
    await supabase
      .from("orders")
      .select(`
        id,
        status,
        total,
        shipping_address,
        payment_status,
        created_at
      `)
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle();

  if (orderError || !orderData) {
    notFound();
  }

  const { data: itemsData, error: itemsError } =
    await supabase
      .from("order_items")
      .select(`
        id,
        product_name,
        quantity,
        price,
        size,
        color
      `)
      .eq("order_id", orderId)
      .order("created_at", {
        ascending: true,
      });

  if (itemsError) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Order Confirmed
          </h1>

          <p className="mt-6 text-red-300">
            Your order was created, but we could not load
            the order items.
          </p>

          <Link
            href="/account"
            className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black"
          >
            MY ACCOUNT
          </Link>
        </div>
      </main>
    );
  }

  const order = orderData as Order;
  const orderItems = (itemsData ?? []) as OrderItem[];
  const shippingAddress = order.shipping_address ?? {};

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-green-500/40 bg-green-500/10 text-2xl text-green-300">
            ✓
          </div>

          <p className="mt-8 text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Order Confirmed
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-white/50">
            Thank you for your order
            {shippingAddress.full_name
              ? `, ${shippingAddress.full_name}`
              : ""}
            . Your Cash on Delivery order has been
            received.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Order Information */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Order Information
            </p>

            <div className="mt-6 space-y-5">
              <div>
                <p className="text-sm text-white/40">
                  Order ID
                </p>

                <p className="mt-1 break-all font-mono text-sm">
                  {order.id}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/40">
                  Payment
                </p>

                <p className="mt-1 font-medium">
                  Cash on Delivery
                </p>
              </div>

              <div>
                <p className="text-sm text-white/40">
                  Payment Status
                </p>

                <p className="mt-1 capitalize text-yellow-300">
                  {order.payment_status}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/40">
                  Order Status
                </p>

                <p className="mt-1 capitalize">
                  {order.status}
                </p>
              </div>
            </div>
          </section>

          {/* Delivery Information */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Delivery Information
            </p>

            <div className="mt-6 space-y-2 text-white/70">
              <p className="font-medium text-white">
                {shippingAddress.full_name}
              </p>

              <p>{shippingAddress.phone}</p>

              <p>{shippingAddress.address}</p>

              <p>
                {shippingAddress.city},{" "}
                {shippingAddress.state}
              </p>

              <p>{shippingAddress.pincode}</p>
            </div>
          </section>
        </div>

        {/* Order Items */}
        <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/40">
            Order Items
          </p>

          <div className="mt-6 divide-y divide-white/10">
            {orderItems.map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-4 py-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <h2 className="font-medium">
                    {item.product_name}
                  </h2>

                  <p className="mt-2 text-sm text-white/50">
                    {item.size &&
                      `Size: ${item.size}`}
                    {item.size &&
                      item.color &&
                      " • "}
                    {item.color &&
                      `Color: ${item.color}`}
                  </p>

                  <p className="mt-1 text-sm text-white/50">
                    Quantity: {item.quantity}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="font-medium">
                    ₹
                    {(
                      item.price * item.quantity
                    ).toFixed(2)}
                  </p>

                  <p className="mt-1 text-xs text-white/40">
                    ₹{item.price.toFixed(2)} each
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t border-white/10 pt-6">
            <div className="flex items-center justify-between text-xl font-semibold">
              <span>Total</span>

              <span>
                ₹{order.total.toFixed(2)}
              </span>
            </div>
          </div>
        </section>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/account"
            className="rounded-full border border-white/20 px-8 py-4 text-center text-sm tracking-widest transition hover:border-white"
          >
            MY ACCOUNT
          </Link>

          <Link
            href="/shop"
            className="rounded-full bg-white px-8 py-4 text-center text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </div>
    </main>
  );
}