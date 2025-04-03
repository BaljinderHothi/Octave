/** @type {import('next').NextConfig} */
const nextConfig = {
  //Yelp images so that we can just display them when needed on frontend
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 's3-media1.fl.yelpcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3-media2.fl.yelpcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3-media3.fl.yelpcdn.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 's3-media4.fl.yelpcdn.com',
        pathname: '/**',
      }
    ],
  },
}

module.exports = nextConfig
