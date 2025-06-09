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
		imageService: true,
		webAnalytics: { enabled: true },
		speedInsights: { enabled: true },
	}),
	vite: {
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
		build: {
			rollupOptions: {
				external: ["firebase-admin"]
			}
		},
		ssr: {
			noExternal: ["firebase", "@firebase/auth", "@firebase/firestore"]
		}
	},
	server: {
		port: 4321,
		host: true
	}
});
