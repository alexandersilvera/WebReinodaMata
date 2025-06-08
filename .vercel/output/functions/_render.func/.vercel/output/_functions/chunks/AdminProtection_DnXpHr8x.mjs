import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { a as auth, c as configUtils } from './MainLayout_Z_KOHTtX.mjs';
import { onAuthStateChanged } from 'firebase/auth';

function AdminProtection({ children, fallback }) {
  const [isAdmin, setIsAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user?.email) {
          const adminStatus = configUtils.isAdminEmail(user.email);
          setIsAdmin(adminStatus);
          console.log("Admin verification:", { email: user.email, isAdmin: adminStatus });
        } else {
          setIsAdmin(false);
          console.log("No user authenticated");
        }
      } catch (error) {
        console.error("Error verificando estado de admin:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  if (loading) {
    return /* @__PURE__ */ jsxs("div", { className: "flex justify-center items-center min-h-[200px]", children: [
      /* @__PURE__ */ jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600" }),
      /* @__PURE__ */ jsx("span", { className: "ml-2 text-gray-600", children: "Verificando permisos..." })
    ] });
  }
  if (!isAdmin) {
    return fallback || /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px] bg-red-50 border border-red-200 rounded-lg p-8", children: [
      /* @__PURE__ */ jsx("div", { className: "text-red-600 text-6xl mb-4", children: "🚫" }),
      /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold text-red-800 mb-2", children: "Acceso Denegado" }),
      /* @__PURE__ */ jsx("p", { className: "text-red-700 text-center max-w-md", children: "No tienes permisos para acceder a esta sección. Solo los administradores pueden ver este contenido." }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => window.location.href = "/",
          className: "mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors",
          children: "Ir al Inicio"
        }
      )
    ] });
  }
  return /* @__PURE__ */ jsx(Fragment, { children });
}

export { AdminProtection as A };
