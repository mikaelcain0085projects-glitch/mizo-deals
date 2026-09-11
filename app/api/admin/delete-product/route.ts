import cloudinary from "../../../../lib/cloudinary";
import { createClient } from "../../../../lib/supabase-server";

type ProductImage = {
  url?: string;
  publicId?: string;
};

export async function POST(request: Request) {
  try {
    // Verify authenticated user
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return Response.json(
        {
          success: false,
          message: "Authentication required.",
        },
        { status: 401 }
      );
    }

    // Verify admin role
    const { data: profile, error: profileError } =
      await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

    if (
      profileError ||
      !profile ||
      profile.role !== "admin"
    ) {
      return Response.json(
        {
          success: false,
          message: "Admin access required.",
        },
        { status: 403 }
      );
    }

    // Read request body
    const body = await request.json();

    const productId =
      typeof body?.productId === "string"
        ? body.productId.trim()
        : "";

    if (!productId) {
      return Response.json(
        {
          success: false,
          message: "Product ID is required.",
        },
        { status: 400 }
      );
    }

    // Load product images before deleting the product
    const { data: product, error: productError } =
      await supabase
        .from("products")
        .select("id, name, images")
        .eq("id", productId)
        .maybeSingle();

    if (productError) {
      return Response.json(
        {
          success: false,
          message: productError.message,
        },
        { status: 500 }
      );
    }

    if (!product) {
      return Response.json(
        {
          success: false,
          message: "Product not found.",
        },
        { status: 404 }
      );
    }

    const images: ProductImage[] = Array.isArray(
      product.images
    )
      ? product.images.filter(
          (image): image is ProductImage =>
            typeof image === "object" &&
            image !== null
        )
      : [];

    // Delete Cloudinary images first.
    for (const image of images) {
      if (!image.publicId) {
        continue;
      }

      const cloudinaryResult =
        await cloudinary.uploader.destroy(
          image.publicId,
          {
            resource_type: "image",
            type: "upload",
            invalidate: true,
          }
        );

      if (
        cloudinaryResult.result !== "ok" &&
        cloudinaryResult.result !== "not found"
      ) {
        return Response.json(
          {
            success: false,
            message:
              `Could not delete Cloudinary image ` +
              `${image.publicId}. Product was not deleted.`,
          },
          { status: 500 }
        );
      }
    }

    // Delete product from Supabase.
    // cart_items and wishlist will cascade.
    // order_items will keep the historical item and
    // set product_id to NULL.
    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", productId);

    if (deleteError) {
      return Response.json(
        {
          success: false,
          message: deleteError.message,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      message: `Product "${product.name}" deleted successfully.`,
    });
  } catch (error) {
    console.error("Delete product error:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Product deletion failed.",
      },
      { status: 500 }
    );
  }
}