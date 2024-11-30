import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_KRJD9zb3.mjs';
import 'es-module-lexer';
import { h as decodeKey } from './chunks/astro/server_BzQ5SUWq.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/","adapterName":"@astrojs/vercel/serverless","routes":[{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"contacto/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contacto","isIndex":true,"type":"page","pattern":"^\\/contacto\\/?$","segments":[[{"content":"contacto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contacto/index.astro","pathname":"/contacto","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"instituto/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/instituto","isIndex":true,"type":"page","pattern":"^\\/instituto\\/?$","segments":[[{"content":"instituto","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/instituto/index.astro","pathname":"/instituto","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"nosotros/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/nosotros","isIndex":true,"type":"page","pattern":"^\\/nosotros\\/?$","segments":[[{"content":"nosotros","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/nosotros/index.astro","pathname":"/nosotros","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"rss.xml","links":[],"scripts":[],"styles":[],"routeData":{"route":"/rss.xml","isIndex":false,"type":"endpoint","pattern":"^\\/rss\\.xml\\/?$","segments":[[{"content":"rss.xml","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/rss.xml.js","pathname":"/rss.xml","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"http://localhost:4321","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/layouts/BlogPost.astro",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/blog/[...slug].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/[...slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/components/Article.astro",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/blog/tag/[tag].astro",{"propagation":"in-tree","containsHead":true}],["\u0000@astro-page:src/pages/blog/tag/[tag]@_@astro",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/contacto/index.astro",{"propagation":"none","containsHead":true}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/index.astro",{"propagation":"none","containsHead":true}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/instituto/index.astro",{"propagation":"in-tree","containsHead":true}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/nosotros/index.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/pages/rss.xml.js",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/rss.xml@_@js",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/utils/getAllTags.ts",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/components/TagSelector.astro",{"propagation":"in-tree","containsHead":false}],["/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/layouts/ArticleList.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/instituto/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:src/pages/blog/tag/[tag]@_@astro":"pages/blog/tag/_tag_.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/contacto/index@_@astro":"pages/contacto.astro.mjs","\u0000@astro-page:src/pages/instituto/index@_@astro":"pages/instituto.astro.mjs","\u0000@astro-page:src/pages/nosotros/index@_@astro":"pages/nosotros.astro.mjs","\u0000@astro-page:src/pages/rss.xml@_@js":"pages/rss.xml.astro.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/blog/[...slug]@_@astro":"pages/blog/_---slug_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/node_modules/astro/dist/env/setup.js":"chunks/astro/env-setup_Cr6XTFvb.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/Umbanda-Kimbanda-su-historia-su-Desarrollo.md?astroContentCollectionEntry=true":"chunks/Umbanda-Kimbanda-su-historia-su-Desarrollo_CAJGOmiw.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/first-post.md?astroContentCollectionEntry=true":"chunks/first-post_BubxkV7_.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/second-post.md?astroContentCollectionEntry=true":"chunks/second-post_D3XsX-qX.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/third-post.md?astroContentCollectionEntry=true":"chunks/third-post_BMQvggg9.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/Umbanda-Kimbanda-su-historia-su-Desarrollo.md?astroPropagatedAssets":"chunks/Umbanda-Kimbanda-su-historia-su-Desarrollo_D8Wnkafd.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/first-post.md?astroPropagatedAssets":"chunks/first-post_DrbAPRKb.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/second-post.md?astroPropagatedAssets":"chunks/second-post_BIeTnpGl.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/third-post.md?astroPropagatedAssets":"chunks/third-post_x7Z8dBsq.mjs","\u0000astro:asset-imports":"chunks/_astro_asset-imports_D9aVaOQr.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BcEe_9wP.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/Umbanda-Kimbanda-su-historia-su-Desarrollo.md":"chunks/Umbanda-Kimbanda-su-historia-su-Desarrollo_D44vz4QH.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/first-post.md":"chunks/first-post_B9v2OVkl.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/second-post.md":"chunks/second-post_clojry_T.mjs","/home/alexander/Desktop/ProyectosWeb/Astro_Web/blog-web/src/content/blog/third-post.md":"chunks/third-post_u8bsQQT6.mjs","\u0000@astrojs-manifest":"manifest_-3zuvjIW.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.Cli061K4.js","/astro/hoisted.js?q=1":"_astro/hoisted.DDNNQRif.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/_slug_.DvXZ_lgI.css","/favicon.svg","/_astro/hoisted.Cli061K4.js","/_astro/hoisted.DDNNQRif.js","/assets/biblioteca.jpg","/assets/logo.svg","/fonts/ProductSans-Bold.woff","/fonts/ProductSans-Light.woff","/fonts/ProductSans-Medium.woff","/fonts/ProductSans-Regular.woff","/blog/index.html","/contacto/index.html","/instituto/index.html","/nosotros/index.html","/rss.xml","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"KNHAVjFvvxtF60siWgv8Vhs1P5N2D1IGHGrQXnh6YMg=","experimentalEnvGetSecretEnabled":false});

export { manifest };
