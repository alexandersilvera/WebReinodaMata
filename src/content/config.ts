import { defineCollection, z } from "astro:content";

const blog = defineCollection({
	type: "content",
	schema: z.object({
		heroImage: z.string(),
		title: z.string(),
		description: z.string().optional(),
		pubDate: z.coerce.date(),
		tags: z.string().array(),
	}),
});

export const collections = { blog };
