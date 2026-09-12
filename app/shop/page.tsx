import Image from "next/image";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

export const revalidate = 60;

type ShopPageProps = {
  searchParams: Promise<{
    category?: string;
  }>;
};

type Category = {
  id: string;
  name: string;
  slug: string;
  parent_id: string | null;
};

type ProductImage =
  | string
  | {
      url?: string;
      publicId?: string;
    };

type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  sale_price: number | null;
  category_id: string | null;
  images: unknown;
  stock: number;
  sizes: unknown;
  colors: unknown;
  created_at: string;
};

export default async function ShopPage({
  searchParams,
}: ShopPageProps) {
  const params = await searchParams;
  const selectedCategory = params.category?.toLowerCase() ?? "";

  // Get active categories
  console.time("SHOP: categories query");
  const {
    data: categories,
    error: categoriesError,
  } = await supabase
    .from("categories")
    .select("id, name, slug, parent_id")
    .eq("is_active", true)
    .order("name");
    console.timeEnd("SHOP: categories query");

  if (categoriesError) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-3 text-5xl font-semibold md:text-7xl">
            Shop
          </h1>

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-semibold">
              Unable to load categories.
            </p>

            <p className="mt-2 text-sm text-white/60">
              {categoriesError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const allCategories = (categories ?? []) as Category[];

  /*
   * Determine which product category IDs should be displayed.
   *
   * Example:
   *
   * /shop?category=men
   *
   * finds:
   * Men
   * ├── Jackets
   * ├── Shirts
   * ├── Pants
   * ├── Hoodie
   * └── T-shirt
   *
   * Then only products belonging to those subcategories
   * are displayed.
   */

  let productCategoryIds: string[] | null = null;
  let pageCategoryName = "Shop";

  if (selectedCategory) {
    const parentCategory = allCategories.find(
      (category) =>
        category.slug === selectedCategory &&
        category.parent_id === null
    );

    if (parentCategory) {
      pageCategoryName = parentCategory.name;

      const subcategories = allCategories.filter(
        (category) =>
          category.parent_id === parentCategory.id
      );

      productCategoryIds = subcategories.map(
        (category) => category.id
      );
    } else {
      // Allow a direct subcategory URL too.
      const subcategory = allCategories.find(
        (category) =>
          category.slug === selectedCategory
      );

      if (subcategory) {
        pageCategoryName = subcategory.name;
        productCategoryIds = [subcategory.id];
      } else {
        productCategoryIds = [];
      }
    }
  }

  // Get active products
 let productQuery = supabase
  .from("products")
  .select(`
    id,
    name,
    slug,
    price,
    sale_price,
    category_id,
    images,
    stock
  `)
  .eq("is_active", true)
  .order("created_at", { ascending: false });

  // Apply category filtering when a category was selected.
  if (productCategoryIds !== null) {
    if (productCategoryIds.length === 0) {
      // No valid category/subcategories found.
      productQuery = productQuery.in(
        "category_id",
        ["00000000-0000-0000-0000-000000000000"]
      );
    } else {
      productQuery = productQuery.in(
        "category_id",
        productCategoryIds
      );
    }
  }
  console.time("SHOP: products query");

  const {
    data: products,
    error: productsError,
  } = await productQuery;
  console.timeEnd("SHOP: products query");

  // Handle database errors
  if (productsError) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-3 text-5xl font-semibold md:text-7xl">
            {pageCategoryName}
          </h1>

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="font-semibold">
              Unable to load products.
            </p>

            <p className="mt-2 text-sm text-white/60">
              {productsError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Category UUID → category name
  const categoryMap = Object.fromEntries(
    allCategories.map((category) => [
      category.id,
      category.name,
    ])
  );

  // Find current parent category for subcategory navigation
  const currentParentCategory =
    selectedCategory
      ? allCategories.find(
          (category) =>
            category.slug === selectedCategory &&
            category.parent_id === null
        )
      : null;

  const currentSubcategories =
    currentParentCategory
      ? allCategories
          .filter(
            (category) =>
              category.parent_id ===
              currentParentCategory.id
          )
          .sort((a, b) =>
            a.name.localeCompare(b.name)
          )
      : [];

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">

       {/* SHOP HEADER */}
<div className="mb-12">
  <Link
    href="/"
    className="group inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition hover:text-white"
  >
    <span className="transition-transform duration-300 group-hover:-translate-x-1">
      ←
    </span>
    Back to Home
  </Link>

  <div className="mt-10">
    <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-white/35">
      MIZO DEALS / COLLECTION
    </p>

    <h1 className="mt-4 text-5xl font-semibold tracking-[-0.03em] md:text-7xl">
      {pageCategoryName}
    </h1>

    <div className="mt-5 flex items-center gap-4">
      <div className="h-px w-10 bg-white/30" />

      <p className="text-sm text-white/50">
        Discover our latest clothing and accessories.
      </p>
    </div>
  </div>
</div>
        {/* CATEGORY NAVIGATION */}
<div className="mb-14 border-y border-white/10 py-6">
  <div className="flex flex-wrap items-center gap-2.5">
  
    <span className="mr-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-white/25">
  Browse
</span>

    {/* ALL */}
    <Link
      href="/shop"
      className={`rounded-full border px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-all duration-300 ${
  !selectedCategory
    ? "border-white bg-white text-black shadow-[0_6px_25px_rgba(255,255,255,0.08)]"
    : "border-white/10 bg-white/[0.025] text-white/45 hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
}`}
    >
      All
    </Link>

    {/* MEN */}
    <Link
      href="/shop?category=men"
      className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
        selectedCategory === "men"
          ? "bg-white text-black shadow-lg shadow-white/5"
          : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      Men
    </Link>

    {/* WOMEN */}
    <Link
      href="/shop?category=women"
      className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
        selectedCategory === "women"
          ? "bg-white text-black shadow-lg shadow-white/5"
          : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      Women
    </Link>

    {/* KIDS */}
    <Link
      href="/shop?category=kids"
      className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
        selectedCategory === "kids"
          ? "bg-white text-black shadow-lg shadow-white/5"
          : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      Kids
    </Link>

    {/* ACCESSORIES */}
    <Link
      href="/shop?category=accessories"
      className={`rounded-full px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] transition-all duration-300 ${
        selectedCategory === "accessories"
          ? "bg-white text-black shadow-lg shadow-white/5"
          : "text-white/45 hover:bg-white/10 hover:text-white"
      }`}
    >
      Accessories
    </Link>
  </div>
</div>
        {/* SUBCATEGORY NAVIGATION */}
        {currentSubcategories.length > 0 && (
          <div className="mb-12">
  <div className="mb-4 flex items-center gap-3">
    <span className="h-px w-6 bg-white/20" />

    <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-white/30">
      {currentParentCategory?.name} Categories
    </p>
  </div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-white/30">
              {currentParentCategory?.name} Categories
            </p>

            <div className="flex flex-wrap gap-2.5">
              <Link
                href={`/shop?category=${currentParentCategory?.slug}`}
                className="
  rounded-full
  border border-white/10
  bg-white/[0.025]
  px-5 py-2.5
  text-[10px]
  font-semibold
  uppercase
  tracking-[0.16em]
  text-white/45
  backdrop-blur-md
  transition-all
  duration-300
  hover:-translate-y-0.5
  hover:border-white/30
  hover:bg-white/[0.08]
  hover:text-white
  hover:shadow-[0_6px_25px_rgba(255,255,255,0.04)]
"
              >
                All {currentParentCategory?.name}
              </Link>

              {currentSubcategories.map(
  (subcategory) => (
    <Link
      key={subcategory.id}
      href={`/shop?category=${subcategory.slug}`}
      className="
        rounded-full
        border border-white/10
        bg-white/[0.025]
        px-5 py-2.5
        text-[10px]
        font-semibold
        uppercase
        tracking-[0.16em]
        text-white/45
        backdrop-blur-md
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:border-white/30
        hover:bg-white/[0.08]
        hover:text-white
        hover:shadow-[0_6px_25px_rgba(255,255,255,0.04)]
      "
    >
      {subcategory.name}
    </Link>
  )
)}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {products && products.length > 0 ? (
         <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">

            {products.map((product) => {

              /*
               * Product images can now be stored as:
               *
               * [
               *   {
               *     url: "...",
               *     publicId: "..."
               *   }
               * ]
               *
               * We also support the old format:
               *
               * [
               *   "https://..."
               * ]
               */

              const images: ProductImage[] =
                Array.isArray(product.images)
                  ? (product.images as ProductImage[])
                  : [];

              const firstImage = images[0];

              const imageUrl =
                typeof firstImage === "string"
                  ? firstImage
                  : firstImage &&
                    typeof firstImage === "object" &&
                    typeof firstImage.url === "string"
                  ? firstImage.url
                  : null;

              // Check whether product is on sale
              const hasSale =
                product.sale_price !== null &&
                product.sale_price < product.price;

              // Get category name
              const categoryName =
                categoryMap[product.category_id ?? ""] ??
                "Uncategorized";

              return (
                <Link
  key={product.id}
  href={`/shop/${product.slug}`}
  className="group relative block overflow-hidden rounded-[28px] border border-white/15 bg-white/[0.055] shadow-[0_8px_40px_rgba(255,255,255,0.04)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-white/30 hover:bg-white/[0.08] hover:shadow-[0_16px_50px_rgba(255,255,255,0.08)]"
>
  {/* LIQUID GLASS HIGHLIGHT */}
  <div className="pointer-events-none absolute inset-0 z-10 rounded-[28px] bg-gradient-to-br from-white/[0.10] via-transparent to-white/[0.02] opacity-70" />

  {/* TOP GLASS REFLECTION */}
  <div className="pointer-events-none absolute left-8 right-8 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />

                  {/* PRODUCT IMAGE */}
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/[0.035]">
  <div
    aria-hidden="true"
    className="
      pointer-events-none
      absolute inset-0 z-10
      bg-gradient-to-t
      from-black/20
      via-transparent
      to-white/[0.04]
      opacity-70
      transition-opacity duration-500
      group-hover:opacity-100
    "
  />

                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                      className="
  object-cover
  transition-transform
  duration-700
  ease-out
  group-hover:scale-[1.06]
"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        No image
                      </div>
                    )}

                    {/* SALE BADGE */}
                    {hasSale && (
                      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 text-xs font-semibold text-black">
                        SALE
                      </span>
                    )}

                  </div>

                  {/* PRODUCT INFORMATION */}
                <div
  className="
    relative z-20
    border-t border-white/10
    bg-black/25
    p-3.5 sm:p-5
    backdrop-blur-xl
    transition-colors duration-500
    group-hover:bg-black/35
  "
>
  {/* CATEGORY */}
  <p
    className="
      text-[10px]
      font-semibold
      uppercase
      tracking-[0.25em]
      text-white/35
      transition-colors
      duration-300
      group-hover:text-white/50
    "
  >
    {categoryName}
  </p>

  {/* PRODUCT NAME */}
  <h2
    className="
      mt-2
      line-clamp-2
      text-lg
      font-medium
      leading-snug
      tracking-[-0.01em]
      text-white
      transition-transform
      duration-300
      group-hover:translate-x-[2px]
    "
  >
    {product.name}
  </h2>

  {/* PRICE */}
  <div className="mt-4 flex items-baseline gap-3">
    {hasSale ? (
      <>
        <span className="text-base font-semibold tracking-tight text-white">
          ₹{product.sale_price?.toFixed(2)}
        </span>

        <span className="text-xs text-white/30 line-through">
          ₹{product.price.toFixed(2)}
        </span>
      </>
    ) : (
      <span className="text-base font-semibold tracking-tight text-white">
        ₹{product.price.toFixed(2)}
      </span>
    )}
  </div>

  {/* STOCK */}
  <p
    className={`mt-2 text-[11px] tracking-wide ${
      product.stock > 0 ? "text-white/30" : "text-white/50"
    }`}
  >
    {product.stock > 0
      ? `${product.stock} in stock`
      : "Out of stock"}
  </p>
</div>
                </Link>
              );
            })}

          </div>
        ) : (

          /* EMPTY STORE */
          <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center">

            <h2 className="text-2xl font-medium">
              No products found
            </h2>

            <p className="mt-3 text-white/50">
              There are currently no products in this category.
            </p>

            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-xs font-semibold tracking-[0.15em] text-black transition hover:bg-white/90"
            >
              VIEW ALL PRODUCTS
            </Link>

          </div>
        )}

      </div>
    </main>
  );
}