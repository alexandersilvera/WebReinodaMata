import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import icon from "astro-icon";
import sitemap from "@astrojs/sitemap";
import react from "@astrojs/react";
import { fileURLToPath, URL } from "node:url";

import vercel from "@astrojs/vercel";

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
	// Image configuration
	image: {
		domains: ["firebasestorage.googleapis.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "firebasestorage.googleapis.com",
			},
		],
	},
	output: "server",
	adapter: vercel({
		imageService: false, // Disable Vercel image service for external images
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
				external: ["firebase-admin"],
				output: {
					manualChunks: {
						'firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/storage'],
						'framer-motion': ['framer-motion'],
						'react-vendor': ['react', 'react-dom']
					}
				}
			},
			minify: 'terser',
			terserOptions: {
				compress: {
					drop_console: true,
					drop_debugger: true
				}
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
