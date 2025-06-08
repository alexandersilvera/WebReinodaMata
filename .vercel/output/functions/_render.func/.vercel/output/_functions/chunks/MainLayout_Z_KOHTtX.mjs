import { b as createAstro, c as createComponent, d as addAttribute, r as renderTemplate, s as spreadAttributes, u as unescapeHTML, a as renderComponent, j as renderHead, m as maybeRenderHead, f as renderSlot } from './astro/server_DF5lHgFf.mjs';
import 'kleur/colors';
import 'clsx';
/* empty css                         */
import { useEffect } from 'react';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getApps, initializeApp, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const $$Astro$b = createAstro("https://www.centroumbandistareinodamata.org");
const $$ViewTransitions = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$b, $$props, $$slots);
  Astro2.self = $$ViewTransitions;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro/components/ViewTransitions.astro", void 0);

const $$Astro$a = createAstro("https://www.centroumbandistareinodamata.org");
const $$OpenGraphArticleTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$a, $$props, $$slots);
  Astro2.self = $$OpenGraphArticleTags;
  const { publishedTime, modifiedTime, expirationTime, authors, section, tags } = Astro2.props.openGraph.article;
  return renderTemplate`${publishedTime ? renderTemplate`<meta property="article:published_time"${addAttribute(publishedTime, "content")}>` : null}${modifiedTime ? renderTemplate`<meta property="article:modified_time"${addAttribute(modifiedTime, "content")}>` : null}${expirationTime ? renderTemplate`<meta property="article:expiration_time"${addAttribute(expirationTime, "content")}>` : null}${authors ? authors.map((author) => renderTemplate`<meta property="article:author"${addAttribute(author, "content")}>`) : null}${section ? renderTemplate`<meta property="article:section"${addAttribute(section, "content")}>` : null}${tags ? tags.map((tag) => renderTemplate`<meta property="article:tag"${addAttribute(tag, "content")}>`) : null}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/OpenGraphArticleTags.astro", void 0);

const $$Astro$9 = createAstro("https://www.centroumbandistareinodamata.org");
const $$OpenGraphBasicTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$9, $$props, $$slots);
  Astro2.self = $$OpenGraphBasicTags;
  const { openGraph } = Astro2.props;
  return renderTemplate`<meta property="og:title"${addAttribute(openGraph.basic.title, "content")}><meta property="og:type"${addAttribute(openGraph.basic.type, "content")}><meta property="og:image"${addAttribute(openGraph.basic.image, "content")}><meta property="og:url"${addAttribute(openGraph.basic.url || Astro2.url.href, "content")}>`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/OpenGraphBasicTags.astro", void 0);

const $$Astro$8 = createAstro("https://www.centroumbandistareinodamata.org");
const $$OpenGraphImageTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$8, $$props, $$slots);
  Astro2.self = $$OpenGraphImageTags;
  const { image } = Astro2.props.openGraph.basic;
  const { secureUrl, type, width, height, alt } = Astro2.props.openGraph.image;
  return renderTemplate`<meta property="og:image:url"${addAttribute(image, "content")}>${secureUrl ? renderTemplate`<meta property="og:image:secure_url"${addAttribute(secureUrl, "content")}>` : null}${type ? renderTemplate`<meta property="og:image:type"${addAttribute(type, "content")}>` : null}${width ? renderTemplate`<meta property="og:image:width"${addAttribute(width, "content")}>` : null}${height ? renderTemplate`<meta property="og:image:height"${addAttribute(height, "content")}>` : null}${alt ? renderTemplate`<meta property="og:image:alt"${addAttribute(alt, "content")}>` : null}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/OpenGraphImageTags.astro", void 0);

