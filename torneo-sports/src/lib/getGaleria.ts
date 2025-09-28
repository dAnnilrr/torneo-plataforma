import cloudinary from "./cloudinary";

export const getGaleria = async (carpeta: string) => {
  try {
    const result = await cloudinary.search
      .expression(`folder:${carpeta}`)
      .sort_by("public_id", "asc")
      .max_results(50)
      .execute();

    return result.resources.map((img: any) => img.secure_url);
  } catch (error) {
    console.error("Error al cargar galería:", error);
    return [];
  }
};
