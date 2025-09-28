// src/app/api/cloudinary/route.ts
import { NextResponse } from 'next/server';
import cloudinary from '../../../lib/cloudinary'; // ← ruta corregida

interface CloudinaryResource {
  secure_url: string;
  public_id: string;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const carpeta = url.searchParams.get('carpeta');

    if (!carpeta) {
      return NextResponse.json({ error: 'Falta carpeta' }, { status: 400 });
    }

    const res = await cloudinary.search
      .expression(`folder:${carpeta}`)
      .sort_by('public_id', 'asc')
      .max_results(30)
      .execute();

    const urls: string[] = (res.resources as CloudinaryResource[]).map(r => r.secure_url);

    return NextResponse.json({ urls });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { 
        error: 'Error al obtener galería', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}
