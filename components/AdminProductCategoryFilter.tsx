"use client";


import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type FilterCategory = {
  name: string;
  slug: string;
};

type AdminProductCategoryFilterProps = {
  filterCategories: FilterCategory[];
  selectedCategory: string;
};

export default function AdminProductCategoryFilter({
  filterCategories,
  selectedCategory,
}: AdminProductCategoryFilterProps) {
  const [isPending, startTransition] = useTransition();
const [loadingSlug, setLoadingSlug] = useState<string | null>(null);
  const router = useRouter();

  const goToCategory = (slug: string) => {
  setLoadingSlug(slug);

  startTransition(() => {
    router.push(
      slug
        ? `/admin/products?category=${slug}`
        : "/admin/products"
    );
  });
};

  return (
    <div className="flex flex-wrap gap-3">
      {filterCategories.map((filter) => {
        const isSelected = selectedCategory === filter.slug;

        return (
          <button
            key={filter.slug || "all"}
            type="button"
            disabled={isPending || isSelected}
            onClick={() => goToCategory(filter.slug)}
            className={`flex min-h-[42px] min-w-[42px] items-center justify-center rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
              isSelected
                ? "border-white bg-white text-black"
                : "border-white/15 text-white/60 hover:border-white/40 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            }`}
          >
            {loadingSlug === filter.slug && isPending && !isSelected ? (
              <span
                className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white"
                aria-label="Loading"
              />
            ) : (
              filter.name
            )}
          </button>
        );
      })}
    </div>
  );
}