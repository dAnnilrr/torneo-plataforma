// lib/cloudinary.ts (solo servidor)
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: "ds9ive0oy",
  api_key: "783236721288797",
  api_secret: "eciciJYUqGr-EkcpeaaAiqpV3gw",
});

export default cloudinary;
