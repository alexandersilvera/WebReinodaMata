import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { fileURLToPath, URL } from "node:url";

import vercel from "@astrojs/vercel/serverless";

// https://astro.build/config
export default defineConfig({
	site: "https://www.centroumbandistareinodamata.org",
	integrations: [
		tailwind(),
		icon({
			include: {
				lucide: ["*"],
			},
		}),
		sitemap(),
		react(),
	],
	output: "server",
	adapter: vercel({
		webAnalytics: { enabled: true },
		runtime: "nodejs20.x" // ¡AÑADE ESTA LÍNEA!
	}),
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	},
	outDir: "./dist",
});
