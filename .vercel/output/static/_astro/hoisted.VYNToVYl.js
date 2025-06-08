import{o as x,a as p}from"./config.DlMdeYpO.js";import{g as m,u as h,d as f}from"./subscribers.DdJeftNH.js";import"./hoisted.D3FFN0QM.js";import"./preload-helper.CLcXU_4U.js";const a=document.getElementById("loading"),i=document.getElementById("subscribers-table-container"),g=document.getElementById("error-message"),u=document.getElementById("unauthorized"),y=t=>{if(!t)return"Fecha desconocida";let r;try{if(t.toDate&&typeof t.toDate=="function")r=t.toDate();else if(t instanceof Date)r=t;else if(typeof t=="number")r=new Date(t);else if(typeof t=="string")r=new Date(t);else return"Formato de fecha inválido";return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"}).format(r)}catch(n){return console.error("Error al formatear fecha:",n),"Error de formato"}};x(p,async t=>{if(a&&a.classList.remove("hidden"),t)try{const r=await m();if(i){if(a&&a.classList.add("hidden"),i.classList.remove("hidden"),r.length===0){i.innerHTML=`
                <div class="text-center py-10">
                  <p class="text-xl text-green-300">No hay suscriptores registrados</p>
                </div>
              `;return}const n=`
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-green-700">
                  <thead class="bg-green-800/50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Nombre</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Email</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fecha de suscripción</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Estado</th>
                      <th class="px-6 py-3 text-right text-xs font-medium text-green-300 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody class="bg-green-900/20 divide-y divide-green-800">
                    ${r.map(e=>`
                      <tr data-id="${e.id}" class="hover:bg-green-800/30">
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm font-medium text-white">${e.firstName} ${e.lastName||""}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-green-200">${e.email}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <div class="text-sm text-green-200">${y(e.createdAt)}</div>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap">
                          <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${e.active?"bg-green-600 text-green-100":"bg-gray-600 text-gray-100"}">
                            ${e.active?"Activo":"Inactivo"}
                          </span>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button class="toggle-status text-${e.active?"yellow":"green"}-400 hover:text-${e.active?"yellow":"green"}-300 mr-3">
                            ${e.active?"Desactivar":"Activar"}
                          </button>
                          <button class="delete-subscriber text-red-400 hover:text-red-300">
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    `).join("")}
                  </tbody>
                </table>
              </div>
            `;i.innerHTML=n,document.querySelectorAll(".toggle-status").forEach(e=>{e.addEventListener("click",async o=>{const s=o.target.closest("tr");if(s){const c=s.getAttribute("data-id"),d=o.target.textContent?.trim()==="Desactivar";try{await h(c,!d),window.location.reload()}catch(l){console.error("Error al cambiar estado:",l),alert("Error al cambiar el estado del suscriptor")}}})}),document.querySelectorAll(".delete-subscriber").forEach(e=>{e.addEventListener("click",async o=>{const s=o.target.closest("tr");if(s){const c=s.getAttribute("data-id"),d=s.querySelector("td:nth-child(2) div")?.textContent;if(confirm(`¿Estás seguro de que deseas eliminar al suscriptor ${d}? Esta acción no se puede deshacer.`))try{await f(c),s.remove(),document.querySelectorAll("table tbody tr").length===0&&(i.innerHTML=`
                          <div class="text-center py-10">
                            <p class="text-xl text-green-300">No hay suscriptores registrados</p>
                          </div>
                        `)}catch(l){console.error("Error al eliminar:",l),alert("Error al eliminar el suscriptor")}}})})}}catch(r){console.error("Error al cargar suscriptores:",r),a&&a.classList.add("hidden"),g&&g.classList.remove("hidden")}else a&&a.classList.add("hidden"),u&&u.classList.remove("hidden")});
