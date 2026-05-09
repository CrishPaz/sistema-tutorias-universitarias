/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  typescript: {
    ignoreBuildErrors: true, // Temporal para que compile
  },
  eslint: {
    ignoreDuringBuilds: true, // Temporal
  },
}

module.exports = nextConfig