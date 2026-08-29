import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

// CondoMate — Phase 1
// Responsive web app, installable as a PWA (Add to Home Screen).
// No native app shell in Phase 1, per the product decision to ship
// web-first and defer native iOS/Android builds.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icons/icon.svg"],
      manifest: {
        name: "CondoMate",
        short_name: "CondoMate",
        description: "ระบบจัดการคอนโด สำหรับลูกบ้านและนิติบุคคล",
        start_url: "/",
        display: "standalone",
        background_color: "#EDEBE6",
        theme_color: "#1E2A38",
        icons: [
          { src: "icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "icons/icon-512.png", sizes: "512x512", type: "image/png" },
          { src: "icons/icon-512-maskable.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      },
      workbox: {
        // Cache the app shell; data itself is fetched fresh (see src/data/api.js)
        globPatterns: ["**/*.{js,css,html,svg}"]
      }
    })
  ],
  // Allow a phone on the same local network to open the responsive web app.
  server: { host: "0.0.0.0", port: 5173, strictPort: true }
});
