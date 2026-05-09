import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const cspDirectives = [
  "default-src 'self'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // Yandex.Metrika + Yandex.Maps + SmartCaptcha
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://mc.yandex.ru https://api-maps.yandex.ru https://*.maps.yandex.net https://yastatic.net https://smartcaptcha.yandexcloud.net",
  "connect-src 'self' https://mc.yandex.ru https://api-maps.yandex.ru https://*.maps.yandex.net https://*.maps.yandex.ru https://*.api-maps.yandex.ru https://smartcaptcha.yandexcloud.net",
  "frame-src 'self' https://yandex.ru https://*.yandex.ru https://smartcaptcha.yandexcloud.net",
  "worker-src 'self' blob:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "Content-Security-Policy", value: cspDirectives },
  // HSTS только в production — иначе мешает локальной разработке.
  ...(isProd
    ? [
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains; preload",
        },
      ]
    : []),
];

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