const $$Astro$7 = createAstro("https://www.centroumbandistareinodamata.org");
const $$OpenGraphOptionalTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$7, $$props, $$slots);
  Astro2.self = $$OpenGraphOptionalTags;
  const { optional } = Astro2.props.openGraph;
  return renderTemplate`${optional.audio ? renderTemplate`<meta property="og:audio"${addAttribute(optional.audio, "content")}>` : null}${optional.description ? renderTemplate`<meta property="og:description"${addAttribute(optional.description, "content")}>` : null}${optional.determiner ? renderTemplate`<meta property="og:determiner"${addAttribute(optional.determiner, "content")}>` : null}${optional.locale ? renderTemplate`<meta property="og:locale"${addAttribute(optional.locale, "content")}>` : null}${optional.localeAlternate?.map((locale) => renderTemplate`<meta property="og:locale:alternate"${addAttribute(locale, "content")}>`)}${optional.siteName ? renderTemplate`<meta property="og:site_name"${addAttribute(optional.siteName, "content")}>` : null}${optional.video ? renderTemplate`<meta property="og:video"${addAttribute(optional.video, "content")}>` : null}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/OpenGraphOptionalTags.astro", void 0);

const $$Astro$6 = createAstro("https://www.centroumbandistareinodamata.org");
const $$ExtendedTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$6, $$props, $$slots);
  Astro2.self = $$ExtendedTags;
  const { props } = Astro2;
  return renderTemplate`${props.extend.link?.map((attributes) => renderTemplate`<link${spreadAttributes(attributes)}>`)}${props.extend.meta?.map(({ content, httpEquiv, media, name, property }) => renderTemplate`<meta${addAttribute(name, "name")}${addAttribute(property, "property")}${addAttribute(content, "content")}${addAttribute(httpEquiv, "http-equiv")}${addAttribute(media, "media")}>`)}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/ExtendedTags.astro", void 0);

const $$Astro$5 = createAstro("https://www.centroumbandistareinodamata.org");
const $$TwitterTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$5, $$props, $$slots);
  Astro2.self = $$TwitterTags;
  const { card, site, title, creator, description, image, imageAlt } = Astro2.props.twitter;
  return renderTemplate`${card ? renderTemplate`<meta name="twitter:card"${addAttribute(card, "content")}>` : null}${site ? renderTemplate`<meta name="twitter:site"${addAttribute(site, "content")}>` : null}${title ? renderTemplate`<meta name="twitter:title"${addAttribute(title, "content")}>` : null}${image ? renderTemplate`<meta name="twitter:image"${addAttribute(image, "content")}>` : null}${imageAlt ? renderTemplate`<meta name="twitter:image:alt"${addAttribute(imageAlt, "content")}>` : null}${description ? renderTemplate`<meta name="twitter:description"${addAttribute(description, "content")}>` : null}${creator ? renderTemplate`<meta name="twitter:creator"${addAttribute(creator, "content")}>` : null}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/TwitterTags.astro", void 0);

const $$Astro$4 = createAstro("https://www.centroumbandistareinodamata.org");
const $$LanguageAlternatesTags = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$4, $$props, $$slots);
  Astro2.self = $$LanguageAlternatesTags;
  const { languageAlternates } = Astro2.props;
  return renderTemplate`${languageAlternates.map((alternate) => renderTemplate`<link rel="alternate"${addAttribute(alternate.hrefLang, "hreflang")}${addAttribute(alternate.href, "href")}>`)}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/components/LanguageAlternatesTags.astro", void 0);

