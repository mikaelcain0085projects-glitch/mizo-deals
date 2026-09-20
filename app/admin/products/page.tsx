import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../lib/supabase-server";



type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
  is_active: boolean;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  price: number;
  sale_price: number | null;
  stock: number;
  sizes: unknown;
  colors: unknown;
  is_active: boolean;
  created_at: string;
  category_id: string | null;
};
const filterCategories = [
  { name: "All Products", slug: "" },
  { name: "Men", slug: "men" },
  { name: "Women", slug: "women" },
  { name: "Kids", slug: "kids" },
  { name: "Accessories", slug: "accessories" },
];

type AdminProductsPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

export default async function AdminProductsPage({
  searchParams,
}: AdminProductsPageProps) {
  const supabase = await createClient();

  // Check logged-in user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  // Check admin role
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile || profile.role !== "admin") {
    redirect("/");
  }

  // Read selected filter
  const params = await searchParams;
  const selectedCategory = params.category?.toLowerCase() ?? "";

  // Load categories
  const { data: categories, error: categoriesError } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id, is_active")
    .eq("is_active", true)
    .order("name");

  if (categoriesError) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-red-400">
            Unable to load categories.
          </p>

          <p className="mt-3 text-sm text-white/50">
            {categoriesError.message}
          </p>
        </div>
      </main>
    );
  }

  const categoryList = (categories ?? []) as Category[];

  // Load products
  const { data: products, error: productsError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      price,
      sale_price,
      stock,
      sizes,
      colors,
      is_active,
      created_at,
      category_id
    `)
    .order("created_at", { ascending: false });

  if (productsError) {
    return (
      <main className="min-h-screen bg-black px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-red-400">
            Unable to load products.
          </p>

          <p className="mt-3 text-sm text-white/50">
            {productsError.message}
          </p>
        </div>
      </main>
    );
  }

  const productList = (products ?? []) as Product[];

  // ---------------------------------------------------------
  // CATEGORY HELPERS
  // ---------------------------------------------------------

  // Map category ID → category
  const categoryMap = new Map(
    categoryList.map((category) => [category.id, category])
  );

  // Find parent category for a product's category
  function getParentCategory(categoryId: string | null) {
    if (!categoryId) {
      return null;
    }

    const category = categoryMap.get(categoryId);

    if (!category) {
      return null;
    }

    // Product is already assigned to a parent category
    if (category.parent_id === null) {
      return category;
    }

    // Product is assigned to a subcategory
    return categoryMap.get(category.parent_id) ?? null;
  }

  // Get the actual category/subcategory name
  function getCategoryName(categoryId: string | null) {
    if (!categoryId) {
      return "Uncategorized";
    }

    return categoryMap.get(categoryId)?.name ?? "Uncategorized";
  }

  // Get the parent category name
  function getParentCategoryName(categoryId: string | null) {
    return getParentCategory(categoryId)?.name ?? "Uncategorized";
  }

  // ---------------------------------------------------------
  // FILTER PRODUCTS
  // ---------------------------------------------------------

  const parentCategory =
    categoryList.find(
      (category) =>
        category.parent_id === null &&
        category.slug.toLowerCase() === selectedCategory
    ) ?? null;

  const filteredProducts =
    selectedCategory && parentCategory
      ? productList.filter(
          (product) =>
            getParentCategory(product.category_id)?.id ===
            parentCategory.id
        )
      : productList;

  // ---------------------------------------------------------
  // FILTER BUTTONS
  // ---------------------------------------------------------

  

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-white/[0.03]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
          <div>
            <Link
              href="/admin"
              className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
            >
              ← Admin Dashboard
            </Link>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight">
              Products
            </h1>

            <p className="mt-1 text-sm text-white/50">
              Manage your MIZO DEALS product catalogue.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-white/90"
          >
            + ADD PRODUCT
          </Link>
        </div>
      </header>

      {/* Products */}
      <section className="mx-auto max-w-7xl px-6 py-10">

        {/* CATEGORY FILTER */}
        <div className="mb-8">
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40">
              Filter Products
            </p>

            <p className="mt-1 text-sm text-white/30">
              Organise products by main category.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
  {filterCategories.map((filter) => {
    const isSelected =
      selectedCategory === filter.slug;

    return (
      <Link
        key={filter.slug || "all"}
        href={
          filter.slug
            ? `/admin/products?category=${filter.slug}`
            : "/admin/products"
        }
        className={`rounded-full border px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition ${
          isSelected
            ? "border-white bg-white text-black"
            : "border-white/15 text-white/60 hover:border-white/40 hover:text-white"
        }`}
      >
        {filter.name}
      </Link>
    );
  })}
</div>
        </div>

        {/* FILTER RESULT */}
        <div className="mb-5 flex items-center justify-between">
          <p className="text-sm text-white/40">
            {selectedCategory && parentCategory
              ? `${parentCategory.name} Products`
              : "All Products"}
          </p>

          <p className="text-xs text-white/30">
            {filteredProducts.length}{" "}
            {filteredProducts.length === 1
              ? "product"
              : "products"}
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-16 text-center">
            <p className="text-sm text-white/50">
              No products found in this category.
            </p>

            <Link
              href="/admin/products"
              className="mt-6 inline-flex rounded-full border border-white/20 px-6 py-3 text-xs font-semibold tracking-[0.15em] transition hover:bg-white hover:text-black"
            >
              VIEW ALL PRODUCTS
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

            {/* Desktop table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/[0.03]">
                  <tr>
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Product
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Category
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Price
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Stock
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Sizes
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Colours
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Status
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-semibold uppercase tracking-[0.15em] text-white/40">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const sizes = Array.isArray(product.sizes)
                      ? product.sizes.map(String)
                      : [];

                    const colors = Array.isArray(product.colors)
                      ? product.colors.map(String)
                      : [];

                    const currentPrice =
                      product.sale_price !== null &&
                      product.sale_price < product.price
                        ? product.sale_price
                        : product.price;

                    const categoryName = getCategoryName(
                      product.category_id
                    );

                    const parentName =
                      getParentCategoryName(
                        product.category_id
                      );

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-white/10 last:border-b-0"
                      >
                        {/* Product */}
                        <td className="px-6 py-5">
                          <p className="font-medium">
                            {product.name}
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {product.slug}
                          </p>
                        </td>

                        {/* Category */}
                        <td className="px-6 py-5">
                          <p className="text-sm text-white/80">
                            {categoryName}
                          </p>

                          {parentName !== categoryName && (
                            <p className="mt-1 text-xs text-white/30">
                              {parentName}
                            </p>
                          )}
                        </td>

                        {/* Price */}
                        <td className="px-6 py-5">
                          <p className="font-medium">
                            ₹{Number(currentPrice).toFixed(2)}
                          </p>

                          {product.sale_price !== null &&
                            product.sale_price < product.price && (
                              <p className="mt-1 text-xs text-white/30 line-through">
                                ₹{Number(product.price).toFixed(2)}
                              </p>
                            )}
                        </td>

                        {/* Stock */}
                        <td className="px-6 py-5 text-sm">
                          <span
                            className={
                              product.stock > 0
                                ? "text-white/70"
                                : "text-red-400"
                            }
                          >
                            {product.stock}
                          </span>
                        </td>

                        {/* Sizes */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {sizes.length > 0 ? (
                              sizes.map((size) => (
                                <span
                                  key={size}
                                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                                >
                                  {size}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-white/30">
                                None
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Colours */}
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-1.5">
                            {colors.length > 0 ? (
                              colors.map((color) => (
                                <span
                                  key={color}
                                  className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                                >
                                  {color}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-white/30">
                                None
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-5">
                          <span
                            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                              product.is_active
                                ? "bg-green-400/10 text-green-300"
                                : "bg-red-400/10 text-red-300"
                            }`}
                          >
                            {product.is_active
                              ? "Active"
                              : "Inactive"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-5 text-right">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-xs font-semibold tracking-[0.12em] text-white/60 transition hover:text-white"
                          >
                            EDIT →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-white/10 md:hidden">
              {filteredProducts.map((product) => {
                const sizes = Array.isArray(product.sizes)
                  ? product.sizes.map(String)
                  : [];

                const colors = Array.isArray(product.colors)
                  ? product.colors.map(String)
                  : [];

                const currentPrice =
                  product.sale_price !== null &&
                  product.sale_price < product.price
                    ? product.sale_price
                    : product.price;

                const categoryName = getCategoryName(
                  product.category_id
                );

                const parentName =
                  getParentCategoryName(
                    product.category_id
                  );

                return (
                  <div
                    key={product.id}
                    className="p-6"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h2 className="font-medium">
                          {product.name}
                        </h2>

                        <p className="mt-1 text-xs text-white/40">
                          {categoryName}
                        </p>

                        {parentName !== categoryName && (
                          <p className="mt-1 text-xs text-white/25">
                            {parentName}
                          </p>
                        )}
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] ${
                          product.is_active
                            ? "bg-green-400/10 text-green-300"
                            : "bg-red-400/10 text-red-300"
                        }`}
                      >
                        {product.is_active
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                          Price
                        </p>

                        <p className="mt-1">
                          ₹{Number(currentPrice).toFixed(2)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                          Stock
                        </p>

                        <p className="mt-1">
                          {product.stock}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5">
                      <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                        Sizes
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {sizes.length > 0 ? (
                          sizes.map((size) => (
                            <span
                              key={size}
                              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                            >
                              {size}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/30">
                            None
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs uppercase tracking-[0.12em] text-white/30">
                        Colours
                      </p>

                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {colors.length > 0 ? (
                          colors.map((color) => (
                            <span
                              key={color}
                              className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] text-white/60"
                            >
                              {color}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-white/30">
                            None
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/admin/products/${product.id}/edit`}
                      className="mt-6 inline-flex rounded-full border border-white/15 px-5 py-2.5 text-xs font-semibold tracking-[0.12em] transition hover:bg-white hover:text-black"
                    >
                      EDIT PRODUCT
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}