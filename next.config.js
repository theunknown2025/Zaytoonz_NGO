/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'output: export' for Netlify deployment with API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack: (config, { isServer }) => {
    // Fix for undici private fields issue
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
        undici: false,
      };
    }
    
    // Exclude problematic modules from webpack processing
    config.externals = config.externals || [];
    if (!isServer) {
      config.externals.push('undici');
    }
    
    // Handle private fields syntax for undici
    config.module.rules.push({
      test: /\.m?js$/,
      include: /node_modules\/undici/,
      type: 'javascript/auto',
      resolve: {
        fullySpecified: false,
      },
      parser: {
        // Disable parsing of private fields to avoid syntax errors
        requireEnsure: false,
      },
    });



    return config;
  },
  experimental: {
    // Enable SWC for better compatibility
    esmExternals: 'loose',
    serverComponentsExternalPackages: [],
  },
}

module.exports = nextConfig