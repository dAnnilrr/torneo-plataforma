import { NextRequest, NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const result = await cloudinary.uploader.upload(data.image, {
      folder: "torneo-sports",
    });
    return NextResponse.json({ result });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
