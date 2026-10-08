import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // Rotas antigas → novas (a query string, ex. ?id=, é repassada automaticamente).
  // Mantém funcionando QR Codes já emitidos com /validar/<uid>.
  async redirects() {
    return [
      { source: "/test-supabase", destination: "/validar-certificado", permanent: true },
      { source: "/validar/:id", destination: "/validar-certificado/:id", permanent: true },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
