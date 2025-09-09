import { getCollection } from "astro:content";

export async function getAllTags(): Promise<string[]> {
	const posts = await getCollection("blog");
	return Array.from(
		new Set(
			posts
				.map((post: any) => post.data.tags)
				.flat()
				.filter((tag: any): tag is string => typeof tag === 'string')
				.sort()
		)
	);
}
