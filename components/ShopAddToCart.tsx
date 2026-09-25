"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { addToCart } from "../lib/cart";

type ShopAddToCartProps = {
  productId: string;
  productName: string;
  stock: number;
  sizes: unknown[];
  colors: unknown[];
};

export default function ShopAddToCart({
  productId,
  productName,
  stock,
  sizes,
  colors,
}: ShopAddToCartProps) {
  const router = useRouter();

  const [loading, setLoading] = useState(false);
const [added, setAdded] = useState(false);
const [showOptions, setShowOptions] = useState(false);
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);
const [selectedSize, setSelectedSize] = useState(
  sizes.length > 0 ? String(sizes[0]) : ""
);
const [selectedColor, setSelectedColor] = useState(
  colors.length > 0 ? String(colors[0]) : ""
);
  async function handleAddToCart(
    event: React.MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    if (stock <= 0 || loading) {
      return;
    }

    setLoading(true);
    setAdded(false);

    
    try {
      await addToCart({
        productId,
        quantity: 1,
        size: selectedSize,
        color: selectedColor,
      });

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 1800);
    } catch (cartError) {
      const errorMessage =
        cartError instanceof Error
          ? cartError.message
          : "Unable to add this product to your cart.";

      if (errorMessage === "Please log in to use your cart.") {
        router.push("/account/login");
        return;
      }

      console.error(
        `Failed to add ${productName} to cart:`,
        cartError
      );
    } finally {
      setLoading(false);
    }
  }

 return (
  <>
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();

        if (stock > 0) {
          setShowOptions(true);
        }
      }}
      disabled={stock <= 0 || loading}
      className="mt-4 w-full rounded-full bg-orange-700 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
    >
      {stock > 0 ? "ADD TO CART" : "OUT OF STOCK"}
    </button>

    {mounted &&
  showOptions &&
  createPortal(
    (
      <div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
        onClick={() => {
          if (!loading) {
            setShowOptions(false);
          }
        }}
      >
        <div
         className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[28px] border border-white/15 bg-black/90 p-4 shadow-[0_20px_80px_rgba(0,0,0,0.6)] backdrop-blur-xl"
          onClick={(event) => event.stopPropagation()}
        >
          <button
  type="button"
  onClick={() => setShowOptions(false)}
  disabled={loading}
  aria-label="Close"
  className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-red/50 text-xl text-white/50 transition hover:border-white/25 hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
>
  ×
</button>
          <p className="text-[7px] font-semibold uppercase tracking-[0.25em] text-white/40">
            Choose options
          </p>

          <h3 className="mt-2 text-sm font-semibold text-white">
            {productName}
          </h3>

          {sizes.length > 0 && (
            <div className="mt-6">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/50">
                Size
              </p>

              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => {
                  const value = String(size);

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedSize(value)}
                      disabled={loading}
                      className={`rounded-full border px-3 py-1.5 text-[10px] font-semibold transition ${
                        selectedSize === value
                          ? "border-orange-500 bg-orange-600 text-black"
                          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
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
            <div className="mt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-white/50">
                Colour
              </p>

              <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                  const value = String(color);

                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setSelectedColor(value)}
                      disabled={loading}
                      className={`rounded-full border px-4 py-2 text-xs font-semibold transition ${
                        selectedColor === value
                          ? "border-orange-500 bg-orange-600 text-black"
                          : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
                      }`}
                    >
                      {value}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-4 flex gap-2">
            <button
              type="button"
              disabled={loading}
              onClick={() => setShowOptions(false)}
             className="flex-1 rounded-full border border-white/15 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60 transition hover:border-white/30 hover:text-white disabled:opacity-40"
            >
              CANCEL
            </button>

            <button
              type="button"
              disabled={loading}
              onClick={handleAddToCart}
              className="flex-1 rounded-full bg-orange-700 px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-black transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "ADDING..."
                : added
                  ? "ADDED ✓"
                  : "ADD TO CART"}
            </button>
          </div>
        </div>
      </div>
       ),
    document.body
  )}
  </>
);

  
}