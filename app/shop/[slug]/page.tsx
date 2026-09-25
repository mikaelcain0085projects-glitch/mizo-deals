import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "../../../lib/supabase";
import ProductActions from "../../../components/ProductActions";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProductImage =
  | string
  | {
      url?: string;
      publicId?: string;
    };

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;

  // Get the product
  const { data: product, error: productError } = await supabase
    .from("products")
    .select(`
      id,
      name,
      slug,
      description,
      price,
      sale_price,
      category_id,
      images,
      stock,
      sizes,
      colors,
      created_at
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .single();

  // Product doesn't exist
  if (productError || !product) {
    notFound();
  }

  // Get the category
  const { data: category } = await supabase
    .from("categories")
    .select("name, slug")
    .eq("id", product.category_id)
    .eq("is_active", true)
    .single();

  // Product images
  // Supports both:
  // ["https://..."]
  //
  // and the new Cloudinary format:
  // [
  //   {
  //     url: "https://...",
  //     publicId: "..."
  //   }
  // ]
  const images: ProductImage[] = Array.isArray(product.images)
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

  // Product options
  const sizes = Array.isArray(product.sizes)
    ? product.sizes
    : [];

  const colors = Array.isArray(product.colors)
    ? product.colors
    : [];

  // Sale calculation
  const hasSale =
    product.sale_price !== null &&
    product.sale_price < product.price;

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">

        {/* BACK TO SHOP */}
        <Link
          href="/shop"
          className="inline-flex items-center text-sm tracking-widest text-orange-500 transition hover:text-white"
        >
          ← BACK TO SHOP
        </Link>

        {/* PRODUCT */}
        <div className="mt-10 grid gap-12 lg:grid-cols-2">

          {/* PRODUCT IMAGES */}
<div className="grid grid-cols-2 gap-4">

  {/* FRONT IMAGE */}
  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/10">

    {imageUrl ? (
      <Image
        src={imageUrl}
        alt={`${product.name} front`}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 50vw, 25vw"
      />
    ) : (
      <div className="flex h-full items-center justify-center text-white/30">
        No image
      </div>
    )}

    <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
      Front
    </span>

    {/* SALE BADGE */}
    {hasSale && (
      <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-black">
        SALE
      </span>
    )}
  </div>

  {/* BACK IMAGE */}
  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-white/10">

    {images[1] ? (
      <Image
        src={
          typeof images[1] === "string"
            ? images[1]
            : images[1].url ?? ""
        }
        alt={`${product.name} back`}
        fill
        className="object-cover"
        sizes="(max-width: 1024px) 50vw, 25vw"
      />
    ) : (
      <div className="flex h-full items-center justify-center text-white/30">
        No back image
      </div>
    )}

    <span className="absolute bottom-4 left-4 rounded-full bg-black/70 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-white">
      Back
    </span>
  </div>

</div>
          {/* PRODUCT INFORMATION */}
          <div className="flex flex-col justify-center">

            {/* CATEGORY */}
            <p className="text-sm uppercase tracking-[0.3em] text-white/40">
              {category?.name ?? "Uncategorized"}
            </p>

            {/* NAME */}
            <h1 className="mt-4 text-2xl font-medium md:text-3xl">
              {product.name}
            </h1>

            {/* DESCRIPTION */}
            {product.description && (
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/60">
                {product.description}
              </p>
            )}

            {/* PRICE */}
            <div className="mt-8 flex items-center gap-4">

              {hasSale ? (
                <>
                  <span className="text-2xl font-semibold">
                    ₹{product.sale_price?.toFixed(2)}
                  </span>

                  <span className="text-lg text-white/40 line-through">
                    ₹{product.price.toFixed(2)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-semibold">
                  ₹{product.price.toFixed(2)}
                </span>
              )}

            </div>

            {/* STOCK */}
            <p className="mt-4 text-sm text-white/50">
              {product.stock > 0
                ? `${product.stock} items available`
                : "Out of stock"}
            </p>

            {/* PRODUCT ACTIONS */}
            <ProductActions
              productId={product.id}
              productName={product.name}
              stock={product.stock}
              sizes={sizes}
              colors={colors}
            />

          </div>
        </div>
      </div>
    </main>
  );
}