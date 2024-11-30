import { defineConfig } from 'astro/config';
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
  site: "http://localhost:4321",
  integrations: [tailwind(), icon({
    include: {
      lucide: ["*"]
    }
  }), sitemap()],
  output: "hybrid",
  adapter: vercel({
    webAnalytics: { enabled: true }
  }),
});