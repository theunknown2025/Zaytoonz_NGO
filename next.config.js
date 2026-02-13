/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Remove 'output: export' for Netlify deployment with API routes
  trailingSlash: true,
  // Configure basePath for deployment (empty for root deployment)
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  images: {
    unoptimized: true
  },
  // Don't fail build on prerender errors (pages will be rendered on-demand)
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
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
    // This prevents Next.js from trying to process Python virtual environment files
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /.*/,
        contextRegExp: /(venv|__pycache__|python_scraper\/venv|Scrape_Master\/venv)/,
      })
    );

    // Exclude venv from module resolution completely
    config.resolve = config.resolve || {};
    config.resolve.alias = {
      ...config.resolve.alias,
      // Explicitly set @ alias to ensure it works during build
      '@': require('path').resolve(__dirname),
    };

    // Add a custom plugin to exclude venv from file system scanning
    // This prevents Next.js from trying to process Python virtual environment directories
    const path = require('path');
    const fs = require('fs');

    // Custom plugin to filter out venv directories during build
    config.plugins.push({
      apply: (compiler) => {
        compiler.hooks.normalModuleFactory.tap('ExcludeVenvPlugin', (nmf) => {
          nmf.hooks.beforeResolve.tap('ExcludeVenvPlugin', (data) => {
            if (data && data.context) {
              const contextPath = data.context;
              // Exclude any module resolution that includes venv
              if (
                contextPath.includes('venv') ||
                contextPath.includes('__pycache__') ||
                contextPath.includes('python_scraper/venv') ||
                contextPath.includes('Scrape_Master/venv')
              ) {
                return false; // Skip this module
              }
            }
          });
        });
      },
    });

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
        '**/python_scraper/venv/**',
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
        '**/python_scraper/venv/**',
        '**/Scrape_Master/venv/**',
        '**/app/seeker/project/**',
      ],
    },
  },
  // Allow build to continue even if some pages fail to prerender
  // Pages marked as dynamic will be rendered on-demand
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig