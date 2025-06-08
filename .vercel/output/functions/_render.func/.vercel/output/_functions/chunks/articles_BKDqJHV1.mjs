import { b as createAstro, c as createComponent, m as maybeRenderHead, d as addAttribute, r as renderTemplate, a as renderComponent } from './astro/server_DF5lHgFf.mjs';
import 'kleur/colors';
import { $ as $$Image } from './_astro_assets_C-PXBJlC.mjs';
import 'clsx';
import { d as db } from './MainLayout_Z_KOHTtX.mjs';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

const $$Astro$1 = createAstro("https://www.centroumbandistareinodamata.org");
const $$FormattedDate = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$FormattedDate;
  const { date } = Astro2.props;
  return renderTemplate`${maybeRenderHead()}<time${addAttribute(date.toISOString(), "datetime")} class="mt-6 text-sm text-zinc-400"> ${date.toLocaleDateString("es-uy", {
    year: "numeric",
    month: "short",
    day: "numeric"
  })} </time>`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/FormattedDate.astro", void 0);

const $$Astro = createAstro("https://www.centroumbandistareinodamata.org");
const $$Article = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Article;
  const { heroImage, title, tags, pubDate, slug } = Astro2.props;
  const hasDescription = "description" in Astro2.props;
  const postDescription = hasDescription ? Astro2.props.description : null;
  return renderTemplate`${maybeRenderHead()}<li class="group overflow-hidden rounded-xl border border-green-900/30 bg-green-900/10 hover:bg-green-900/20 transition-all duration-300 hover:shadow-lg hover:shadow-green-900/20 transform hover:-translate-y-1"> <article> <a${addAttribute(`/blog/${slug}`, "href")} class="block h-full"> <div class="relative overflow-hidden"> ${renderComponent($$result, "Image", $$Image, { "src": heroImage, "alt": title, "width": 1020, "height": 520, "class": "aspect-[16/9] w-full object-cover transition-transform duration-700 group-hover:scale-105" })} <div class="absolute inset-0 bg-gradient-to-b from-transparent to-green-900/80"></div> <!-- Tags sobre la imagen --> <div class="absolute top-4 right-4 flex flex-wrap gap-2 justify-end"> ${tags.map((tag) => renderTemplate`<span class="bg-green-800/80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full"> ${tag} </span>`)} </div> </div> <div class="p-6"> <h2 class="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors"> ${title} </h2> ${hasDescription && postDescription && renderTemplate`<p class="text-gray-300 mb-4 line-clamp-2">${postDescription}</p>`} <div class="flex items-center justify-between mt-4"> ${renderComponent($$result, "FormattedDate", $$FormattedDate, { "date": pubDate })} <span class="text-green-400 group-hover:translate-x-1 transition-transform duration-300 inline-flex items-center">
Leer más
<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor"> <path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd"></path> </svg> </span> </div> </div> </a> </article> </li>`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/Article.astro", void 0);

const ARTICLES_COLLECTION = "articles";
const getArticleBySlug = async (slug) => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(articlesRef, where("slug", "==", slug), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc2 = querySnapshot.docs[0];
      return {
        id: doc2.id,
        ...doc2.data()
      };
    }
    return null;
  } catch (error) {
    console.error("Error al obtener artículo por slug:", error);
    throw error;
  }
};
const getPublishedArticles = async (limitCount) => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(
      articlesRef,
      where("draft", "==", false)
    );
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map((doc2) => ({
      id: doc2.id,
      ...doc2.data()
    }));
    articles = articles.sort((a, b) => b.publishDate.toMillis() - a.publishDate.toMillis());
    if (limitCount) ;
    return articles;
  } catch (error) {
    console.error("Error al obtener artículos publicados:", error);
    throw error;
  }
};
const getArticlesByTag = async (tag) => {
  try {
    const articlesRef = collection(db, ARTICLES_COLLECTION);
    const q = query(
      articlesRef,
      where("draft", "==", false),
      where("tags", "array-contains", tag)
    );
    const querySnapshot = await getDocs(q);
    let articles = querySnapshot.docs.map((doc2) => ({
      id: doc2.id,
      ...doc2.data()
    }));
    articles = articles.sort((a, b) => b.publishDate.toMillis() - a.publishDate.toMillis());
    return articles;
  } catch (error) {
    console.error("Error al buscar artículos por etiqueta:", error);
    throw error;
  }
};

export { $$Article as $, getPublishedArticles as a, $$FormattedDate as b, getArticleBySlug as c, getArticlesByTag as g };
