/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // OneDrive / network folders often break native file watching; polling keeps dev server responsive.
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

module.exports = nextConfig;
