"use client";

import { QRCodeSVG } from "qrcode.react";

type UpiPaymentProps = {
  amount: number;
};

export default function UpiPayment({
  amount,
}: UpiPaymentProps) {
  const upiId = "mikaelcain0085-2@oksbi";
  const payeeName = "MIZO DEALS";

  const upiUrl =
    `upi://pay?pa=${encodeURIComponent(upiId)}` +
    `&pn=${encodeURIComponent(payeeName)}` +
    `&am=${amount.toFixed(2)}` +
    `&cu=INR`;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-white p-6 text-black">
      <div className="flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-black/50">
          Scan to Pay
        </p>

        <div className="mt-5 rounded-xl bg-white p-4">
          <QRCodeSVG
            value={upiUrl}
            size={220}
            level="M"
          />
        </div>

        <p className="mt-5 text-2xl font-semibold">
          ₹{amount.toFixed(2)}
        </p>

        <p className="mt-2 text-sm text-black/60">
          Pay to MIZO DEALS
        </p>

        <p className="mt-2 break-all text-sm font-medium">
          {upiId}
        </p>

        <p className="mt-5 max-w-xs text-xs leading-5 text-black/50">
          Scan this QR code using GPay, PhonePe, Paytm,
          or another UPI app. Make sure the amount shown
          in your payment app matches the order total.
        </p>
      </div>
    </div>
  );
}