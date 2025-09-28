import { v2 as cloudinary } from "cloudinary";

// Configuración de Cloudinary
cloudinary.config({
  cloud_name: "ds9ive0oy",       // tu cloud_name
  api_key: "783236721288797",    // tu api_key
  api_secret: "eciciJYUqGr-EkcpeaaAiqpV3gw", // tu api_secret
});

export default cloudinary; // exportación por defecto
