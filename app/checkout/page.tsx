"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import UpiPayment from "../../components/UpiPayment";
import { createClient } from "../../lib/supabase-browser";

type PaymentMethod = "cod" | "upi";

type CartProduct = {
  id: string;
  name: string;
  price: number;
  sale_price: number | null;
  images: unknown;
  stock: number;
};

type CartItem = {
  id: string;
  quantity: number;
  size: string;
  color: string;
  product: CartProduct | null;
};

type ShippingForm = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
};

export default function CheckoutPage() {
    const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod>("cod");
    const [placingOrder, setPlacingOrder] = useState(false);
const [orderError, setOrderError] = useState("");


  const [shipping, setShipping] = useState<ShippingForm>({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  useEffect(() => {
    async function loadCheckout() {
      setError("");

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
       router.push("/account/login");
        return;
      }

      const { data: cart, error: cartError } =
        await supabase
          .from("cart")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (cartError) {
        setError(cartError.message);
        setLoading(false);
        return;
      }

      if (!cart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const { data: items, error: itemsError } =
        await supabase
          .from("cart_items")
          .select(`
            id,
            quantity,
            size,
            color,
            product:products (
              id,
              name,
              price,
              sale_price,
              images,
              stock
            )
          `)
          .eq("cart_id", cart.id)
          .order("created_at", {
            ascending: false,
          });

      if (itemsError) {
        setError(itemsError.message);
        setLoading(false);
        return;
      }

      const validItems = (items ?? [])
        .filter((item) => item.product !== null)
        .map((item) => ({
          ...item,
          product: item.product as unknown as CartProduct,
        })) as CartItem[];

      setCartItems(validItems);

      setShipping((current) => ({
        ...current,
        fullName:
          user.user_metadata?.full_name ??
          current.fullName,
        phone:
          user.user_metadata?.phone ??
          current.phone,
      }));

      setLoading(false);
    }

    loadCheckout();
    }, [router, supabase]);

  function updateShipping(
    field: keyof ShippingForm,
    value: string
  ) {
    setShipping((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function getItemPrice(product: CartProduct) {
    return product.sale_price !== null &&
      product.sale_price < product.price
      ? product.sale_price
      : product.price;
  }

  const subtotal = cartItems.reduce(
    (total, item) => {
      if (!item.product) {
        return total;
      }

      return (
        total +
        getItemPrice(item.product) * item.quantity
      );
    },
    0
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <p className="text-sm tracking-[0.3em] text-white/50">
          LOADING CHECKOUT...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold">
            Checkout
          </h1>

          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-300">
              Unable to load checkout.
            </p>

            <p className="mt-2 text-sm text-white/50">
              {error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Checkout
          </h1>

          <p className="mt-6 text-white/50">
            Your cart is empty. Add some products before
            proceeding to checkout.
          </p>

          <Link
            href="/shop"
            className="mt-10 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
          >
            SHOP NOW
          </Link>
        </div>
      </main>
    );
  }
async function handlePlaceCodOrder() {
  setOrderError("");

  if (
    !shipping.fullName ||
    !shipping.phone ||
    !shipping.address ||
    !shipping.city ||
    !shipping.state ||
    !shipping.pincode
  ) {
    setOrderError(
      "Please complete all delivery information before placing your order."
    );
    return;
  }

  setPlacingOrder(true);

  const {
    data: orderId,
    error: orderError,
  } = await supabase.rpc("place_cod_order", {
    p_shipping_address: {
      full_name: shipping.fullName,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      pincode: shipping.pincode,
    },
  });

  if (orderError) {
    setOrderError(orderError.message);
    setPlacingOrder(false);
    return;
  }

  if (!orderId) {
    setOrderError(
      "The order could not be created. Please try again."
    );
    setPlacingOrder(false);
    return;
  }

  router.push(`/order-success?order=${orderId}`);
}
async function handleContinueToUpi() {
  setOrderError("");

  if (
    !shipping.fullName ||
    !shipping.phone ||
    !shipping.address ||
    !shipping.city ||
    !shipping.state ||
    !shipping.pincode
  ) {
    setOrderError(
      "Please complete all delivery information before continuing to UPI."
    );
    return;
  }

  setPlacingOrder(true);

  const {
    data: orderId,
    error: orderError,
  } = await supabase.rpc("place_upi_order", {
    p_shipping_address: {
      full_name: shipping.fullName,
      phone: shipping.phone,
      address: shipping.address,
      city: shipping.city,
      state: shipping.state,
      pincode: shipping.pincode,
    },
  });

  if (orderError) {
    setOrderError(orderError.message);
    setPlacingOrder(false);
    return;
  }

  if (!orderId) {
    setOrderError(
      "The UPI order could not be created. Please try again."
    );
    setPlacingOrder(false);
    return;
  }

  setPlacingOrder(false);
router.push(`/upi-payment?order=${orderId}`);
  setOrderError("");
}
  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Checkout
          </h1>

          <p className="mt-5 text-white/50">
            Enter your delivery details and choose your
            payment method.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          {/* Shipping Details */}
          <section className="rounded-2xl border border-white/10 bg-white/5 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Delivery Information
            </p>

            <h2 className="mt-3 text-2xl font-medium">
              Shipping Address
            </h2>

            <form className="mt-8 space-y-5">
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm text-white/70"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  required
                  value={shipping.fullName}
                  onChange={(event) =>
                    updateShipping(
                      "fullName",
                      event.target.value
                    )
                  }
                  placeholder="Your full name"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm text-white/70"
                >
                  Phone Number
                </label>

                <input
                  id="phone"
                  type="tel"
                  required
                  value={shipping.phone}
                  onChange={(event) =>
                    updateShipping(
                      "phone",
                      event.target.value
                    )
                  }
                  placeholder="Your phone number"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="mb-2 block text-sm text-white/70"
                >
                  Address
                </label>

                <textarea
                  id="address"
                  required
                  rows={4}
                  value={shipping.address}
                  onChange={(event) =>
                    updateShipping(
                      "address",
                      event.target.value
                    )
                  }
                  placeholder="House number, street, locality"
                  className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm text-white/70"
                  >
                    City
                  </label>

                  <input
                    id="city"
                    type="text"
                    required
                    value={shipping.city}
                    onChange={(event) =>
                      updateShipping(
                        "city",
                        event.target.value
                      )
                    }
                    placeholder="City"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm text-white/70"
                  >
                    State
                  </label>

                  <input
                    id="state"
                    type="text"
                    required
                    value={shipping.state}
                    onChange={(event) =>
                      updateShipping(
                        "state",
                        event.target.value
                      )
                    }
                    placeholder="State"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="pincode"
                  className="mb-2 block text-sm text-white/70"
                >
                  PIN Code
                </label>

                <input
                  id="pincode"
                  type="text"
                  inputMode="numeric"
                  required
                  value={shipping.pincode}
                  onChange={(event) =>
                    updateShipping(
                      "pincode",
                      event.target.value
                    )
                  }
                  placeholder="PIN code"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 outline-none transition placeholder:text-white/30 focus:border-white/40"
                />
              </div>
            </form>
          </section>

          {/* Order Summary */}
          <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Order Summary
            </p>

            <h2 className="mt-3 text-2xl font-medium">
              Your Order
            </h2>

            <div className="mt-6 space-y-4">
              {cartItems.map((item) => {
                if (!item.product) {
                  return null;
                }

                const product = item.product;
                const currentPrice =
                  getItemPrice(product);

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {product.name}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          {item.size &&
                            `Size: ${item.size}`}
                          {item.size &&
                            item.color &&
                            " • "}
                          {item.color &&
                            `Color: ${item.color}`}
                        </p>

                        <p className="mt-1 text-xs text-white/40">
                          Quantity: {item.quantity}
                        </p>
                      </div>

                      <p className="shrink-0 font-medium">
                        ₹
                        {(
                          currentPrice *
                          item.quantity
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-center justify-between text-white/60">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-white/60">
              <span>Shipping</span>
              <span>Calculated later</span>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.2em] text-white/40">
                Payment Method
              </p>

              <div className="mt-4 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("cod")
                  }
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "cod"
                      ? "border-white bg-white/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p className="font-medium">
                    Cash on Delivery
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    Pay when your order is delivered.
                  </p>
                </button>
                {orderError && (
  <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
    {orderError}
  </div>
)}

                <button
                  type="button"
                  onClick={() =>
                    setPaymentMethod("upi")
                  }
                  className={`w-full rounded-xl border p-4 text-left transition ${
                    paymentMethod === "upi"
                      ? "border-white bg-white/10"
                      : "border-white/10 hover:border-white/30"
                  }`}
                >
                  <p className="font-medium">
                    UPI / GPay
                  </p>

                  <p className="mt-1 text-sm text-white/40">
                    Pay using a UPI QR code.
                  </p>
                </button>
              </div>
            </div>

          {paymentMethod === "upi" && (
  <UpiPayment amount={subtotal} />
)}
           <button
  type="button"
  onClick={
  paymentMethod === "cod"
    ? handlePlaceCodOrder
    : handleContinueToUpi
}
  disabled={placingOrder}
  className="mt-8 w-full rounded-full bg-white px-6 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
>
  {paymentMethod === "cod"
    ? placingOrder
      ? "PLACING ORDER..."
      : "PLACE COD ORDER"
    : "CONTINUE TO UPI"}
</button>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-white/50 transition hover:text-white"
            >
              ← Back to Cart
            </Link>
          </aside>
        </div>
      </div>
    </main>
  );
}