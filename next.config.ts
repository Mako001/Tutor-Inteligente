import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    allowedDevOrigins: [
      "http://9003-idx-studio-1745692312226.cluster-pgviq6mvsncnqxx6kr7pbz65v6.cloudworkstations.dev",
      // It's good practice to also allow localhost if you might access it directly
      "http://localhost:9003",
    ],
  },
};

export default nextConfig;
