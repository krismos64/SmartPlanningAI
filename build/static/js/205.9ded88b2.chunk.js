"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[205],{1291:(e,r,o)=>{o.d(r,{AD:()=>f,J4:()=>y,Q$:()=>S,Ww:()=>p,Yq:()=>i,Z1:()=>v,cM:()=>g,rL:()=>m,rm:()=>d,vn:()=>h,w_:()=>E});var t=o(9734),a=o(1620),s=o(8605),n=o(1821),l=o(6981),c=o(2227),u=o(3418);const i=function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"dd/MM/yyyy";if(!e)return"";try{const o=e instanceof Date?e:new Date(e);return isNaN(o.getTime())?(console.error("Date invalide dans formatDate:",e),""):(0,t.GP)(o,r,{locale:c.fr})}catch(o){return console.error("Erreur lors du formatage de la date:",o,e),""}},d=e=>e?(0,t.GP)(e,"yyyy-MM-dd"):"",m=e=>(0,a.k)(e,{weekStartsOn:1}),p=e=>(0,s.$)(e,{weekStartsOn:1}),y=(e,r)=>(0,n.J)(e,r),h=e=>{const r=m(e),o=[];for(let t=0;t<7;t++)o.push((0,l.f)(r,t));return o},g=e=>{const r=new Date(e).getDay();return 0===r||6===r},E=(e,r)=>{if(!e||!r)return 0;const o=(r.getTime()-e.getTime())/36e5;return Math.round(10*o)/10},f=function(e){let r=arguments.length>1&&void 0!==arguments[1]&&arguments[1];const o=new Date(e).getDay();return r?["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"][o]:["Dimanche","Lundi","Mardi","Mercredi","Jeudi","Vendredi","Samedi"][o]},v=function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:u.YX;if(!e)return!1;const o=new Date(e);if(isNaN(o.getTime()))return!1;const t=(e=>{if(!e)return"";const r=new Date(e);return`${r.getFullYear()}-${String(r.getMonth()+1).padStart(2,"0")}-${String(r.getDate()).padStart(2,"0")}`})(o);return r.some((e=>e.date===t))},w=function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:u.YX;return!g(e)&&!v(e,r)},S=function(e,r){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:u.YX;if(!e||!r)return 0;const t=new Date(e),a=new Date(r);if(isNaN(t.getTime())||isNaN(a.getTime()))return 0;if(a<t)return 0;let s=0;const n=new Date(t);for(;n<=a;)w(n,o)&&s++,n.setDate(n.getDate()+1);return s}},2479:(e,r,o)=>{o.d(r,{A:()=>l});var t=o(5043),a=o(3768),s=o(4227),n=o(4634);const l=()=>{const[e,r]=(0,t.useState)([]),[o,l]=(0,t.useState)(!0),[c,u]=(0,t.useState)(null),i=(0,n.A)(),d=(0,t.useCallback)((async()=>{o||l(!0);try{const o=await i.get(s.Sn.EMPLOYEES.BASE);var e;if(!o.ok)throw new Error((null===(e=o.data)||void 0===e?void 0:e.message)||"Erreur lors du chargement des employ\xe9s");{const e=Array.isArray(o.data)?o.data:[];r(e),u(null)}}catch(t){console.error("Erreur lors du chargement des employ\xe9s:",t),u("Erreur lors du chargement des employ\xe9s"),a.oR.error("Erreur lors du chargement des employ\xe9s"),r([])}finally{l(!1)}}),[i,o]),m=(0,t.useCallback)((async e=>{l(!0),u(null);try{const o=await i.get(s.Sn.EMPLOYEES.BY_ID(e));if(o.ok)return o.data;var r;throw new Error((null===(r=o.data)||void 0===r?void 0:r.message)||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9")}catch(o){return console.error(`Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9 #${e}:`,o),u(o.message||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),a.oR.error("Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),null}finally{l(!1)}}),[i]),p=(0,t.useCallback)((async e=>{try{console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour cr\xe9ation:",e);const o={...e,contractHours:parseFloat(e.contractHours)||35,hourlyRate:parseFloat(e.hourlyRate)||0},t=await i.post(s.Sn.EMPLOYEES.BASE,o);if(console.log("R\xe9ponse de l'API pour cr\xe9ation:",t),t&&!1===t.success)return console.error("Erreur API:",t.message||"Erreur lors de la cr\xe9ation de l'employ\xe9"),{success:!1,error:t.message||"Erreur lors de la cr\xe9ation de l'employ\xe9"};if(t&&t.employee)return r((e=>[...e,t.employee])),{success:!0,employee:t.employee};if(t&&"object"===typeof t){if(t.message&&t.message.includes("erreur"))return{success:!1,error:t.message};if(t.id)return r((e=>[...e,t])),{success:!0,employee:t}}return r((e=>[...e,t])),{success:!0,employee:t}}catch(o){console.error("Erreur lors de la cr\xe9ation de l'employ\xe9:",o);let e="Erreur lors de la cr\xe9ation de l'employ\xe9";return o.response&&o.response.data?e=o.response.data.message||e:o.message&&(e=o.message),{success:!1,error:e}}}),[i]),y=(0,t.useCallback)((async(e,o)=>{try{if(!e)return console.error("ID d'employ\xe9 non valide:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour mise \xe0 jour:",o);const a={...o,contractHours:parseFloat(o.contractHours)||35,hourlyRate:parseFloat(o.hourlyRate)||0},n=await i.put(s.Sn.EMPLOYEES.BY_ID(e),a);if(console.log("R\xe9ponse de l'API pour mise \xe0 jour:",n),!n.ok){var t;const e=(null===(t=n.data)||void 0===t?void 0:t.message)||"Erreur lors de la mise \xe0 jour de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}return r((r=>r.map((r=>r.id===e?{...r,...n.data}:r)))),{success:!0,employee:n.data}}catch(a){return console.error("Erreur lors de la mise \xe0 jour de l'employ\xe9:",a),{success:!1,error:a.message||"Erreur inconnue"}}}),[i]),h=(0,t.useCallback)((async e=>{try{if(!e)return console.error("ID d'employ\xe9 non valide pour suppression:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Tentative de suppression de l'employ\xe9 avec ID:",e);const o=await i.delete(s.Sn.EMPLOYEES.BY_ID(e));if(console.log("R\xe9ponse de l'API pour suppression:",o),o&&!0===o.success)return r((r=>r.filter((r=>r.id!==e)))),{success:!0};{const e=(null===o||void 0===o?void 0:o.message)||"Erreur lors de la suppression de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}}catch(o){return console.error("Erreur lors de la suppression de l'employ\xe9:",o),{success:!1,error:o.message||"Erreur inconnue"}}}),[i]),g=(0,t.useCallback)((r=>r&&"all"!==r?e.filter((e=>e.status===r)):e),[e]),E=(0,t.useCallback)((async e=>{try{const t=await i.get(`/api/hour-balance/${e}`);return t.ok?(r((r=>r.map((r=>r.id===e?{...r,hour_balance:t.data.hour_balance}:r)))),t.data.hour_balance):(console.warn(`Avertissement: Impossible de r\xe9cup\xe9rer le solde d'heures pour l'employ\xe9 #${e}:`,(null===(o=t.data)||void 0===o?void 0:o.message)||"Raison inconnue"),0);var o}catch(t){return console.warn(`Avertissement: Erreur lors de la r\xe9cup\xe9ration du solde d'heures pour l'employ\xe9 #${e}:`,t),0}}),[i]),f=(0,t.useCallback)((async()=>{try{const r=e.map((e=>E(e.id)));await Promise.all(r)}catch(r){console.error("Erreur lors de la r\xe9cup\xe9ration des soldes d'heures:",r)}}),[e,E]);return(0,t.useEffect)((()=>{let e=!0,o=0;const t=async()=>{if(o>=3)e&&(u("Erreur lors du chargement des employ\xe9s apr\xe8s plusieurs tentatives"),l(!1));else try{console.log("Chargement des employ\xe9s...");if(!localStorage.getItem("token"))return console.error("Token d'authentification manquant"),u("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),void l(!1);const o=await i.get(s.Sn.EMPLOYEES.BASE);console.log("Donn\xe9es des employ\xe9s re\xe7ues:",o),e&&(Array.isArray(o)?(r(o),u(null)):(console.error("Format de donn\xe9es invalide:",o),u("Format de donn\xe9es invalide")),l(!1))}catch(a){e&&(console.error("Erreur lors du chargement des employ\xe9s:",a),u(a.message||"Erreur lors du chargement des employ\xe9s"),o++,setTimeout(t,1e3*Math.pow(2,o)))}};return t(),()=>{e=!1}}),[i]),(0,t.useEffect)((()=>{e.length>0&&f()}),[e.length,f]),{employees:e,loading:o,error:c,fetchEmployees:d,fetchEmployeeById:m,createEmployee:p,updateEmployee:y,deleteEmployee:h,getEmployeesByStatus:g,fetchEmployeeHourBalance:E,fetchAllEmployeesHourBalances:f}}},3418:(e,r,o)=>{o.d(r,{YX:()=>s,_z:()=>n,mM:()=>t,y6:()=>a});const t=[{value:"active",label:"Actif"},{value:"pending",label:"En attente"},{value:"inactive",label:"Inactif"}],a=[{value:"paid",label:"Cong\xe9s pay\xe9s",color:"#4CAF50",defaultQuota:25},{value:"rtt",label:"RTT",color:"#2196F3",defaultQuota:11},{value:"unpaid",label:"Cong\xe9s sans solde",color:"#9E9E9E",defaultQuota:null},{value:"sick",label:"Maladie",color:"#F44336",defaultQuota:null},{value:"exceptional",label:"Absence exceptionnelle",color:"#FF9800",defaultQuota:null},{value:"recovery",label:"R\xe9cup\xe9ration",color:"#9C27B0",defaultQuota:null}],s=[{date:"2024-01-01",name:"Jour de l'an"},{date:"2024-04-01",name:"Lundi de P\xe2ques"},{date:"2024-05-01",name:"F\xeate du Travail"},{date:"2024-05-08",name:"Victoire 1945"},{date:"2024-05-09",name:"Ascension"},{date:"2024-05-20",name:"Lundi de Pentec\xf4te"},{date:"2024-07-14",name:"F\xeate Nationale"},{date:"2024-08-15",name:"Assomption"},{date:"2024-11-01",name:"Toussaint"},{date:"2024-11-11",name:"Armistice 1918"},{date:"2024-12-25",name:"No\xebl"}],n=[{id:"name",header:"Nom",accessor:e=>`${e.first_name} ${e.last_name}`,sortable:!0},{id:"email",header:"Email",accessor:e=>e.email,sortable:!0},{id:"department",header:"D\xe9partement",accessor:e=>e.department,sortable:!0},{id:"role",header:"R\xf4le",accessor:e=>e.role,sortable:!0},{id:"status",header:"Statut",accessor:e=>e.status,sortable:!0,type:"status"},{id:"hour_balance",header:"Solde d'heures",accessor:e=>{const r=e.hour_balance||0,o=r>=0;return{value:r,display:`${o?"+":""}${r}h`,isPositive:o}},sortable:!0,type:"hour_balance"},{id:"hire_date",header:"Date d'embauche",accessor:e=>{if(!e.hire_date)return"";return new Date(e.hire_date).toLocaleDateString("fr-FR")},sortable:!0,type:"date"}]},4634:(e,r,o)=>{o.d(r,{A:()=>n});var t=o(5043),a=o(3768),s=o(4227);const n=()=>{const e=(0,t.useCallback)((async e=>{try{const o={};e.headers.forEach(((e,r)=>{o[r]=e})),console.log("R\xe9ponse du serveur:",{url:e.url,status:e.status,statusText:e.statusText,headers:o});const t=e.headers.get("content-type");let s;if(t&&t.includes("application/json"))s=await e.json(),console.log("Donn\xe9es JSON re\xe7ues:",s);else{const o=await e.text();console.warn("R\xe9ponse non-JSON re\xe7ue:",o);try{s=JSON.parse(o),console.log("Texte pars\xe9 comme JSON:",s)}catch(r){s={message:o}}}if(e.ok)return s;{401!==e.status&&403!==e.status||(console.error("Erreur d'authentification:",s),a.oR.error("Session expir\xe9e ou acc\xe8s non autoris\xe9. Veuillez vous reconnecter."),localStorage.removeItem("token"),localStorage.removeItem("user"),setTimeout((()=>{window.location.href="/login"}),2e3)),500===e.status&&(console.error("Erreur serveur:",s),console.error("URL:",e.url),console.error("M\xe9thode:",e.method),s.error&&console.error("D\xe9tails de l'erreur:",s.error),s.stack&&console.error("Stack trace:",s.stack));const r=s.message||s.error||e.statusText||"Erreur inconnue",o=new Error(r);throw o.status=e.status,o.response={status:e.status,data:s},o}}catch(o){throw console.error("Erreur lors du traitement de la r\xe9ponse:",o),o}}),[]);return(0,t.useMemo)((()=>({get:async r=>{try{console.log(`[API] GET ${r}`);const o=localStorage.getItem("token");if(!o)return console.error("Token d'authentification manquant pour la requ\xeate GET"),a.oR.error("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),setTimeout((()=>{window.location.href="/login"}),2e3),{ok:!1,status:401,data:[]};const t=await fetch(`${s.H$}${r}`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`},credentials:"include"});return await e(t)}catch(o){throw console.error(`[API] GET ${r} Error:`,o),401===o.status||403===o.status?(a.oR.error("Session expir\xe9e. Veuillez vous reconnecter."),setTimeout((()=>{window.location.href="/login"}),2e3)):a.oR.error(o.message||"Erreur lors de la r\xe9cup\xe9ration des donn\xe9es"),o}},post:async(r,o)=>{try{if(!o||"object"!==typeof o)throw console.error("Donn\xe9es invalides pour la requ\xeate POST:",o),new Error("Donn\xe9es invalides pour la requ\xeate POST");const a={};for(const e in o)a[(t=e,t.replace(/[A-Z]/g,(e=>`_${e.toLowerCase()}`)))]=o[e];const n=localStorage.getItem("token");if(!n)throw console.error("Token d'authentification manquant"),new Error("Vous devez \xeatre connect\xe9 pour effectuer cette action");const l={"Content-Type":"application/json",Authorization:`Bearer ${n}`};console.log("D\xe9tails de la requ\xeate POST:",{endpoint:r,dataSize:JSON.stringify(a).length,headers:{...l,Authorization:"Bearer [MASQU\xc9]"}});const c=new AbortController,u=setTimeout((()=>c.abort()),3e4),i=await fetch(`${s.H$}${r}`,{method:"POST",headers:l,body:JSON.stringify(a),signal:c.signal});return clearTimeout(u),e(i)}catch(a){if("AbortError"===a.name)throw console.error("La requ\xeate a \xe9t\xe9 interrompue (timeout):",a),new Error("La requ\xeate a pris trop de temps, veuillez r\xe9essayer");if(a.message.includes("NetworkError")||a.message.includes("Failed to fetch"))throw console.error("Erreur r\xe9seau lors de la requ\xeate POST:",a),new Error("Probl\xe8me de connexion au serveur, veuillez v\xe9rifier votre connexion internet");throw console.error("Erreur lors de la requ\xeate POST:",a),a}var t},put:async(r,o)=>{try{console.log(`[API] PUT ${r}`,o);const t=localStorage.getItem("token"),a=JSON.parse(JSON.stringify(o)),n=await fetch(`${s.H$}${r}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:t?`Bearer ${t}`:""},body:JSON.stringify(a),credentials:"include"}),l=await e(n);return console.log(`[API] PUT ${r} Response:`,l),l}catch(t){return console.error(`[API] PUT ${r} Error:`,t),{ok:!1,status:0,data:{message:t.message||"Erreur lors de la requ\xeate PUT"},headers:new Headers}}},delete:async r=>{try{console.log(`[API] DELETE ${r}`);const o=localStorage.getItem("token"),t=await fetch(`${s.H$}${r}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:o?`Bearer ${o}`:""},credentials:"include"}),a=await e(t);return console.log(`[API] DELETE ${r} Response:`,a),a}catch(o){return console.error(`[API] DELETE ${r} Error:`,o),{ok:!1,status:0,data:{message:o.message||"Erreur lors de la requ\xeate DELETE"},headers:new Headers}}}})),[e])}}}]);
//# sourceMappingURL=205.9ded88b2.chunk.js.map