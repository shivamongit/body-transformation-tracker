import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the site is served from /body-transformation-tracker/.
// Render and local dev serve from the root, so only set base when GITHUB_PAGES=true.
const base = process.env.GITHUB_PAGES === "true" ? "/body-transformation-tracker/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ["**/*.PNG"],
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
          charts: ["recharts"],
          supabase: ["@supabase/supabase-js"],
          icons: ["lucide-react"],
        },
      },
    },
  },
});
