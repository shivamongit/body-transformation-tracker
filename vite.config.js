import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// On GitHub Pages the site is served from /body-transformation-tracker/.
// Render and local dev serve from the root, so only set base when GITHUB_PAGES=true.
const base = process.env.GITHUB_PAGES === "true" ? "/body-transformation-tracker/" : "/";

export default defineConfig({
  base,
  plugins: [react()],
  assetsInclude: ["**/*.PNG"],
});
