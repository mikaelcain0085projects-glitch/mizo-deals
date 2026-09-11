"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "../lib/cart";

type ProductActionsProps = {
  productId: string;
  productName: string;
  stock: number;
  sizes: unknown[];
  colors: unknown[];
};
export default function ProductActions({
  productId,
  productName,
  stock,
  sizes,
  colors,
}: ProductActionsProps) {
  const router = useRouter();

  const [selectedSize, setSelectedSize] = useState<string>(
    sizes.length > 0 ? String(sizes[0]) : ""
  );

  const [selectedColor, setSelectedColor] = useState<string>(
    colors.length > 0 ? String(colors[0]) : ""
  );

  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  
  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(stock, current + 1));
  }

  async function handleAddToCart() {
    setMessage("");
    setError("");

    if (stock <= 0) {
      setError("This product is currently out of stock.");
      return;
    }

    setLoading(true);

    try {
      await addToCart({
        productId,
        quantity,
        size: selectedSize,
        color: selectedColor,
      });

      setMessage(`${productName} added to your cart.`);
    } catch (cartError) {
      const errorMessage =
        cartError instanceof Error
          ? cartError.message
          : "Unable to add this product to your cart.";

      if (errorMessage === "Please log in to use your cart.") {
        router.push("/account/login");
        return;
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-8">
      {sizes.length > 0 && (
        <div>
          <p className="mb-3 text-sm font-medium uppercase tracking-widest">
            Size
          </p>

          <div className="flex flex-wrap gap-3">
            {sizes.map((size) => {
              const value = String(size);
              const isSelected = selectedSize === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedSize(value)}
                  className={`rounded-full border px-5 py-2 text-sm transition ${
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-white/20 hover:border-white"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {colors.length > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest">
            Color
          </p>

          <div className="flex flex-wrap gap-3">
            {colors.map((color) => {
              const value = String(color);
              const isSelected = selectedColor === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSelectedColor(value)}
                  className={`rounded-full border px-5 py-2 text-sm transition ${
                    isSelected
                      ? "border-white bg-white text-black"
                      : "border-white/20 hover:border-white"
                  }`}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {stock > 0 && (
        <div className="mt-8">
          <p className="mb-3 text-sm font-medium uppercase tracking-widest">
            Quantity
          </p>

          <div className="flex w-fit items-center rounded-full border border-white/20">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity <= 1 || loading}
              className="px-5 py-3 text-lg transition hover:text-white disabled:opacity-30"
            >
              −
            </button>

            <span className="min-w-10 text-center">
              {quantity}
            </span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity >= stock || loading}
              className="px-5 py-3 text-lg transition hover:text-white disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      )}

      {message && (
  <div className="rounded-xl border border-green-400/20 bg-green-400/10 p-4">
    <p className="text-sm text-green-300">
      {message}
    </p>

    <div className="mt-4 flex flex-wrap gap-3">
      <button
        type="button"
        onClick={() => router.push("/cart")}
        className="rounded-full bg-white px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-black transition hover:bg-white/90"
      >
        VIEW CART →
      </button>

      <button
        type="button"
        onClick={() => router.push("/shop")}
        className="rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-[0.12em] text-white transition hover:bg-white hover:text-black"
      >
        CONTINUE SHOPPING
      </button>
    </div>
  </div>
)}
      <div className="mt-10 flex flex-col gap-4 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={stock <= 0 || loading}
          className="rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {loading
            ? "ADDING..."
            : stock > 0
              ? "ADD TO CART"
              : "OUT OF STOCK"}
        </button>

        <button
          type="button"
          className="rounded-full border border-white/30 px-8 py-4 text-sm tracking-widest transition hover:border-white"
        >
          ♡ WISHLIST
        </button>
      </div>
    </div>
  );
}