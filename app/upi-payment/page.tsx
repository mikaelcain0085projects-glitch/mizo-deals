"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { createClient } from "../../lib/supabase-browser";

type Order = {
  id: string;
  total: number;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_id: string | null;
};

function UpiPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order");

  const supabase = createClient();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [utr, setUtr] = useState("");

  useEffect(() => {
    async function loadOrder() {
      setError("");

      if (!orderId) {
        setError("No order was provided.");
        setLoading(false);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/account/login");
        return;
      }

      const { data, error: orderError } = await supabase
        .from("orders")
        .select(`
          id,
          total,
          status,
          payment_status,
          payment_method,
          payment_id
        `)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) {
        setError(orderError.message);
        setLoading(false);
        return;
      }

      if (!data) {
        setError("Order not found.");
        setLoading(false);
        return;
      }

      if (data.payment_method !== "upi") {
        setError("This order is not a UPI order.");
        setLoading(false);
        return;
      }

      setOrder(data as Order);

      if (data.payment_id) {
        setUtr(data.payment_id);
      }

      setLoading(false);
    }

    loadOrder();
  }, [orderId, router, supabase]);

  async function handleSubmitUtr() {
    setError("");
    setSuccess("");

    const cleanedUtr = utr.trim();

    if (!cleanedUtr) {
      setError("Please enter your UTR or transaction reference.");
      return;
    }

    if (cleanedUtr.length < 4) {
      setError("UTR or transaction reference is too short.");
      return;
    }

    if (!order) {
      setError("Order information is unavailable.");
      return;
    }

    setSubmitting(true);

    const { error: submitError } = await supabase.rpc(
      "submit_upi_utr",
      {
        p_order_id: order.id,
        p_utr: cleanedUtr,
      }
    );

    if (submitError) {
      setError(submitError.message);
      setSubmitting(false);
      return;
    }

    setSuccess(
      "Your payment reference has been submitted successfully. Your payment will be verified by MIZO DEALS."
    );

    setOrder({
      ...order,
      payment_id: cleanedUtr,
    });

    setSubmitting(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm tracking-[0.2em] text-white/60">
            LOADING PAYMENT...
          </p>
        </div>
      </main>
    );
  }

  if (error && !order) {
    return (
      <main className="min-h-screen bg-black px-6 py-20 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm uppercase tracking-[0.2em] text-red-400">
            PAYMENT ERROR
          </p>

          <p className="mt-4 text-white/70">{error}</p>

          <Link
            href="/shop"
            className="mt-8 inline-flex rounded-full border border-white/20 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            CONTINUE SHOPPING
          </Link>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  const upiId = "mikaelcain0085-2@oksbi";
  const payeeName = "MIZO DEALS";

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${order.total.toFixed(2)}` +
    `&cu=INR`;

  const paymentSubmitted = Boolean(order.payment_id);

  return (
    <main className="min-h-screen bg-black px-6 py-16 text-white">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
            UPI Payment
          </h1>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-white/60">
            Complete your payment using the QR code below, then enter your
            UTR or transaction reference.
          </p>
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
              Scan to Pay
            </p>

            <div className="mt-6 rounded-2xl bg-white p-5">
              <QRCodeSVG
                value={upiUrl}
                size={240}
                level="M"
              />
            </div>

            <p className="mt-6 text-3xl font-semibold">
              ₹{order.total.toFixed(2)}
            </p>

            <p className="mt-2 text-sm text-white/60">
              Pay to {payeeName}
            </p>

            <p className="mt-2 break-all text-sm font-medium">
              {upiId}
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/30 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
              Order
            </p>

            <p className="mt-2 break-all text-sm text-white/80">
              {order.id}
            </p>
          </div>

          <div className="mt-8">
            <label
              htmlFor="utr"
              className="text-sm font-medium text-white/80"
            >
              UTR / Transaction Reference
            </label>

            <input
              id="utr"
              type="text"
              value={utr}
              onChange={(event) => setUtr(event.target.value)}
              placeholder="Enter your UTR or transaction reference"
              disabled={submitting}
              className="mt-3 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/40"
            />

            <p className="mt-3 text-xs leading-5 text-white/40">
              Enter the transaction reference shown in your UPI payment
              app after completing the payment.
            </p>
          </div>

          {error && (
            <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 px-4 py-3 text-sm leading-6 text-green-300">
              {success}
            </div>
          )}

          <button
            type="button"
            onClick={handleSubmitUtr}
            disabled={submitting}
            className="mt-6 w-full rounded-full bg-white px-6 py-4 text-sm font-semibold tracking-[0.15em] text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitting
              ? "SUBMITTING..."
              : paymentSubmitted
                ? "UPDATE PAYMENT REFERENCE"
                : "SUBMIT PAYMENT"}
          </button>

          <p className="mt-5 text-center text-xs leading-5 text-white/40">
            Your payment will remain pending until it is manually verified
            by MIZO DEALS.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em]">
            Payment Instructions
          </h2>

          <ol className="mt-4 space-y-3 text-sm leading-6 text-white/60">
            <li>1. Scan the QR code using GPay, PhonePe, Paytm, or another UPI app.</li>
            <li>2. Confirm that the payment amount is ₹{order.total.toFixed(2)}.</li>
            <li>3. Complete the payment in your UPI app.</li>
            <li>4. Copy the UTR / transaction reference.</li>
            <li>5. Enter it above and submit it for verification.</li>
          </ol>
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/account")}
            className="rounded-full border border-white/20 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            MY ACCOUNT
          </button>

          <button
            type="button"
            onClick={() => router.push("/shop")}
            className="rounded-full border border-white/20 px-6 py-3 text-sm tracking-[0.15em] transition hover:bg-white hover:text-black"
          >
            CONTINUE SHOPPING
          </button>
        </div>
      </div>
    </main>
  );
}
export default function UpiPaymentPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black px-6 py-20 text-white">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm tracking-[0.2em] text-white/60">
              LOADING PAYMENT...
            </p>
          </div>
        </main>
      }
    >
      <UpiPaymentPage />
    </Suspense>
  );
}