const withPWA = require("next-pwa")({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Sem remotePatterns desnecessários: as fotos agora são locais
    // (public/images/products) e nunca dependem de link externo.
  },
};

module.exports = withPWA(nextConfig);
