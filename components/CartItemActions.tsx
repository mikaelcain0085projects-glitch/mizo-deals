"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../lib/supabase-browser";

type CartItemActionsProps = {
  itemId: string;
  quantity: number;
  stock: number;
};

export default function CartItemActions({
  itemId,
  quantity,
  stock,
}: CartItemActionsProps) {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function updateQuantity(newQuantity: number) {
    if (newQuantity < 1 || newQuantity > stock) {
      return;
    }

    setLoading(true);
    setError("");

    const { error: updateError } = await supabase
      .from("cart_items")
      .update({
        quantity: newQuantity,
      })
      .eq("id", itemId);

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  async function removeItem() {
    setLoading(true);
    setError("");

    const { error: deleteError } = await supabase
      .from("cart_items")
      .delete()
      .eq("id", itemId);

    if (deleteError) {
      setError(deleteError.message);
      setLoading(false);
      return;
    }

    router.refresh();
    setLoading(false);
  }

  return (
    <div className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border border-white/20">
          <button
            type="button"
            onClick={() => updateQuantity(quantity - 1)}
            disabled={loading || quantity <= 1}
            className="px-4 py-2 text-lg transition hover:text-white disabled:opacity-30"
          >
            −
          </button>

          <span className="min-w-10 text-center text-sm">
            {loading ? "..." : quantity}
          </span>

          <button
            type="button"
            onClick={() => updateQuantity(quantity + 1)}
            disabled={loading || quantity >= stock}
            className="px-4 py-2 text-lg transition hover:text-white disabled:opacity-30"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={removeItem}
          disabled={loading}
          className="rounded-full border border-red-500/30 px-4 py-2 text-xs tracking-widest text-red-300 transition hover:border-red-400 hover:text-red-200 disabled:opacity-40"
        >
          REMOVE
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}