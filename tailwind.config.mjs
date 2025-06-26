/** @type {import('tailwindcss').Config} */
import typography from '@tailwindcss/typography';

export default {
	content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
	safelist: [
		'hidden',
		'flex',
		'flex-col',
		'line-clamp-2',
		'line-clamp-3',
		// Puedes agregar más clases si alternas otras dinámicamente
	],
	theme: {
		extend: {
			colors: {
				"dark-blue": "#10151D",
				"soft-white": "rgb(191 199 210/1)",
				"extra-soft-white": "rgb(46 60 81 / 1)",
				"soft-light": "rgb(22 30 41 / 1)",
			},
			fontFamily: {
				sans: ["ProductSans", "ui-sans-serif", "system-ui"],
				// Optionally, add other font families here
			},
		},
		maxWidth: {
			"content-size": "729.44px",
			"article-size": "1028px",
		},
	},
	plugins: [typography],
};
