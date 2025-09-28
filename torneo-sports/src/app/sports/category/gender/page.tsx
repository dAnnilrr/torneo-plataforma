'use client'

import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'

export default function GenderPage() {
  // useParams te da los valores de [sport], [category] y [gender]
  const params = useParams()
  const { sport, category, gender } = params

  // Ejemplo de videos por deporte y categoría (puedes personalizar)
  const videos = [
    { title: 'Transmisión en vivo', url: 'https://www.youtube.com/embed/VIDEO_ID_1' },
    { title: 'Resumen del partido', url: 'https://www.youtube.com/embed/VIDEO_ID_2' },
  ]

  return (
    <div className="min-h-screen bg-blue-900 text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-5xl mx-auto p-8 bg-blue-950 rounded-2xl shadow-lg"
      >
        <h1 className="text-4xl font-bold mb-4">{sport}</h1>
        <p className="mb-2">Categoría: <strong>{category}</strong></p>
        <p className="mb-4">Género: <strong>{gender}</strong></p>
        <p className="mb-6">
          Aquí puedes agregar información de partidos, documentos y resultados.
        </p>

        {/* Sección de videos */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {videos.map((video, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: idx * 0.2 }}
              className="bg-blue-950 p-4 rounded-xl shadow-md"
            >
              <h3 className="font-semibold mb-2">{video.title}</h3>
              <div className="aspect-video relative">
                <iframe
                  src={video.url}
                  title={video.title}
                  allowFullScreen
                  className="w-full h-full rounded-lg"
                />
              </div>
            </motion.div>
          ))}
        </section>
      </motion.div>
    </div>
  )
}
