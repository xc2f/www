import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : 'http://localhost:3000')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // libsql selects its native package with a dynamic require that tracing can miss.
  // Include both pnpm's native package files and the links used by libsql to resolve them.
  outputFileTracingIncludes: {
    '/*': [
      'node_modules/.pnpm/libsql@*/node_modules/@libsql/**/*',
      'node_modules/.pnpm/@libsql+*/node_modules/@libsql/**/*',
    ],
  },
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL, process.env.S3_ENDPOINT].filter(Boolean).map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          pathname: '/**',
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // 允许在相同域名下的 iframe 中显示
          },
          {
            key: 'Content-Security-Policy',
            // 现代安全标准：允许自己嵌入自己
            value: "frame-ancestors 'self';",
          },
        ],
      },
    ]
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  reactStrictMode: true,
  redirects,
  output: process.env.BUILD_OUTPUT || undefined,
}

const withNextIntl = createNextIntlPlugin()

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
