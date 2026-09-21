"use client";

import { useFormStatus } from "react-dom";

type AdminDeleteOrderButtonProps = {
  orderId: string;
  orderNumber: number;
  deleteOrder: (formData: FormData) => void | Promise<void>;
};

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full border border-red-400/30 px-4 py-2 text-xs uppercase tracking-widest text-red-300 transition hover:border-red-400/50 hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "DELETING..." : "DELETE"}
    </button>
  );
}

export default function AdminDeleteOrderButton({
  orderId,
  orderNumber,
  deleteOrder,
}: AdminDeleteOrderButtonProps) {
  return (
    <form
      action={deleteOrder}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          `Delete order #MD-OID-${String(orderNumber).padStart(6, "0")}?\n\nThis will permanently delete this order and its order items.`
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
    >
      <input
        type="hidden"
        name="order_id"
        value={orderId}
      />

      <DeleteButton />
    </form>
  );
}