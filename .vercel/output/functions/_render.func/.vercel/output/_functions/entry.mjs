import { renderers } from './renderers.mjs';
import { c as createExports } from './chunks/entrypoint_DLg0gvv4.mjs';
import { manifest } from './manifest_QWsYXKV9.mjs';

const _page0 = () => import('./pages/_image.astro.mjs');
const _page1 = () => import('./pages/admin/articles/create.astro.mjs');
const _page2 = () => import('./pages/admin/articles/edit/_id_.astro.mjs');
const _page3 = () => import('./pages/admin/articles/new.astro.mjs');
const _page4 = () => import('./pages/admin/articles.astro.mjs');
const _page5 = () => import('./pages/admin/articles.astro2.mjs');
const _page6 = () => import('./pages/admin/metrics.astro.mjs');
const _page7 = () => import('./pages/admin/newsletter.astro.mjs');
const _page8 = () => import('./pages/admin/newsletter-test.astro.mjs');
const _page9 = () => import('./pages/admin/settings.astro.mjs');
const _page10 = () => import('./pages/admin/subscribers.astro.mjs');
const _page11 = () => import('./pages/admin/sync.astro.mjs');
const _page12 = () => import('./pages/admin.astro.mjs');
const _page13 = () => import('./pages/blog/tag/_tag_.astro.mjs');
const _page14 = () => import('./pages/blog.astro.mjs');
const _page15 = () => import('./pages/blog/_---slug_.astro.mjs');
const _page16 = () => import('./pages/contacto.astro.mjs');
const _page17 = () => import('./pages/instituto.astro.mjs');
const _page18 = () => import('./pages/login.astro.mjs');
const _page19 = () => import('./pages/nosotros.astro.mjs');
const _page20 = () => import('./pages/perfil.astro.mjs');
const _page21 = () => import('./pages/register.astro.mjs');
const _page22 = () => import('./pages/rss.xml.astro.mjs');
const _page23 = () => import('./pages/unsubscribe.astro.mjs');
const _page24 = () => import('./pages/index.astro.mjs');

const pageMap = new Map([
    ["node_modules/astro/dist/assets/endpoint/generic.js", _page0],
    ["src/pages/admin/articles/create.astro", _page1],
    ["src/pages/admin/articles/edit/[id].astro", _page2],
    ["src/pages/admin/articles/new.astro", _page3],
    ["src/pages/admin/articles/index.astro", _page4],
    ["src/pages/admin/articles.astro", _page5],
    ["src/pages/admin/metrics.astro", _page6],
    ["src/pages/admin/newsletter.astro", _page7],
    ["src/pages/admin/newsletter-test.astro", _page8],
    ["src/pages/admin/settings.astro", _page9],
    ["src/pages/admin/subscribers.astro", _page10],
    ["src/pages/admin/sync.astro", _page11],
    ["src/pages/admin/index.astro", _page12],
    ["src/pages/blog/tag/[tag].astro", _page13],
    ["src/pages/blog/index.astro", _page14],
    ["src/pages/blog/[...slug].astro", _page15],
    ["src/pages/contacto/index.astro", _page16],
    ["src/pages/instituto/index.astro", _page17],
    ["src/pages/login.astro", _page18],
    ["src/pages/nosotros/index.astro", _page19],
    ["src/pages/perfil.astro", _page20],
    ["src/pages/register.astro", _page21],
    ["src/pages/rss.xml.js", _page22],
    ["src/pages/unsubscribe.astro", _page23],
    ["src/pages/index.astro", _page24]
]);
const serverIslandMap = new Map();
const _manifest = Object.assign(manifest, {
    pageMap,
    serverIslandMap,
    renderers,
    middleware: () => import('./_noop-middleware.mjs')
});
const _args = {
    "middlewareSecret": "8b5835b3-90d8-4c6b-8ea9-64daa7b317cf",
    "skewProtection": false
};
const _exports = createExports(_manifest, _args);
const __astrojsSsrVirtualEntry = _exports.default;

export { __astrojsSsrVirtualEntry as default, pageMap };
