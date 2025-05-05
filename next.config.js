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
// module.exports = {
//   async headers() {
//     return [
//       {
//         // matching all API routes
//         source: "/api/:path*",
//         headers: [
//           { key: "Access-Control-Allow-Credentials", value: "true" },
//           { key: "Access-Control-Allow-Origin", value: "*" },
//           { key: "Access-Control-Allow-Methods", value: "GET,OPTIONS,PATCH,DELETE,POST,PUT" },
//           { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
//         ]
//       }
//     ]
//   }
// };
