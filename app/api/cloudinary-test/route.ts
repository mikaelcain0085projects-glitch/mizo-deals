import cloudinary from "../../../lib/cloudinary";

export async function GET() {
  try {
    const result = await cloudinary.api.ping();

    return Response.json({
      success: true,
      message: "Cloudinary connection successful.",
      status: result.status,
    });
  } catch (error) {
    console.error("Cloudinary connection test failed:", error);

    return Response.json(
      {
        success: false,
        message: "Cloudinary connection failed.",
      },
      { status: 500 }
    );
  }
}