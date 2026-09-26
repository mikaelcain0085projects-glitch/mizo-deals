import Image from "next/image";
import Link from "next/link";
import CartItemActions from "../../components/CartItemActions";
import { createClient } from "../../lib/supabase-server";

type CartItem = {
  id: string;
  quantity: number;
  size: string;
  color: string;
  product: {
    id: string;
    name: string;
    price: number;
    sale_price: number | null;
    images: unknown;
    stock: number;
  } | null;
};

export default async function CartPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Your Cart
          </h1>

          <p className="mt-6 text-white/50">
            Please log in to view your shopping cart.
          </p>

          <Link
            href="/account/login"
            className="mt-10 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
          >
            LOGIN
          </Link>
        </div>
      </main>
    );
  }

  const { data: cart, error: cartError } = await supabase
    .from("cart")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (cartError) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-semibold">
            Your Cart
          </h1>

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-300">
              Unable to load your cart.
            </p>

            <p className="mt-2 text-sm text-white/50">
              {cartError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Your Cart
          </h1>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-2xl font-medium">
              Your cart is empty
            </h2>

            <p className="mt-3 text-white/50">
              Add something from our collection to get started.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const { data: items, error: itemsError } = await supabase
    .from("cart_items")
    .select(`
      id,
      quantity,
      size,
      color,
      product:products (
        id,
        name,
        price,
        sale_price,
        images,
        stock
      )
    `)
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });

  if (itemsError) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-5xl">
          <h1 className="text-5xl font-semibold">
            Your Cart
          </h1>

          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
            <p className="text-red-300">
              Unable to load cart items.
            </p>

            <p className="mt-2 text-sm text-white/50">
              {itemsError.message}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const cartItems = (items ?? []) as unknown as CartItem[];

  if (cartItems.length === 0) {
    return (
      <main className="min-h-screen bg-black px-6 py-32 text-white">
        <div className="mx-auto max-w-5xl">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Your Cart
          </h1>

          <div className="mt-12 rounded-2xl border border-white/10 bg-white/5 p-12 text-center">
            <h2 className="text-2xl font-medium">
              Your cart is empty
            </h2>

            <p className="mt-3 text-white/50">
              Add something from our collection to get started.
            </p>

            <Link
              href="/shop"
              className="mt-8 inline-block rounded-full bg-white px-8 py-4 text-sm font-semibold tracking-widest text-black transition hover:bg-white/80"
            >
              SHOP NOW
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const validItems = cartItems.filter(
    (item) => item.product !== null
  );

  const subtotal = validItems.reduce((total, item) => {
    const product = item.product!;

    const hasSale =
      product.sale_price !== null &&
      product.sale_price < product.price;

    const price = hasSale
      ? product.sale_price!
      : product.price;

    return total + price * item.quantity;
  }, 0);

  return (
    <main className="min-h-screen bg-black px-6 py-32 text-white">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12">
          <p className="text-sm tracking-[0.3em] text-white/50">
            MIZO DEALS
          </p>

          <h1 className="mt-4 text-5xl font-semibold md:text-7xl">
            Your Cart
          </h1>

          <p className="mt-5 text-white/50">
            Review your selected items before checkout.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="space-y-5">
            {validItems.map((item) => {
              const product = item.product!;

              type ProductImage =
  | string
  | {
      url?: string;
      publicId?: string;
    };

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

              const hasSale =
                product.sale_price !== null &&
                product.sale_price < product.price;

              const currentPrice = hasSale
                ? product.sale_price!
                : product.price;

              const itemTotal =
                currentPrice * item.quantity;

              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-6 rounded-2xl border border-white/10 bg-white/5 p-5 sm:flex-row"
                >
                  <div className="flex h-40 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/10 sm:w-32">
                    {imageUrl ? (
                      <Image
  src={imageUrl}
  alt={product.name}
  width={320}
  height={400}
  className="h-full w-full object-cover"
/>                    ) : (
                      <span className="text-xs text-white/30">
                        No image
                      </span>
                    )}
                  </div>

                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-white/40">
                        Product
                      </p>

                      <h2 className="mt-2 text-xl font-medium">
                        {product.name}
                      </h2>

                      <div className="mt-3 space-y-1 text-sm text-white/50">
                        {item.size && (
                          <p>
                            Size:{" "}
                            <span className="text-white/80">
                              {item.size}
                            </span>
                          </p>
                        )}

                        {item.color && (
                          <p>
                            Color:{" "}
                            <span className="text-white/80">
                              {item.color}
                            </span>
                          </p>
                        )}

                        <CartItemActions
  itemId={item.id}
  quantity={item.quantity}
  stock={product.stock}
/>
                      </div>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-4">
                      <div>
                        {hasSale && (
                          <span className="mr-3 text-sm text-white/40 line-through">
                            ₹{product.price.toFixed(2)}
                          </span>
                        )}

                        <span className="font-semibold">
                          ₹{currentPrice.toFixed(2)}
                        </span>
                      </div>

                      <span className="font-semibold">
                        ₹{itemTotal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <aside className="h-fit rounded-2xl border border-white/10 bg-white/5 p-6 lg:sticky lg:top-28">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40">
              Order Summary
            </p>

            <div className="mt-8 flex items-center justify-between text-white/60">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="mt-4 flex items-center justify-between text-white/60">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>

            <div className="my-6 border-t border-white/10" />

            <div className="flex items-center justify-between space-y-3  text-lg font-semibold">
              <span>Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            

           <Link
  href="/checkout"
  className="flex w-full items-center justify-center rounded-full bg-green-600 px-6 py-3 text-sm font-normal tracking-[0.15em] text-black transition hover:bg-white/70"
>
  PROCEED TO CHECKOUT
</Link>

 <div className="mt-5 flex justify-center">


            <Link
  href="/shop"
  className="
    group relative inline-flex items-center gap-3
    overflow-hidden
    rounded-full
    border border-white/15
    bg-white/[0.045]
    px-5 py-3
    text-xs font-semibold uppercase
    tracking-[0.16em]
    text-white/70
    shadow-[0_8px_30px_rgba(0,0,0,0.25)]
    backdrop-blur-xl
    transition-all duration-300
    hover:-translate-y-0.5
    hover:border-orange-500/40
    hover:bg-white/[0.08]
    hover:text-orange-400
    hover:shadow-[0_12px_35px_rgba(249,115,22,0.12)]
  "
>
  <span
    className="
      pointer-events-none absolute inset-x-8 top-0 h-px
      bg-gradient-to-r
      from-transparent
      via-white/40
      to-transparent
    "
  />
  

  <span className="relative transition-transform duration-300 group-hover:-translate-x-1">
    ←
  </span>

  <span className="relative">
    CONTINUE SHOPPING
  </span>
</Link>
</div>

          </aside>
        </div>
      </div>
    </main>
  );
}