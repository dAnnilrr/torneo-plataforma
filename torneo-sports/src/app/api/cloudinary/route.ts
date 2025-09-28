// app/api/galeria/route.ts
import { NextResponse } from "next/server";
import cloudinary from "../../../lib/cloudinary";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const carpeta = url.searchParams.get("carpeta");

    if (!carpeta) {
      return NextResponse.json({ error: "Falta carpeta" }, { status: 400 });
    }

    const res = await cloudinary.search
      .expression(`folder:${carpeta}`)
      .sort_by("public_id", "asc")
      .max_results(30)
      .execute();

    const urls = Array.isArray(res.resources)
      ? res.resources.map((r: { secure_url: string }) => r.secure_url)
      : [];

    return NextResponse.json({ urls });
  } catch (error: unknown) {
    console.error("Error al obtener galería:", error);
    return NextResponse.json(
      {
        error: "Error al obtener galería",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
