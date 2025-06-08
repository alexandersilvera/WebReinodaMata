import{h as w,f as b,o as E,a as L,l as B,d as z,b as y,i as C,q as I,e as M,n as k}from"./config.DlMdeYpO.js";import"./hoisted.D3FFN0QM.js";const D=w(b,"syncContentToFiles"),r=document.getElementById("loading"),l=document.getElementById("articles-table-container"),h=document.getElementById("error-message"),m=document.getElementById("unauthorized"),u=document.getElementById("sync-message"),o=document.getElementById("sync-status"),p=document.getElementById("sync-articles-btn"),x=document.getElementById("search-input"),i=document.getElementById("delete-modal"),f=document.getElementById("cancel-delete"),v=document.getElementById("confirm-delete");let s=[],d=null;const $=e=>{if(!e)return"Fecha desconocida";const n=e.toDate?e.toDate():new Date(e);return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}).format(n)},A=async()=>{try{const e=C(y,"articles"),n=I(e,M("publishDate","desc")),t=await k(n);return s=[],t.forEach(a=>{s.push({id:a.id,...a.data()})}),s}catch(e){throw console.error("Error al cargar artículos:",e),e}},T=async()=>{if(u&&o){u.classList.remove("hidden"),o.textContent="Iniciando sincronización...";try{const e=await D();o.textContent="Sincronización completada con éxito",setTimeout(()=>{u.classList.add("hidden")},3e3)}catch(e){console.error("Error al sincronizar artículos:",e),o.textContent=`Error: ${e.message||"No se pudo completar la sincronización"}`}}},c=e=>{if(!l)return;if(e.length===0){l.innerHTML=`
        <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center py-10">
          <p class="text-xl text-green-300">No hay artículos que coincidan con tu búsqueda</p>
        </div>
      `;return}const n=`
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-green-700">
            <thead class="bg-green-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fecha de publicación</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Autor</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Estado</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-green-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-green-900/20 divide-y divide-green-800">
              ${e.map(t=>`
                <tr data-id="${t.id}" class="hover:bg-green-800/30">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-white">${t.title}</div>
                    <div class="text-xs text-green-400 mt-1">${t.slug||""}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-green-200">${$(t.publishDate)}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-green-200">${t.author||"Sin autor"}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${t.draft?"bg-yellow-500/80 text-white":"bg-green-600 text-green-100"}">
                      ${t.draft?"Borrador":"Publicado"}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/blog/${t.slug}" target="_blank" class="text-blue-400 hover:text-blue-300 mr-3" title="Ver">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                      </svg>
                    </a>
                    <a href="/admin/articles/edit/${t.id}" class="text-yellow-400 hover:text-yellow-300 mr-3" title="Editar">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                    </a>
                    <button class="delete-article-btn text-red-400 hover:text-red-300" title="Eliminar" data-id="${t.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;l.innerHTML=n,document.querySelectorAll(".delete-article-btn").forEach(t=>{t.addEventListener("click",a=>{const g=a.currentTarget.getAttribute("data-id");g&&i&&(d=g,i.classList.remove("hidden"))})})},S=e=>{if(!e){c(s);return}const n=e.toLowerCase(),t=s.filter(a=>a.title.toLowerCase().includes(n)||a.content&&a.content.toLowerCase().includes(n));c(t)},q=async e=>{try{await B(z(y,"articles",e)),s=s.filter(n=>n.id!==e),c(s),i&&i.classList.add("hidden")}catch(n){console.error("Error al eliminar artículo:",n),alert("Error al eliminar el artículo. Por favor, intenta de nuevo.")}};f&&f.addEventListener("click",()=>{i&&i.classList.add("hidden"),d=null});v&&v.addEventListener("click",()=>{d&&q(d)});x&&x.addEventListener("input",e=>{S(e.target.value)});p&&p.addEventListener("click",T);E(L,async e=>{if(r&&r.classList.remove("hidden"),e)try{s=await A(),r&&r.classList.add("hidden"),l&&(l.classList.remove("hidden"),c(s))}catch(n){console.error("Error al cargar artículos:",n),r&&r.classList.add("hidden"),h&&h.classList.remove("hidden")}else r&&r.classList.add("hidden"),m&&m.classList.remove("hidden")});
