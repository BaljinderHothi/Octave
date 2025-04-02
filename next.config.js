/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.fl.yelpcdn.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
