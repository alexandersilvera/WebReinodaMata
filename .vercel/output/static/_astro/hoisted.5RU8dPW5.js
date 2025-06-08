import{_ as q}from"./preload-helper.CLcXU_4U.js";import{o as j,a as z,T as H,i as h,b as x,q as m,e as b,w as v,n as y}from"./config.DlMdeYpO.js";import"./hoisted.D3FFN0QM.js";let A;const Q=async()=>{try{A=(await q(()=>import("https://cdn.skypack.dev/chart.js/auto"),[])).default}catch(t){console.error("Error cargando Chart.js:",t)}},M=document.getElementById("loading"),T=document.getElementById("metrics-cards");document.getElementById("charts-container");const w=document.getElementById("popular-articles-container");document.getElementById("period-selector");const I=document.getElementById("error-message");let D=null,S=null,n=365,l={totalVisits:0,totalSubscribers:0,totalArticles:0,totalComments:0,visitsPerDay:{labels:[],data:[]},subscribersPerDay:{labels:[],data:[]},popularArticles:[]};const F=()=>{document.querySelectorAll(".period-btn").forEach(e=>{e.addEventListener("click",i=>{document.querySelectorAll(".period-btn").forEach(a=>{a.classList.remove("bg-green-700","text-white","active"),a.classList.add("text-green-300","hover:bg-green-800/50","hover:text-white")});const r=i.currentTarget;r.classList.add("bg-green-700","text-white","active"),r.classList.remove("text-green-300","hover:bg-green-800/50","hover:text-white"),n=parseInt(r.getAttribute("data-period")||"365"),r.getAttribute("data-period")==="all"&&(n=9999),$()})});const t=document.querySelector(`.period-btn[data-period="${n}"]`);t&&(t.classList.add("bg-green-700","text-white"),t.classList.remove("text-green-300","hover:bg-green-800/50","hover:text-white"))},$=async()=>{try{const t=new Date,e=new Date(t);e.setDate(e.getDate()-n);const i=H.fromDate(e),r=h(x,"pageViews");let a=m(r,b("timestamp","desc"));n!==9999&&(a=m(r,v("timestamp",">=",i),b("timestamp","desc")));const d=await y(a),p=[];d.forEach(u=>p.push(u.data()));const g=h(x,"subscribers");let s=m(g,b("createdAt","desc"));n!==9999&&(s=m(g,v("createdAt",">=",i),b("createdAt","desc")));const o=await y(s),c=[];o.forEach(u=>c.push(u.data()));const E=h(x,"articles");let C=m(E,b("publishDate","desc"));n!==9999&&(C=m(E,v("publishDate",">=",i),b("publishDate","desc")));const P=await y(C),f=[];P.forEach(u=>f.push({id:u.id,...u.data()}));const k=h(x,"comments");let B=m(k,b("createdAt","desc"));n!==9999&&(B=m(k,v("createdAt",">=",i),b("createdAt","desc")));const V=await y(B),L=[];V.forEach(u=>L.push(u.data()));const R=W(p),_=N(c),O=Z(f,p);l={totalVisits:p.length,totalSubscribers:c.length,totalArticles:f.length,totalComments:L.length,visitsPerDay:R,subscribersPerDay:_,popularArticles:O.slice(0,5)},G(),J(),K(),U()}catch(t){console.error("Error al cargar métricas:",t),I&&I.classList.remove("hidden")}finally{M&&M.classList.add("hidden")}},W=t=>{const e={},i=new Date;for(let s=0;s<n&&s<365;s++){const o=new Date(i);o.setDate(o.getDate()-s);const c=o.toISOString().split("T")[0];e[c]=0}t.forEach(s=>{const c=s.timestamp.toDate().toISOString().split("T")[0];e[c]!==void 0&&e[c]++});const r=Object.keys(e).sort(),d=Math.max(1,Math.floor(r.length/30)),p=[],g=[];for(let s=r.length-1;s>=0;s-=d){const o=new Date(r[s]);p.unshift(o.toLocaleDateString("es-ES",{day:"numeric",month:"short"})),g.unshift(e[r[s]])}return{labels:p,data:g}},N=t=>{const e={},i=new Date;for(let s=0;s<n&&s<365;s++){const o=new Date(i);o.setDate(o.getDate()-s);const c=o.toISOString().split("T")[0];e[c]=0}t.forEach(s=>{const c=s.createdAt.toDate().toISOString().split("T")[0];e[c]!==void 0&&e[c]++});const r=Object.keys(e).sort(),d=Math.max(1,Math.floor(r.length/30)),p=[],g=[];for(let s=r.length-1;s>=0;s-=d){const o=new Date(r[s]);p.unshift(o.toLocaleDateString("es-ES",{day:"numeric",month:"short"})),g.unshift(e[r[s]])}return{labels:p,data:g}},Z=(t,e)=>{const i={};return e.forEach(a=>{if(a.path&&a.path.startsWith("/blog/")){const d=a.path.replace("/blog/","");i[d]=(i[d]||0)+1}}),t.map(a=>({...a,visits:i[a.slug]||0})).sort((a,d)=>d.visits-a.visits)},G=()=>{if(!T)return;const t=n===9999?"Todo el tiempo":n===365?"Último año":n===90?"Últimos 3 meses":n===30?"Últimos 30 días":"Últimos 7 días",e=`
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
        <div class="text-4xl font-bold text-green-500">${l.totalVisits}</div>
        <div class="text-sm text-gray-300 mt-2">Visitas totales</div>
        <div class="text-xs text-gray-400 mt-1">${t}</div>
      </div>
      
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
        <div class="text-4xl font-bold text-green-500">${l.totalSubscribers}</div>
        <div class="text-sm text-gray-300 mt-2">Suscriptores</div>
        <div class="text-xs text-gray-400 mt-1">${t}</div>
      </div>
      
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
        <div class="text-4xl font-bold text-green-500">${l.totalArticles}</div>
        <div class="text-sm text-gray-300 mt-2">Artículos publicados</div>
        <div class="text-xs text-gray-400 mt-1">${t}</div>
      </div>
      
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
        <div class="text-4xl font-bold text-green-500">${l.totalComments}</div>
        <div class="text-sm text-gray-300 mt-2">Comentarios</div>
        <div class="text-xs text-gray-400 mt-1">${t}</div>
      </div>
    `;T.innerHTML=e},J=()=>{const t=document.getElementById("visits-chart");t&&(D&&D.destroy(),D=new A(t,{type:"line",data:{labels:l.visitsPerDay.labels,datasets:[{label:"Visitas",data:l.visitsPerDay.data,borderColor:"#10B981",backgroundColor:"rgba(16, 185, 129, 0.2)",tension:.3,fill:!0,pointBackgroundColor:"#10B981",pointRadius:3,pointHoverRadius:5}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{color:"rgba(255, 255, 255, 0.7)"}},x:{grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{color:"rgba(255, 255, 255, 0.7)"}}}}}))},K=()=>{const t=document.getElementById("subscribers-chart");t&&(S&&S.destroy(),S=new A(t,{type:"bar",data:{labels:l.subscribersPerDay.labels,datasets:[{label:"Nuevos suscriptores",data:l.subscribersPerDay.data,backgroundColor:"#10B981",borderRadius:4}]},options:{responsive:!0,maintainAspectRatio:!1,plugins:{legend:{display:!1}},scales:{y:{beginAtZero:!0,grid:{color:"rgba(255, 255, 255, 0.1)"},ticks:{color:"rgba(255, 255, 255, 0.7)",stepSize:1}},x:{grid:{display:!1},ticks:{color:"rgba(255, 255, 255, 0.7)"}}}}}))},U=()=>{if(!w)return;if(l.popularArticles.length===0){w.innerHTML=`
        <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm text-center">
          <p class="text-xl text-green-300">No hay suficientes datos para mostrar artículos populares</p>
        </div>
      `;return}const t=`
      <div class="bg-green-900/30 p-6 rounded-lg backdrop-blur-sm">
        <h3 class="text-xl font-bold text-green-500 mb-4">Artículos más populares</h3>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-green-700">
            <thead class="bg-green-800/50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Título</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Fecha</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">Visitas</th>
                <th class="px-6 py-3 text-right text-xs font-medium text-green-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody class="bg-green-900/20 divide-y divide-green-800">
              ${l.popularArticles.map((e,i)=>`
                <tr class="hover:bg-green-800/30">
                  <td class="px-6 py-4">
                    <div class="text-sm font-medium text-white">${e.title}</div>
                    <div class="text-xs text-green-400 mt-1">${e.slug||""}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-green-200">${X(e.publishDate)}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-bold text-green-400">${e.visits}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <a href="/blog/${e.slug}" target="_blank" class="text-blue-400 hover:text-blue-300" title="Ver">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 inline" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                      </svg>
                    </a>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      </div>
    `;w.innerHTML=t},X=t=>{if(!t)return"Fecha desconocida";const e=t.toDate?t.toDate():new Date(t);return new Intl.DateTimeFormat("es-ES",{day:"2-digit",month:"2-digit",year:"numeric"}).format(e)};j(z,async t=>{t?(await Q(),F(),await $()):window.location.href="/admin/login"});
