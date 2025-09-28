import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const result = await cloudinary.uploader.upload(data.image, {
      folder: "torneo-sports",
    });
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (error) {
    console.error(error);
    return new Response("Error uploading image", { status: 500 });
  }
}