const $$Astro$3 = createAstro("https://www.centroumbandistareinodamata.org");
const $$SEO = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$3, $$props, $$slots);
  Astro2.self = $$SEO;
  Astro2.props.surpressWarnings = true;
  function validateProps(props) {
    if (props.openGraph) {
      if (!props.openGraph.basic || (props.openGraph.basic.title ?? void 0) == void 0 || (props.openGraph.basic.type ?? void 0) == void 0 || (props.openGraph.basic.image ?? void 0) == void 0) {
        throw new Error(
          "If you pass the openGraph prop, you have to at least define the title, type, and image basic properties!"
        );
      }
    }
    if (props.title && props.openGraph?.basic.title) {
      if (props.title == props.openGraph.basic.title && !props.surpressWarnings) {
        console.warn(
          "WARNING(astro-seo): You passed the same value to `title` and `openGraph.optional.title`. This is most likely not what you want. See docs for more."
        );
      }
    }
    if (props.openGraph?.basic?.image && !props.openGraph?.image?.alt && !props.surpressWarnings) {
      console.warn(
        "WARNING(astro-seo): You defined `openGraph.basic.image`, but didn't define `openGraph.image.alt`. This is strongly discouraged.'"
      );
    }
  }
  validateProps(Astro2.props);
  let updatedTitle = "";
  if (Astro2.props.title) {
    updatedTitle = Astro2.props.title;
    if (Astro2.props.titleTemplate) {
      updatedTitle = Astro2.props.titleTemplate.replace(/%s/g, updatedTitle);
    }
  } else if (Astro2.props.titleDefault) {
    updatedTitle = Astro2.props.titleDefault;
  }
  const baseUrl = Astro2.site ?? Astro2.url;
  const defaultCanonicalUrl = new URL(Astro2.url.pathname + Astro2.url.search, baseUrl);
  return renderTemplate`${updatedTitle ? renderTemplate`<title>${unescapeHTML(updatedTitle)}</title>` : null}${Astro2.props.charset ? renderTemplate`<meta${addAttribute(Astro2.props.charset, "charset")}>` : null}<link rel="canonical"${addAttribute(Astro2.props.canonical || defaultCanonicalUrl.href, "href")}>${Astro2.props.description ? renderTemplate`<meta name="description"${addAttribute(Astro2.props.description, "content")}>` : null}<meta name="robots"${addAttribute(`${Astro2.props.noindex ? "noindex" : "index"}, ${Astro2.props.nofollow ? "nofollow" : "follow"}`, "content")}>${Astro2.props.openGraph && renderTemplate`${renderComponent($$result, "OpenGraphBasicTags", $$OpenGraphBasicTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.optional && renderTemplate`${renderComponent($$result, "OpenGraphOptionalTags", $$OpenGraphOptionalTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.image && renderTemplate`${renderComponent($$result, "OpenGraphImageTags", $$OpenGraphImageTags, { ...Astro2.props })}`}${Astro2.props.openGraph?.article && renderTemplate`${renderComponent($$result, "OpenGraphArticleTags", $$OpenGraphArticleTags, { ...Astro2.props })}`}${Astro2.props.twitter && renderTemplate`${renderComponent($$result, "TwitterTags", $$TwitterTags, { ...Astro2.props })}`}${Astro2.props.extend && renderTemplate`${renderComponent($$result, "ExtendedTags", $$ExtendedTags, { ...Astro2.props })}`}${Astro2.props.languageAlternates && renderTemplate`${renderComponent($$result, "LanguageAlternatesTags", $$LanguageAlternatesTags, { ...Astro2.props })}`}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/node_modules/astro-seo/src/SEO.astro", void 0);

var __freeze$2 = Object.freeze;
var __defProp$2 = Object.defineProperty;
var __template$2 = (cooked, raw) => __freeze$2(__defProp$2(cooked, "raw", { value: __freeze$2(cooked.slice()) }));
var _a$2;
const $$Astro$2 = createAstro("https://www.centroumbandistareinodamata.org");
const $$BaseHead = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$BaseHead;
  const {
    title,
    description = "Centro Umbandista Reino Da Mata - Centro Umbandista. Estudios, investigaci\xF3n y difusi\xF3n de la cultura y religiosidad Afro-amerindia.",
    image = "/assets/logo.svg"
  } = Astro2.props;
  const siteURL = Astro2.site ? Astro2.site.toString() : Astro2.url.origin;
  const ogImageURL = new URL(image, siteURL).toString();
  const placeOfWorshipSchema = {
    "@context": "https://schema.org",
    "@type": "PlaceOfWorship",
    "name": "Centro Umbandista Reino da Mata",
    "url": Astro2.site ? Astro2.site.toString() : Astro2.url.origin,
    // Usa Astro.site si está definido
    "logo": new URL("/assets/logo.svg", Astro2.site || Astro2.url.origin).toString(),
    // Asume logo en public/assets/logo.svg
    "description": "Centro Umbandista Reino da Mata, estudios investigaci\xF3n y difusi\xF3n de la cultura y la religiosidad afro-umbandista. Nuestra misi\xF3n es la investigaci\xF3n de las distintas escuelas Umbandistas, historia, practica y desarrollo ritualistico. Difundiendo las distintas tradiciones o raices religiosas afro-umbandistas que se desarrollaron y se expandieron en Brasil, su afincamiento en Uruguay atrav\xE9s de los distintos pioneros y pioneras de nuestra Umbanda.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Jos\xE9 Mar\xEDa Delgado 1935",
      "addressLocality": "Montevideo",
      "addressCountry": "UY"
      // Código ISO 3166-1 alpha-2 para Uruguay
    },
    "telephone": "095309322"
  };
  return renderTemplate(_a$2 || (_a$2 = __template$2(['<head><!-- Global Metadata --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><link rel="shortcut icon" href="/assets/logo.svg" type="image/svg+xml"><!-- Font Preloads --><link rel="preload" href="/fonts/ProductSans-Bold.woff" as="font" type="font/woff" crossorigin><link rel="preload" href="/fonts/ProductSans-Light.woff" as="font" type="font/woff" crossorigin><link rel="preload" href="/fonts/ProductSans-Medium.woff" as="font" type="font/woff" crossorigin><link rel="preload" href="/fonts/ProductSans-Regular.woff" as="font" type="font/woff" crossorigin>', '<!-- Schema.org JSON-LD --><script type="application/ld+json">', "<\/script><!-- Transition -->", "", "</head>"])), renderComponent($$result, "SEO", $$SEO, { "title": title, "description": description, "openGraph": {
    basic: {
      title,
      type: "website",
      image: ogImageURL
      // Use the full URL
      // url: Astro.url.toString() // Generally, Astro.site is preferred here if set
    }
    // Puedes añadir más propiedades de OpenGraph aquí si es necesario
    // image: {
    //   alt: 'Texto alternativo para la imagen OG',
    // },
  }, "twitter": {
    // card: "summary_large_image", 
    // title: title, 
    // description: description, 
    // image: image, 
    // imageAlt: 'Texto alternativo para la imagen de Twitter'
  } }), unescapeHTML(JSON.stringify(placeOfWorshipSchema)), renderComponent($$result, "ViewTransitions", $$ViewTransitions, {}), renderHead());
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/BaseHead.astro", void 0);

var __freeze$1 = Object.freeze;
var __defProp$1 = Object.defineProperty;
var __template$1 = (cooked, raw) => __freeze$1(__defProp$1(cooked, "raw", { value: __freeze$1(cooked.slice()) }));
var _a$1;
const $$Astro$1 = createAstro("https://www.centroumbandistareinodamata.org");
const $$NavigationNew = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$NavigationNew;
  return renderTemplate(_a$1 || (_a$1 = __template$1(["", `<nav class="bg-gradient-to-b from-[#19181c] to-[#111] shadow-inner text-white"> <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="flex justify-between h-16"> <!-- Logo y enlaces de navegaci\xF3n para escritorio --> <div class="flex items-center"> <div class="flex-shrink-0"> <a href="/" class="text-2xl font-bold">Reino da Mata</a> </div> <!-- Enlaces de navegaci\xF3n para escritorio --> <div class="hidden md:ml-10 md:flex md:space-x-8"> <a href="/" class="px-3 py-2 hover:bg-[#F08F4A] transition-colors rounded-md">Inicio</a> <a href="/blog" class="px-3 py-2 hover:bg-[#D9734E] transition-colors rounded-md">Blog</a> <a href="/instituto" class="px-3 py-2 hover:bg-[#F05E4A] transition-colors rounded-md">Instituto</a> <a href="/contacto" class="px-3 py-2 hover:bg-[#E64755] transition-colors rounded-md">Contacto</a> <!-- Enlace de administraci\xF3n (oculto por defecto) --> <a href="/admin" id="admin-link-desktop" class="hidden px-3 py-2 bg-purple-700 hover:bg-purple-600 transition-colors rounded-md">Admin</a> </div> </div> <!-- Secci\xF3n de autenticaci\xF3n para escritorio --> <div class="hidden md:flex md:items-center"> <!-- Links de autenticaci\xF3n (mostrados cuando el usuario NO est\xE1 logueado) --> <div id="auth-links-desktop" class="flex items-center space-x-4"> <a href="/login" class="login-link px-3 py-2 text-sm hover:text-gray-300 transition-colors">Iniciar Sesi\xF3n</a> <a href="/register" class="register-link px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 transition-colors rounded-md">Registrarse</a> </div> <!-- Informaci\xF3n del usuario (mostrada cuando el usuario EST\xC1 logueado) --> <div id="user-info-desktop" class="hidden ml-6 flex items-center space-x-3"> <img id="user-avatar-desktop" src="/images/default-avatar.png" alt="Avatar" class="w-8 h-8 rounded-full object-cover bg-gray-600 border border-gray-500"> <a href="/perfil" class="px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors rounded-md">Mi Perfil</a> <button id="logout-button-desktop" class="logout-button px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 transition-colors rounded-md">Cerrar Sesi\xF3n</button> </div> </div> <!-- Bot\xF3n de men\xFA m\xF3vil --> <div class="flex items-center md:hidden"> <button type="button" id="mobile-menu-button" class="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none" aria-controls="mobile-menu" aria-expanded="false"> <span class="sr-only">Abrir men\xFA principal</span> <!-- Icono de men\xFA (hamburguesa) --> <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path> </svg> </button> </div> </div> </div> <!-- Men\xFA m\xF3vil (oculto por defecto) --> <div class="md:hidden hidden bg-[#19181c] w-full border-t border-gray-700" id="mobile-menu"> <div class="px-2 pt-2 pb-3 space-y-1 border-t border-gray-700"> <a href="/" class="block px-3 py-2 hover:bg-[#F08F4A] transition-colors rounded-md text-center">Inicio</a> <a href="/blog" class="block px-3 py-2 hover:bg-[#D9734E] transition-colors rounded-md text-center">Blog</a> <a href="/instituto" class="block px-3 py-2 hover:bg-[#F05E4A] transition-colors rounded-md text-center">Instituto</a> <a href="/contacto" class="block px-3 py-2 hover:bg-[#E64755] transition-colors rounded-md text-center">Contacto</a> <!-- Enlace de administraci\xF3n m\xF3vil (oculto por defecto) --> <a href="/admin" id="admin-link-mobile" class="hidden block px-3 py-2 bg-purple-700 hover:bg-purple-600 transition-colors rounded-md text-center">Administraci\xF3n</a> <!-- Links de autenticaci\xF3n m\xF3vil (mostrados cuando el usuario NO est\xE1 logueado) --> <div id="auth-links-mobile" class="pt-4 space-y-2 border-t border-gray-600 mt-2"> <a href="/login" class="login-link block px-3 py-2 hover:bg-gray-700 transition-colors rounded-md text-center">Iniciar Sesi\xF3n</a> <a href="/register" class="register-link block px-3 py-2 bg-blue-600 hover:bg-blue-700 transition-colors rounded-md text-center">Registrarse</a> </div> <!-- Informaci\xF3n del usuario m\xF3vil (mostrada cuando el usuario EST\xC1 logueado) --> <div id="user-info-mobile" class="hidden pt-4 space-y-3 border-t border-gray-600 mt-2"> <div class="flex justify-center"> <img id="user-avatar-mobile" src="/images/default-avatar.png" alt="Avatar" class="w-10 h-10 rounded-full object-cover bg-gray-600 border border-gray-500"> </div> <a href="/perfil" class="block px-3 py-2 text-gray-300 hover:bg-gray-700 transition-colors rounded-md text-center">Mi Perfil</a> <button id="logout-button-mobile" class="logout-button block w-full px-3 py-2 bg-red-600 hover:bg-red-700 transition-colors rounded-md text-center">Cerrar Sesi\xF3n</button> </div> </div> </div> </nav>  <style>
  /* Estilos espec\xEDficos para el men\xFA m\xF3vil */
  #mobile-menu.menu-visible {
    display: block !important;
  }
</style> <script>
  // Script mejorado para el men\xFA hamburguesa
  document.addEventListener('DOMContentLoaded', setupMobileMenu);
  
  function setupMobileMenu() {
    console.log('Configurando men\xFA m\xF3vil...');
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    
    if (menuButton && mobileMenu) {
      // Eliminar eventos previos para evitar duplicados
      const newButton = menuButton.cloneNode(true);
      menuButton.parentNode.replaceChild(newButton, menuButton);
      
      // Asignar el nuevo evento de clic
      newButton.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Alternar visibilidad con clases espec\xEDficas
        if (mobileMenu.classList.contains('hidden')) {
          mobileMenu.classList.remove('hidden');
          mobileMenu.classList.add('menu-visible');
          console.log('Men\xFA m\xF3vil ABIERTO');
        } else {
          mobileMenu.classList.add('hidden');
          mobileMenu.classList.remove('menu-visible');
          console.log('Men\xFA m\xF3vil CERRADO');
        }
      });
      
      console.log('Men\xFA m\xF3vil configurado correctamente');
    } else {
      console.error('No se encontraron los elementos necesarios para el men\xFA m\xF3vil');
    }
  }
  
  // Tambi\xE9n configurar cuando Astro complete la navegaci\xF3n entre p\xE1ginas
  document.addEventListener('astro:page-load', setupMobileMenu);
  
  // Ejecutar inmediatamente si el documento ya est\xE1 cargado
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    setTimeout(setupMobileMenu, 100);
  }
