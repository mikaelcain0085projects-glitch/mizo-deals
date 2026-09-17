import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../lib/supabase-server";

export default async function WishlistPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/account/login");
  }

  const { data: wishlist, error } = await supabase
    .from("wishlist")
    .select(`
      id,
      product_id,
      products (
        id,
        name,
        slug,
        price,
        sale_price,
        images
      )
    `)
    .eq("user_id", user.id);

  if (error) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-semibold">Wishlist</h1>
          <p className="mt-6 text-red-300">
            Unable to load your wishlist.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
  <Link
    href="/"
    className="mb-8 inline-flex rounded-full border border-white/20 px-5 py-2.5 text-xs font-semibold tracking-[0.15em] text-white/70 transition hover:border-white hover:bg-white hover:text-black"
  >
    ← BACK TO HOME
  </Link>

  <p className="text-sm uppercase tracking-[0.3em] text-white/50">
    Your Collection
  </p>

  <h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-5xl">
    Wishlist
  </h1>
</div>

        {!wishlist || wishlist.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-6 py-20 text-center">
            <h2 className="text-2xl font-medium">
              Your wishlist is empty.
            </h2>

            <p className="mt-3 text-white/50">
              Save pieces you love and find them here later.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-flex rounded-full bg-white px-7 py-3 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
            >
              SHOP NOW →
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlist.map((item) => {
              const product = Array.isArray(item.products)
                ? item.products[0]
                : item.products;

              if (!product) return null;

              const images = Array.isArray(product.images)
  ? product.images
  : [];

const firstImage = images[0];

const image =
  typeof firstImage === "string"
    ? firstImage
    : firstImage &&
        typeof firstImage === "object" &&
        typeof firstImage.url === "string"
      ? firstImage.url
      : null;

              const price =
                product.sale_price ?? product.price;

              return (
                <Link
                  key={item.id}
                  href={`/shop/${product.slug}`}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition hover:border-white/20"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    {image ? (
                      <img
  src={image}
  alt={product.name}
  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
/>                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        No image
                      </div>
                    )}
                  </div>

                  <div className="p-5">
                    <h2 className="font-medium">{product.name}</h2>

                    <p className="mt-2 text-white/70">
                      ₹{Number(price).toLocaleString("en-IN")}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}