/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  env: {
    API_URL: process.env.API_URL || 'http://localhost:5000/api/v1',
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: 'public_4BIiXvUAWVr/Xofv+jcstrvng2o=',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: 'https://ik.imagekit.io/srv4rp6ya',
  },
}

module.exports = nextConfig
