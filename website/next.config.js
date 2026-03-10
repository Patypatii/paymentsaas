/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async redirects() {
    return [
      {
        source: '/register',
        destination: 'http://localhost:3001/register',
        permanent: false,
      },
      {
        source: '/signup',
        destination: 'http://localhost:3001/register',
        permanent: false,
      },
      {
        source: '/login',
        destination: 'http://localhost:3001/login',
        permanent: false,
      },
    ]
  },
}

module.exports = nextConfig
