"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

type AdminOrdersPaginationProps = {
  currentPage: number;
  totalPages: number;
};

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-label="Loading"
    />
  );
}

export default function AdminOrdersPagination({
  currentPage,
  totalPages,
}: AdminOrdersPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const goToPage = (page: number) => {
    startTransition(() => {
      router.push(`/admin/orders?page=${page}`);
    });
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-1">
      {currentPage > 1 && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => goToPage(currentPage - 1)}
          className="flex h-7 items-center justify-center rounded-full border border-white/15 px-2.5 text-[10px] uppercase tracking-wide text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <Spinner /> : "PREV"}
        </button>
      )}

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            disabled={isPending || page === currentPage}
            onClick={() => goToPage(page)}
            className={`flex h-7 min-w-7 items-center justify-center rounded-full border px-1.5 text-[10px] transition ${
              page === currentPage
                ? "border-orange-700 bg-orange-700 text-white"
                : "border-white/15 text-white/60 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {isPending && page !== currentPage ? (
              <span className="sr-only">Loading</span>
            ) : (
              page
            )}
          </button>
        )
      )}

      {currentPage < totalPages && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => goToPage(currentPage + 1)}
          className="flex h-8 items-center justify-center rounded-full border border-white/15 px-3 text-[11px] uppercase tracking-wider text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? <Spinner /> : "NEXT"}
        </button>
      )}
    </div>
  );
}