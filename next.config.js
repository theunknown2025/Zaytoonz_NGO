/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'output: export' for Netlify deployment with API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  }
}

module.exports = nextConfig