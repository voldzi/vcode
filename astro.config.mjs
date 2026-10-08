import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://vcode.zeleznalady.cz",
  output: "static",
  integrations: [sitemap({ filter: page => !new URL(page).pathname.startsWith("/preview-local/") })],
  build: { format: "directory" },
  vite: { build: { cssMinify: "lightningcss" } }
});
