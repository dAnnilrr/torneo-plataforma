import cloudinary from "@lib/cloudinary";

export async function POST(req: Request) {
  try {
    // Se espera que el body del request contenga la imagen en base64 o URL
    const data = await req.json();

    const result = await cloudinary.uploader.upload(data.image, {
      folder: "torneo-sports", // Carpeta en Cloudinary donde se guardarán las imágenes
    });

    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    // Manejo seguro de errores de tipo desconocido
    const message = error instanceof Error ? error.message : String(error);
    return new Response(JSON.stringify({ success: false, error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
