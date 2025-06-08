/* empty css                                       */
import { b as createAstro, c as createComponent, a as renderComponent, r as renderTemplate, m as maybeRenderHead, f as renderSlot, d as addAttribute, u as unescapeHTML } from '../../chunks/astro/server_DF5lHgFf.mjs';
import 'kleur/colors';
import { $ as $$Image } from '../../chunks/_astro_assets_C-PXBJlC.mjs';
import { $ as $$MainLayout, a as auth, d as db } from '../../chunks/MainLayout_Z_KOHTtX.mjs';
import { b as $$FormattedDate, c as getArticleBySlug, a as getPublishedArticles, $ as $$Article } from '../../chunks/articles_BKDqJHV1.mjs';
import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { doc, getDoc, query, collection, where, orderBy, onSnapshot, addDoc, serverTimestamp, updateDoc, deleteDoc } from 'firebase/firestore';
import { marked } from 'marked';
export { renderers } from '../../renderers.mjs';

const $$Astro$2 = createAstro("https://www.centroumbandistareinodamata.org");
const $$BlogPost = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$2, $$props, $$slots);
  Astro2.self = $$BlogPost;
  const { title, description, heroImage, pubDate, tags } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": title, "description": description }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<article class="max-w-4xl mx-auto w-full py-10 px-4"> <!-- Navegación de regreso --> <div class="mb-8"> <a class="inline-flex items-center gap-2 bg-green-900/30 hover:bg-green-800/50 transition-colors duration-200 text-white px-4 py-2 rounded-full border border-green-700/20" href="/blog"> <svg viewBox="0 -960 960 960" xmlns="http://www.w3.org/2000/svg" height="20" width="20"> <path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" fill="currentColor"></path> </svg>
Volver al blog
</a> </div> <!-- Encabezado del artículo --> <header class="mb-10"> <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">${title}</h1> <div class="flex flex-wrap items-center gap-4 text-gray-300 mb-6"> <div class="flex items-center"> <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path> </svg> ${renderComponent($$result2, "FormattedDate", $$FormattedDate, { "date": pubDate })} </div> ${tags && renderTemplate`<div class="flex flex-wrap gap-2"> ${tags.map((tag) => renderTemplate`<a${addAttribute(`/blog/tag/${tag.toLowerCase()}`, "href")} class="bg-green-900/40 hover:bg-green-800/60 text-white text-sm px-3 py-1 rounded-full transition-colors">
#${tag} </a>`)} </div>`} </div> ${description && renderTemplate`<p class="text-xl text-gray-300 italic border-l-4 border-green-600 pl-4 py-2 bg-green-900/20 rounded-r-md"> ${description} </p>`} </header> <!-- Imagen principal --> <div class="relative w-full h-[400px] md:h-[500px] mb-10 rounded-xl overflow-hidden shadow-2xl"> ${renderComponent($$result2, "Image", $$Image, { "class": "w-full h-full object-cover", "width": 1200, "height": 600, "src": heroImage, "alt": title })} <div class="absolute inset-0 bg-gradient-to-t from-green-900/70 to-transparent"></div> </div> <!-- Contenido del artículo --> <div class="prose prose-lg prose-invert max-w-none mx-auto
			prose-headings:text-green-400 prose-headings:font-bold
			prose-p:text-gray-300 prose-p:leading-relaxed
			prose-a:text-green-400 prose-a:no-underline hover:prose-a:underline
			prose-strong:text-white
			prose-blockquote:border-green-500 prose-blockquote:bg-green-900/20 
			prose-li:text-gray-300"> ${renderSlot($$result2, $$slots["default"])} </div> </article> ` })}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/layouts/BlogPost.astro", void 0);

function CommentSection({ postId, postTitle }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedText, setEditedText] = useState("");
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const profileRef = doc(db, "userProfiles", currentUser.uid);
          const profileSnap = await getDoc(profileRef);
          if (profileSnap.exists()) {
            setUserProfile(profileSnap.data());
          } else {
            console.log("No existe perfil del usuario, usando datos de auth");
            setUserProfile({
              displayName: currentUser.displayName || "Usuario",
              photoURL: currentUser.photoURL || "/images/default-avatar.png"
            });
          }
        } catch (error) {
          console.error("Error al cargar perfil de usuario:", error);
          setUserProfile({
            displayName: currentUser.displayName || "Usuario",
            photoURL: currentUser.photoURL || "/images/default-avatar.png"
          });
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);
  useEffect(() => {
    const commentsQuery = query(
      collection(db, "comments"),
      where("postId", "==", postId),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(commentsQuery, (snapshot) => {
      const commentsData = snapshot.docs.map((doc2) => ({
        id: doc2.id,
        ...doc2.data()
      }));
      setComments(commentsData);
    });
    return () => unsubscribe();
  }, [postId]);
  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!user || !newComment.trim() || !userProfile) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, "comments"), {
        text: newComment.trim(),
        userId: user.uid,
        userDisplayName: userProfile.displayName || "Usuario",
        userPhotoURL: userProfile.photoURL || "/images/default-avatar.png",
        createdAt: serverTimestamp(),
        postId,
        edited: false
      });
      setNewComment("");
    } catch (error) {
      console.error("Error al publicar comentario:", error);
      alert("No se pudo publicar tu comentario. Inténtalo de nuevo.");
    } finally {
      setSubmitting(false);
    }
  };
  const handleStartEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditedText(comment.text);
  };
  const handleCancelEditing = () => {
    setEditingCommentId(null);
    setEditedText("");
  };
  const handleSaveEdit = async (commentId) => {
    if (!user || !editedText.trim()) return;
    try {
      const commentRef = doc(db, "comments", commentId);
      await updateDoc(commentRef, {
        text: editedText.trim(),
        edited: true
      });
      setEditingCommentId(null);
      setEditedText("");
    } catch (error) {
      console.error("Error al editar comentario:", error);
      alert("No se pudo editar tu comentario. Inténtalo de nuevo.");
    }
  };
  const handleDeleteComment = async (commentId) => {
    if (!user) return;
    if (window.confirm("¿Estás seguro de que quieres eliminar este comentario?")) {
      try {
        await deleteDoc(doc(db, "comments", commentId));
      } catch (error) {
        console.error("Error al eliminar comentario:", error);
        alert("No se pudo eliminar el comentario. Inténtalo de nuevo.");
      }
    }
  };
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(date);
  };
  if (loading) {
    return /* @__PURE__ */ jsx("div", { className: "flex justify-center py-10", children: /* @__PURE__ */ jsx("div", { className: "animate-spin h-8 w-8 border-4 border-green-500 rounded-full border-t-transparent" }) });
  }
  return /* @__PURE__ */ jsxs("div", { className: "mt-12 pt-8 border-t border-green-900/30", children: [
    /* @__PURE__ */ jsx("h3", { className: "text-2xl font-bold text-green-400 mb-6", children: "Comentarios" }),
    user && userProfile ? /* @__PURE__ */ jsx("form", { onSubmit: handleSubmitComment, className: "mb-8", children: /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-4", children: [
      /* @__PURE__ */ jsx(
        "img",
        {
          src: userProfile.photoURL || "/images/default-avatar.png",
          alt: userProfile.displayName || "Usuario",
          className: "w-10 h-10 rounded-full object-cover"
        }
      ),
      /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
        /* @__PURE__ */ jsx("div", { className: "mb-2", children: /* @__PURE__ */ jsx("span", { className: "text-white font-medium", children: userProfile.displayName || "Usuario" }) }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: newComment,
            onChange: (e) => setNewComment(e.target.value),
            placeholder: "Escribe un comentario...",
            className: "w-full p-3 bg-green-900/20 border border-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white min-h-[100px] resize-y",
            required: true
          }
        ),
        /* @__PURE__ */ jsx("div", { className: "flex justify-end mt-2", children: /* @__PURE__ */ jsx(
          "button",
          {
            type: "submit",
            disabled: submitting || !newComment.trim(),
            className: "px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center",
            children: submitting ? /* @__PURE__ */ jsxs(Fragment, { children: [
              /* @__PURE__ */ jsx("span", { className: "inline-block animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2" }),
              "Publicando..."
            ] }) : "Publicar comentario"
          }
        ) })
      ] })
    ] }) }) : /* @__PURE__ */ jsxs("div", { className: "bg-green-900/30 rounded-lg p-6 mb-8 text-center", children: [
      /* @__PURE__ */ jsx("p", { className: "text-white mb-4", children: "Para dejar un comentario debes iniciar sesión primero." }),
      /* @__PURE__ */ jsxs("div", { className: "flex gap-4 justify-center", children: [
        /* @__PURE__ */ jsx("a", { href: "/login", className: "px-4 py-2 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors", children: "Iniciar sesión" }),
        /* @__PURE__ */ jsx("a", { href: "/register", className: "px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors", children: "Registrarse" })
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "space-y-6", children: comments.length === 0 ? /* @__PURE__ */ jsx("p", { className: "text-center text-gray-400 py-8", children: "Sé el primero en comentar este artículo." }) : comments.map((comment) => /* @__PURE__ */ jsxs("div", { className: "bg-green-900/20 rounded-lg p-5 border border-green-900/30", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-start mb-3", children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", children: [
          /* @__PURE__ */ jsx(
            "img",
            {
              src: comment.userPhotoURL || "/images/default-avatar.png",
              alt: comment.userDisplayName,
              className: "w-8 h-8 rounded-full object-cover"
            }
          ),
          /* @__PURE__ */ jsxs("div", { children: [
            /* @__PURE__ */ jsx("h4", { className: "font-medium text-white", children: comment.userDisplayName }),
            /* @__PURE__ */ jsxs("p", { className: "text-xs text-gray-400", children: [
              formatDate(comment.createdAt),
              comment.edited && /* @__PURE__ */ jsx("span", { className: "ml-2 text-green-400", children: "(editado)" })
            ] })
          ] })
        ] }),
        user && user.uid === comment.userId && /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: editingCommentId !== comment.id && /* @__PURE__ */ jsxs(Fragment, { children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleStartEditing(comment),
              className: "text-gray-400 hover:text-green-500 transition-colors",
              title: "Editar comentario",
              children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { d: "M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" }) })
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleDeleteComment(comment.id),
              className: "text-gray-400 hover:text-red-500 transition-colors",
              title: "Eliminar comentario",
              children: /* @__PURE__ */ jsx("svg", { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", viewBox: "0 0 20 20", fill: "currentColor", children: /* @__PURE__ */ jsx("path", { fillRule: "evenodd", d: "M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z", clipRule: "evenodd" }) })
            }
          )
        ] }) })
      ] }),
      editingCommentId === comment.id ? /* @__PURE__ */ jsxs("div", { className: "mt-2", children: [
        /* @__PURE__ */ jsx(
          "textarea",
          {
            value: editedText,
            onChange: (e) => setEditedText(e.target.value),
            className: "w-full p-3 bg-green-900/30 border border-green-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white min-h-[80px] resize-y",
            required: true
          }
        ),
        /* @__PURE__ */ jsxs("div", { className: "flex justify-end mt-2 gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: handleCancelEditing,
              className: "px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors text-sm",
              children: "Cancelar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: () => handleSaveEdit(comment.id),
              disabled: !editedText.trim(),
              className: "px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed",
              children: "Guardar cambios"
            }
          )
        ] })
      ] }) : /* @__PURE__ */ jsx("p", { className: "text-gray-300 whitespace-pre-line break-words", children: comment.text })
    ] }, comment.id)) })
  ] });
}

