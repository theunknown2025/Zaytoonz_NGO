/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'output: export' for Netlify deployment with API routes
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  // Exclude directories from Next.js routing
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  // Custom webpack configuration to exclude venv and other non-app directories
  webpack: (config, { isServer, webpack }) => {
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
    
    // Exclude Python venv and other non-JS files from webpack processing
    // This prevents webpack from trying to process Python files
    config.plugins = config.plugins || [];
    
    // Ignore venv directories and Python files completely
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /.*/,
        contextRegExp: /(venv|__pycache__|app\/admin\/Scrape_Master\/venv|Scrape_Master\/venv)/,
      })
    );
    
    // Exclude venv from module resolution
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // Ignore patterns for webpack watch
    config.watchOptions = {
      ...config.watchOptions,
      ignored: [
        '**/node_modules/**',
        '**/.next/**',
        '**/venv/**',
        '**/__pycache__/**',
        '**/*.py',
        '**/*.pyc',
        '**/app/admin/Scrape_Master/venv/**',
        '**/Scrape_Master/venv/**',
        '**/app/seeker/project/**', // Exclude Vite sub-project
      ],
    };
    
    // Exclude Vite sub-project from compilation
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /^\.\/.*$/,
        contextRegExp: /app\/seeker\/project/,
      })
    );
    
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
    // Exclude venv from output file tracing
    outputFileTracingExcludes: {
      '*': [
        '**/venv/**',
        '**/__pycache__/**',
        '**/app/admin/Scrape_Master/venv/**',
        '**/app/seeker/project/**',
      ],
    },
  },
}

module.exports = nextConfig