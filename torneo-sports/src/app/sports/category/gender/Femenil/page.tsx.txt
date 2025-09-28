'use client'

import { motion, AnimatePresence } from "framer-motion"

export default function GenderFemenilPage() {
  const sport = "Voleibol"       // Cambiar según la carpeta
  const category = "Juvenil"     // Cambiar según la carpeta
  const gender = "Femenil"

  const videos = [
    { title: "Transmisión en vivo", url: "https://www.youtube.com/embed/VIDEO_ID_3" },
    { title: "Resumen del partido", url: "https://www.youtube.com/embed/VIDEO_ID_4" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-800 font-sans text-white p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 bg-blue-950 border border-blue-800 rounded-2xl shadow-lg text-white"
      >
        <h2 className="text-3xl font-bold mb-4">{sport}</h2>
        <p className="mb-2">Categoría: <strong>{category}</strong></p>
        <p className="mb-4">Género: <strong>{gender}</strong></p>
        <p>
          Aquí podrás gestionar los partidos y equipos correspondientes. 
          <br />
          Puedes adjuntar documentos, actualizar resultados y administrar la información de esta sección.
        </p>
      </motion.div>

      {/* Sección de videos */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Transmisiones y Resúmenes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        </div>
      </section>
    </div>
  )
}
