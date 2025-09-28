/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['drive.google.com'], // permite cargar imágenes desde Google Drive
  },
}

module.exports = nextConfig
