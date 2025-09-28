import type { NextRequest } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const { secure_url } = await cloudinary.uploader.upload(data.image, {
      folder: "torneo-sports",
    });

    return new Response(JSON.stringify({ url: secure_url }), {
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Upload failed" }), {
      status: 500,
    });
  }
}
