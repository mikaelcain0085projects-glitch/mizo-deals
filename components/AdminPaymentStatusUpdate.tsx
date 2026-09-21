"use client";

import { useFormStatus } from "react-dom";

function UpdateButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-xl bg-orange-700 px-5 py-3 text-sm font-medium tracking-widest text-white transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "UPDATING..." : "UPDATE"}
    </button>
  );
}

type AdminPaymentStatusUpdateProps = {
  updatePaymentStatus: (formData: FormData) => void | Promise<void>;
  orderId: string;
  currentPaymentStatus: string;
  statuses: string[];
};

export default function AdminPaymentStatusUpdate({
  updatePaymentStatus,
  orderId,
  currentPaymentStatus,
  statuses,
}: AdminPaymentStatusUpdateProps) {
  return (
    <form
      action={updatePaymentStatus}
      className="mt-4 flex flex-col gap-3 sm:flex-row"
    >
      <input
        type="hidden"
        name="order_id"
        value={orderId}
      />

      <select
        name="payment_status"
        defaultValue={currentPaymentStatus}
        className="rounded-xl border border-white/15 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-white/40"
      >
        {statuses.map((status) => (
          <option
            key={status}
            value={status}
            className="bg-black text-white"
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </option>
        ))}
      </select>

      <UpdateButton />
    </form>
  );
}
