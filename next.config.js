/** @type {import('next').NextConfig} */
const nextConfig = {
  //Yelp images so that we can just display them when needed on frontend
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
