/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: "export",
  allowedDevOrigins: ['192.168.0.105', 'localhost'],
}

export default nextConfig
