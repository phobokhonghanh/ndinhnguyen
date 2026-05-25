import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

if (process.env.NODE_ENV === 'development') {
  void initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ['192.168.2.21'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        pathname: '/verified-storage/cert/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
