import cloudinary from "../../../lib/cloudinary";
import { createClient } from "../../../lib/supabase-server";

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
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (profileError || !profile || profile.role !== "admin") {
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
    const publicId =
      typeof body?.publicId === "string"
        ? body.publicId.trim()
        : "";

    if (!publicId) {
      return Response.json(
        {
          success: false,
          message: "Cloudinary public ID is required.",
        },
        { status: 400 }
      );
    }

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      type: "upload",
      invalidate: true,
    });

    if (
      result.result !== "ok" &&
      result.result !== "not found"
    ) {
      return Response.json(
        {
          success: false,
          message: `Cloudinary deletion failed: ${result.result}`,
        },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      result: result.result,
      publicId,
    });
  } catch (error) {
    console.error("Cloudinary delete error:", error);

    return Response.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Cloudinary deletion failed.",
      },
      { status: 500 }
    );
  }
}