import{a as i}from"./subscribers.DdJeftNH.js";import"./hoisted.D3FFN0QM.js";import"./preload-helper.CLcXU_4U.js";import"./config.DlMdeYpO.js";document.getElementById("subscription-form")?.addEventListener("submit",async function(a){a.preventDefault();const e=a.target,o=e.elements.namedItem("first-name").value,c=e.elements.namedItem("last-name").value,n=e.elements.namedItem("email").value,r=e.querySelector('button[type="submit"]');r.disabled=!0,r.innerHTML=`
			<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
				<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
				<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
			</svg>
			<span>Procesando...</span>
		`;try{await i({firstName:o,lastName:c||void 0,email:n});const t=document.createElement("div");t.className="bg-green-600 text-white p-4 rounded-md text-center mt-4",t.innerHTML=`
				<p class="font-medium">¡Gracias ${o}!</p>
				<p class="text-sm mt-1">Te has suscrito correctamente. Pronto recibirás novedades sobre nuestro blog.</p>
			`,e.innerHTML="",e.appendChild(t)}catch(t){const s=document.createElement("div");s.className="bg-red-600 text-white p-4 rounded-md text-center mt-4",t instanceof Error&&t.message==="El correo electrónico ya está registrado"?s.innerHTML=`
					<p class="font-medium">¡Correo ya registrado!</p>
					<p class="text-sm mt-1">El correo ${n} ya está suscrito a nuestro blog.</p>
				`:(s.innerHTML=`
					<p class="font-medium">¡Ha ocurrido un error!</p>
					<p class="text-sm mt-1">No pudimos procesar tu suscripción. Por favor, intenta de nuevo más tarde.</p>
				`,console.error("Error al procesar suscripción:",t)),e.appendChild(s),r.disabled=!1,r.innerHTML=`
				<span>Suscribirme</span>
				<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
					<path fill-rule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clip-rule="evenodd" />
				</svg>
			`}});
