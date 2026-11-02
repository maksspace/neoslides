import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The talk is static: `npm run build` writes plain files to out/, which `npm start` serves
  // and `npm run share` uploads. No server code (route handlers, server actions, cookies()).
  output: "export",
  images: { unoptimized: true },
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