const $$Astro$1 = createAstro("https://www.centroumbandistareinodamata.org");
const $$CommentSectionWrapper = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$CommentSectionWrapper;
  const { postId, postTitle } = Astro2.props;
  return renderTemplate`${renderComponent($$result, "CommentSection", CommentSection, { "client:load": true, "postId": postId, "postTitle": postTitle, "client:component-hydration": "load", "client:component-path": "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/CommentSection", "client:component-export": "default" })}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/components/CommentSectionWrapper.astro", void 0);

const $$Astro = createAstro("https://www.centroumbandistareinodamata.org");
const prerender = false;
const $$ = createComponent(async ($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$;
  const { slug } = Astro2.params;
  if (!slug) {
    return Astro2.redirect("/blog");
  }
  const article = await getArticleBySlug(slug);
  if (!article || article.draft) {
    return Astro2.redirect("/404");
  }
  const allArticles = await getPublishedArticles();
  const relatedArticles = allArticles.filter((a) => a.slug !== article.slug).filter((a) => a.tags.some((tag) => article.tags.includes(tag))).sort(() => Math.random() - 0.5).slice(0, 3);
  let articlesToShow = [...relatedArticles];
  if (articlesToShow.length < 3) {
    const randomArticles = allArticles.filter((a) => a.slug !== article.slug && !articlesToShow.some((ra) => ra.slug === a.slug)).sort(() => Math.random() - 0.5).slice(0, 3 - articlesToShow.length);
    articlesToShow = [...articlesToShow, ...randomArticles];
  }
  const relatedPosts = articlesToShow.map((a) => ({
    data: {
      title: a.title,
      description: a.description,
      pubDate: a.publishDate.toDate(),
      heroImage: a.image,
      tags: a.tags,
      author: a.author
    },
    slug: a.slug
  }));
  const htmlContent = marked(article.content);
  const postData = {
    title: article.title,
    description: article.description,
    pubDate: article.publishDate.toDate(),
    heroImage: article.image,
    tags: article.tags,
    author: article.author
  };
  return renderTemplate`${renderComponent($$result, "BlogPost", $$BlogPost, { ...postData }, { "default": async ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="prose prose-invert prose-green max-w-none">${unescapeHTML(htmlContent)}</div>  ${renderComponent($$result2, "CommentSectionWrapper", $$CommentSectionWrapper, { "postId": article.slug, "postTitle": article.title })}  ${relatedPosts.length > 0 && renderTemplate`<section class="mt-16 pt-10 border-t border-green-900/30"> <h2 class="text-2xl font-bold text-green-400 mb-8">Artículos relacionados</h2> <div class="grid gap-6 md:grid-cols-3"> ${relatedPosts.map((p) => renderTemplate`${renderComponent($$result2, "Article", $$Article, { ...p.data, "slug": p.slug })}`)} </div> </section>`}` })}`;
}, "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/[...slug].astro", void 0);

const $$file = "/home/alexander/Desktop/ProyectosWeb/WebReinodaMata/src/pages/blog/[...slug].astro";
const $$url = "/blog/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$,
	file: $$file,
	prerender,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
