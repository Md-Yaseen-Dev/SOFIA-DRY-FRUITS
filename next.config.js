/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
      },
      {
        protocol: 'https',
        hostname: 'old.katerinaperez.com',
      },
      {
        protocol: 'https',
        hostname: 'imgmediagumlet.lbb.in',
      },
      {
        protocol: 'https',
        hostname: 'jewelboxbyarnav.com',
      },
      {
        protocol: 'https',
        hostname: 'backtobasicstv.wordpress.com',
      },
    ],
  },
}

export default nextConfig;