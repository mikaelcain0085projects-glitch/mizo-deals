"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminDeleteProductButtonProps = {
  productId: string;
  productName: string;
};

export default function AdminDeleteProductButton({
  productId,
  productName,
}: AdminDeleteProductButtonProps) {
  const router = useRouter();

  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete "${productName}"?\n\nThis will permanently delete the product and its Cloudinary images.`
    );

    if (!confirmed) {
      return;
    }

    setError("");
    setDeleting(true);

    try {
      const response = await fetch(
        "/api/admin/delete-product",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            productId,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Product deletion failed."
        );
      }

      router.refresh();
    } catch (deleteError) {
      console.error(
        "Product deletion error:",
        deleteError
      );

      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Product deletion failed."
      );

      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs font-semibold tracking-[0.12em] text-red-400 transition hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {deleting ? "DELETING..." : "DELETE"}
      </button>

      {error && (
        <p className="max-w-xs text-right text-[11px] leading-5 text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}