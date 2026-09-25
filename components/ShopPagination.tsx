"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type ShopPaginationProps = {
  currentPage: number;
  totalPages: number;
  category: string;
};

function Spinner() {
  return (
    <span
      className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
      aria-label="Loading"
    />
  );
}

export default function ShopPagination({
  currentPage,
  totalPages,
  category,
}: ShopPaginationProps) {
  const [isPending, startTransition] = useTransition();
  const [loadingPage, setLoadingPage] = useState<number | null>(null);
  const router = useRouter();

  if (totalPages <= 1) {
    return null;
  }

  const getHref = (page: number) => {
    const params = new URLSearchParams();

    if (category) {
      params.set("category", category);
    }

    params.set("page", String(page));

    return `/shop?${params.toString()}`;
  };

  const goToPage = (page: number) => {
    setLoadingPage(page);

    startTransition(() => {
      router.push(getHref(page));
    });
  };

  return (
    <nav
      aria-label="Shop pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {currentPage > 1 && (
        <button
          type="button"
          disabled={isPending}
          onClick={() => goToPage(currentPage - 1)}
          className="flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && loadingPage === currentPage - 1 ? (
            <Spinner />
          ) : (
            "PREV"
          )}
        </button>
      )}

      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (page) => (
          <button
            key={page}
            type="button"
            disabled={isPending || page === currentPage}
            onClick={() => goToPage(page)}
            className={`flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-xs font-semibold transition ${
              page === currentPage
                ? "border-orange-600 bg-orange-600 text-white"
                : "border-white/15 text-white/60 hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {isPending && loadingPage === page ? (
              <Spinner />
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
          className="flex h-10 items-center justify-center rounded-full border border-white/15 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-white/60 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending && loadingPage === currentPage + 1 ? (
            <Spinner />
          ) : (
            "NEXT"
          )}
        </button>
      )}
    </nav>
  );
}