import { createClient } from "./supabase-browser";

async function getAuthenticatedUser() {
  const supabase = createClient();

  // First try the current authenticated user
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (user) {
    return user;
  }

  // If getUser does not return a user, check the stored session.
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.user) {
    return session.user;
  }

  if (userError) {
    console.error("Supabase authentication error:", userError);
  }

  throw new Error("Please log in to use your cart.");
}

export async function getOrCreateCart() {
  const supabase = createClient();

  const user = await getAuthenticatedUser();

  const { data: existingCart, error: cartError } =
    await supabase
      .from("cart")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();

  if (cartError) {
    throw new Error(cartError.message);
  }

  if (existingCart) {
    return existingCart.id;
  }

  const { data: newCart, error: createError } =
    await supabase
      .from("cart")
      .insert({
        user_id: user.id,
      })
      .select("id")
      .single();

  if (createError) {
    throw new Error(createError.message);
  }

  return newCart.id;
}

type AddToCartParams = {
  productId: string;
  quantity: number;
  size: string;
  color: string;
};

export async function addToCart({
  productId,
  quantity,
  size,
  color,
}: AddToCartParams) {
  const supabase = createClient();

  const cartId = await getOrCreateCart();

  const {
    data: existingItem,
    error: existingError,
  } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .eq("size", size)
    .eq("color", color)
    .maybeSingle();

  if (existingError) {
    throw new Error(existingError.message);
  }

  if (existingItem) {
    const { error: updateError } =
      await supabase
        .from("cart_items")
        .update({
          quantity: existingItem.quantity + quantity,
        })
        .eq("id", existingItem.id);

    if (updateError) {
      throw new Error(updateError.message);
    }

    return existingItem.id;
  }

  const { data: newItem, error: insertError } =
    await supabase
      .from("cart_items")
      .insert({
        cart_id: cartId,
        product_id: productId,
        quantity,
        size,
        color,
      })
      .select("id")
      .single();

  if (insertError) {
    throw new Error(insertError.message);
  }

  return newItem.id;
}