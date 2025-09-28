import cloudinary from "../../lib/cloudinary";


interface Props {
  searchParams?: { deporte?: string };
}

export async function GET(req: Request, { searchParams }: Props) {
  try {
    const deporte = searchParams?.deporte || ""; // nombre de la carpeta
    const result = await cloudinary.api.resources({
      type: "upload",
      prefix: `galeria_deportes/${deporte}`, // subcarpeta del deporte
      max_results: 100,
    });

    const urls = result.resources.map((res) => res.secure_url);

    return new Response(JSON.stringify(urls), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "No se pudieron obtener las imágenes" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