<\/script>`])), maybeRenderHead());
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/NavigationNew.astro", void 0);

const $$Footer = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${maybeRenderHead()}<footer class="bg-green-900 text-white py-10"> <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"> <div class="grid grid-cols-1 md:grid-cols-3 gap-8"> <!-- Información de contacto --> <div> <h3 class="text-xl font-bold mb-4">Centro Umbandista Reino Da Mata</h3> <p class="mb-2 flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path> </svg>
Montevideo, Uruguay
</p> <p class="mb-2 flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path> </svg>
centroumbandistareinodamata@gmail.com
</p> <p class="mb-2 flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path> </svg>
+598 95309322
</p> </div> <!-- Enlaces rápidos --> <div> <h3 class="text-xl font-bold mb-4">Enlaces Rápidos</h3> <ul class="space-y-2"> <li><a href="/" class="hover:text-green-300 transition-colors">Inicio</a></li> <li><a href="/nosotros" class="hover:text-green-300 transition-colors">Sobre Nosotros</a></li> <li><a href="/blog" class="hover:text-green-300 transition-colors">Blog</a></li> <li><a href="/instituto" class="hover:text-green-300 transition-colors">Instituto</a></li> <li><a href="/contacto" class="hover:text-green-300 transition-colors">Contacto</a></li> </ul> </div> <!-- Redes sociales --> <div> <h3 class="text-xl font-bold mb-4">Síguenos</h3> <div class="flex space-x-4"> <a href="https://www.facebook.com/reinodamata" class="text-white hover:text-green-300 transition-colors"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fill-rule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clip-rule="evenodd"></path> </svg> </a> <a href="#" class="text-white hover:text-green-300 transition-colors"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path fill-rule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clip-rule="evenodd"></path> </svg> </a> <a href="#" class="text-white hover:text-green-300 transition-colors"> <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"> <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path> </svg> </a> </div> </div> </div> <div class="mt-8 pt-8 border-t border-green-700 text-center"> <p>&copy; ${(/* @__PURE__ */ new Date()).getFullYear()} Centro Umbandista Reino Da Mata. Todos los derechos reservados.</p> </div> </div> </footer>`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/Footer.astro", void 0);

