'use client'

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export default function Galeria() {
  const [imagenes, setImagenes] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/cloudinary")
      .then(res => res.json())
      .then(data => setImagenes(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {imagenes.map((url, idx) => (
        <motion.div key={idx} whileHover={{ scale: 1.05 }} className="overflow-hidden rounded-xl shadow-md group">
          <Image
            src={url}
            alt={`Foto ${idx + 1}`}
            width={300}
            height={200}
            className="object-cover transform group-hover:scale-110 transition duration-300"
          />
        </motion.div>
      ))}
    </div>
  );
}
