import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      '@solana/web3.js',
      '@saros-finance/dlmm-sdk',
      '@meteora-ag/dlmm',
      '@pythnetwork/price-service-client'
    ],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Externalize large packages for server-side rendering
      config.externals = config.externals || [];
      config.externals.push({
        '@solana/web3.js': 'commonjs @solana/web3.js',
        '@saros-finance/dlmm-sdk': 'commonjs @saros-finance/dlmm-sdk',
        '@meteora-ag/dlmm': 'commonjs @meteora-ag/dlmm',
        '@pythnetwork/price-service-client': 'commonjs @pythnetwork/price-service-client'
      });
    }

    // Optimize bundle splitting
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          solana: {
            test: /[\\/]node_modules[\\/](@solana|@saros-finance|@meteora-ag|@pythnetwork)[\\/]/,
            name: 'solana',
            chunks: 'all',
            priority: 10,
          },
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
        },
      },
    };

    return config;
  },
  // Reduce bundle size by excluding unnecessary files
  outputFileTracing: true,
  outputFileTracingExcludes: {
    '*': [
      'node_modules/@solana/**/*',
      'node_modules/@saros-finance/**/*',
      'node_modules/@meteora-ag/**/*',
      'node_modules/@pythnetwork/**/*'
    ]
  }
};

export default nextConfig;
