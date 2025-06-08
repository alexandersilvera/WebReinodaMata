/* empty css                                          */
import { b as createAstro, c as createComponent, a as renderComponent, r as renderTemplate } from '../../../chunks/astro/server_DF5lHgFf.mjs';
import 'kleur/colors';
import { $ as $$ArticleList } from '../../../chunks/ArticleList_DkLMj8If.mjs';
import { g as getArticlesByTag, $ as $$Article } from '../../../chunks/articles_BKDqJHV1.mjs';
export { renderers } from '../../../renderers.mjs';

const $$Astro = createAstro("https://www.centroumbandistareinodamata.org");
const prerender = false;
const $$tag = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$tag;
  const { tag } = Astro2.params;
  if (!tag) {
    return Astro2.redirect("/blog");
  }
  const firestoreArticles = await getArticlesByTag(tag);
  const posts = firestoreArticles.map((article) => ({
    data: {
      title: article.title,
      description: article.description,
      pubDate: article.publishDate.toDate(),
      heroImage: article.image,
      tags: article.tags,
      author: article.author
    },
    slug: article.slug
  }));
  const formattedTag = tag.charAt(0).toUpperCase() + tag.slice(1);
  const title = `Art\xEDculos sobre ${formattedTag} | Reino da Mata`;
  const description = `Colecci\xF3n de art\xEDculos y publicaciones relacionadas con ${formattedTag} del Centro Umbandista Reino Da Mata.`;
  return renderTemplate`${renderComponent($$result, "ArticleList", $$ArticleList, { "title": title, "description": description }, { "default": async ($$result2) => renderTemplate`${posts.map((post) => renderTemplate`${renderComponent($$result2, "Article", $$Article, { ...post.data, "slug": post.slug })}`)}` })}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/tag/[tag].astro", void 0);

const $$file = "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/tag/[tag].astro";
const $$url = "/blog/tag/[tag]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$tag,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
