import type { NextRequest } from "next/server";
import cloudinary from '@lib/cloudinary';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Subida a Cloudinary
    const uploadResult = await cloudinary.uploader.upload(data.image, {
      folder: "torneo-sports",
    });

    return new Response(JSON.stringify({ url: uploadResult.secure_url }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
