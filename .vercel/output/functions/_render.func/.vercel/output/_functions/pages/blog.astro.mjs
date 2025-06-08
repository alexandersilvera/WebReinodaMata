/* empty css                                    */
import { c as createComponent, a as renderComponent, r as renderTemplate } from '../chunks/astro/server_DF5lHgFf.mjs';
import 'kleur/colors';
import { a as getPublishedArticles, $ as $$Article } from '../chunks/articles_BKDqJHV1.mjs';
import { $ as $$ArticleList } from '../chunks/ArticleList_DkLMj8If.mjs';
export { renderers } from '../renderers.mjs';

const prerender = false;
const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const firestoreArticles = await getPublishedArticles();
  const posts = firestoreArticles.map((article) => ({
    data: {
      title: article.title,
      description: article.description,
      pubDate: article.publishDate.toDate(),
      // Convertir Timestamp a Date
      heroImage: article.image,
      tags: article.tags,
      author: article.author
    },
    slug: article.slug
  }));
  return renderTemplate`${renderComponent($$result, "ArticleList", $$ArticleList, { "title": "Blog | Ile Axe Reino Da Mata", "description": "Art\xEDculos y publicaciones sobre Umbanda, estudios Afro-amerindios, historia y pr\xE1cticas ritual\xEDsticas del Ile Axe Reino Da Mata." }, { "default": async ($$result2) => renderTemplate`${posts.map((post) => renderTemplate`${renderComponent($$result2, "Article", $$Article, { ...post.data, "slug": post.slug })}`)}` })}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/index.astro", void 0);

const $$file = "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/index.astro";
const $$url = "/blog";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