const __vite_import_meta_env__ = {"ASSETS_PREFIX": undefined, "BASE_URL": "/", "DEV": false, "MODE": "production", "PROD": true, "PUBLIC_FIREBASE_API_KEY": "AIzaSyAUlu4PUxWVZMUr4LcptsRIKUXqTqyM1jE", "PUBLIC_FIREBASE_APP_ID": "1:557584892196:web:e7207c259f360b751ab3b1", "PUBLIC_FIREBASE_AUTH_DOMAIN": "reino-da-mata-2fea3.firebaseapp.com", "PUBLIC_FIREBASE_MEASUREMENT_ID": "G-MLSCKQFTCY", "PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "557584892196", "PUBLIC_FIREBASE_PROJECT_ID": "reino-da-mata-2fea3", "PUBLIC_FIREBASE_STORAGE_BUCKET": "reino-da-mata-2fea3.firebasestorage.app", "SITE": "https://www.centroumbandistareinodamata.org", "SSR": true};
function requireEnvVar(name, value) {
  if (!value || value.trim() === "") {
    throw new Error(`Variable de entorno requerida faltante: ${name}`);
  }
  return value.trim();
}
function getEnvVar(name, defaultValue = "") {
  const value = Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV })[name];
  return value?.trim() || defaultValue;
}
function parseUrlList(urlString) {
  return urlString.split(",").map((url) => url.trim()).filter((url) => url.length > 0);
}
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};
const config = {
  firebase: {
    apiKey: requireEnvVar("PUBLIC_FIREBASE_API_KEY", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_API_KEY),
    authDomain: requireEnvVar("PUBLIC_FIREBASE_AUTH_DOMAIN", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_AUTH_DOMAIN),
    projectId: requireEnvVar("PUBLIC_FIREBASE_PROJECT_ID", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_PROJECT_ID),
    storageBucket: requireEnvVar("PUBLIC_FIREBASE_STORAGE_BUCKET", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_STORAGE_BUCKET),
    messagingSenderId: requireEnvVar("PUBLIC_FIREBASE_MESSAGING_SENDER_ID", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
    appId: requireEnvVar("PUBLIC_FIREBASE_APP_ID", Object.assign(__vite_import_meta_env__, { _: process.env._, NODE: process.env.NODE, NODE_ENV: process.env.NODE_ENV }).PUBLIC_FIREBASE_APP_ID),
    measurementId: getEnvVar("PUBLIC_FIREBASE_MEASUREMENT_ID")
  },
  admin: {
    // Por ahora mantenemos el email hardcodeado pero lo movemos aquí para centralizar
    emails: ["alexandersilvera@hotmail.com"]
  },
  app: {
    siteUrl: getEnvVar("PUBLIC_SITE_URL", "http://localhost:4321"),
    environment: getEnvVar("NODE_ENV", "development")
  },
  cors: {
    allowedOrigins: parseUrlList(getEnvVar("ALLOWED_ORIGINS", "http://localhost:4321,https://centroumbandistareinodamata.org"))
  }
};
function validateConfig() {
  config.admin.emails.forEach((email) => {
    if (!isValidEmail(email)) {
      throw new Error(`Email de administrador inválido: ${email}`);
    }
  });
  if (!config.firebase.projectId || !config.firebase.apiKey) {
    throw new Error("Configuración de Firebase incompleta");
  }
  if (config.app.siteUrl && !config.app.siteUrl.startsWith("http")) {
    throw new Error("PUBLIC_SITE_URL debe comenzar con http:// o https://");
  }
}
try {
  validateConfig();
  console.log(`[Config] Configuración cargada exitosamente para entorno: ${config.app.environment}`);
} catch (error) {
  console.error("[Config] Error en la configuración:", error);
  throw error;
}
const configUtils = {
  /**
   * Verifica si un email es administrador
   */
  isAdminEmail: (email) => {
    return config.admin.emails.includes(email.toLowerCase().trim());
  },
  /**
   * Verifica si estamos en desarrollo
   */
  isDevelopment: () => {
    return config.app.environment === "development";
  },
  /**
   * Verifica si estamos en producción
   */
  isProduction: () => {
    return config.app.environment === "production";
  },
  /**
   * Obtiene la URL base del sitio
   */
  getSiteUrl: () => {
    return config.app.siteUrl;
  },
  /**
   * Verifica si un origen está permitido para CORS
   */
  isOriginAllowed: (origin) => {
    return config.cors.allowedOrigins.includes(origin);
  }
};

const firebaseConfig = {
  apiKey: config.firebase.apiKey,
  authDomain: config.firebase.authDomain,
  projectId: config.firebase.projectId,
  storageBucket: config.firebase.storageBucket,
  messagingSenderId: config.firebase.messagingSenderId,
  appId: config.firebase.appId,
  measurementId: config.firebase.measurementId
};
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
getStorage(app);
const functions = getFunctions(app);
if (configUtils.isDevelopment() && typeof window !== "undefined") {
  console.log("[Firebase] Modo desarrollo detectado");
}
if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).then(() => {
    console.log("[Firebase] Persistencia local establecida correctamente");
  }).catch((error) => {
    console.error("[Firebase] Error al establecer persistencia:", error);
  });
}

function PageViewTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const recordPageView = async () => {
      try {
        const path = window.location.pathname;
        const referrer = document.referrer;
        const userAgent = navigator.userAgent;
        const recordPageViewFn = httpsCallable(functions, "recordPageView");
        await recordPageViewFn({
          path,
          referrer,
          userAgent
        });
      } catch (error) {
        console.error("Error al registrar vista de página:", error);
      }
    };
    recordPageView();
    const handleRouteChange = () => {
      recordPageView();
    };
    window.addEventListener("popstate", handleRouteChange);
    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);
  return null;
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro("https://www.centroumbandistareinodamata.org");
const $$MainLayout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$MainLayout;
  const { title, description } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head>', "<!-- <ViewTransitions /> --><!-- <-- Comentado para prueba -->", '</head> <body class="bg-dark-blue py-6 flex flex-col min-h-screen"> <!-- Auth Recovery Script --> <script src="/auth-recovery.js"><\/script> <!-- Rastreador de vistas de p\xE1gina --> ', " ", ' <main class="flex-grow"> ', " </main> ", " </body></html>"])), renderComponent($$result, "BaseHead", $$BaseHead, { "title": title, "description": description }), renderHead(), renderComponent($$result, "PageViewTracker", PageViewTracker, { "client:load": true, "client:component-hydration": "load", "client:component-path": "@/components/PageViewTracker", "client:component-export": "default" }), renderComponent($$result, "NavigationNew", $$NavigationNew, {}), renderSlot($$result, $$slots["default"]), renderComponent($$result, "Footer", $$Footer, {}));
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/layouts/MainLayout.astro", void 0);

export { $$MainLayout as $, auth as a, configUtils as c, db as d, functions as f };
