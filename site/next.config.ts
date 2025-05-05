/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack: (config: {
    experiments: {
      asyncWebAssembly: boolean;
      topLevelAwait: boolean;
      layers: boolean;
    };
  }) => {
    config.experiments = {
      asyncWebAssembly: true,
      topLevelAwait: true,
      layers: true, // optional, with some bundlers/frameworks it doesn't work without
    };

    return config;
  },
};

module.exports = nextConfig;
