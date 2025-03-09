"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[760],{2479:(e,r,t)=>{t.d(r,{A:()=>l});var o=t(5043),s=t(3768),n=t(4227),a=t(4634);const l=()=>{const[e,r]=(0,o.useState)([]),[t,l]=(0,o.useState)(!0),[i,c]=(0,o.useState)(null),d=(0,a.A)(),u=(0,o.useCallback)((async()=>{t||l(!0);try{const t=await d.get(n.Sn.EMPLOYEES.BASE);var e;if(!t.ok)throw new Error((null===(e=t.data)||void 0===e?void 0:e.message)||"Erreur lors du chargement des employ\xe9s");{const e=Array.isArray(t.data)?t.data:[];r(e),c(null)}}catch(o){console.error("Erreur lors du chargement des employ\xe9s:",o),c("Erreur lors du chargement des employ\xe9s"),s.oR.error("Erreur lors du chargement des employ\xe9s"),r([])}finally{l(!1)}}),[d,t]),m=(0,o.useCallback)((async e=>{l(!0),c(null);try{const t=await d.get(n.Sn.EMPLOYEES.BY_ID(e));if(t.ok)return t.data;var r;throw new Error((null===(r=t.data)||void 0===r?void 0:r.message)||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9")}catch(t){return console.error(`Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9 #${e}:`,t),c(t.message||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),s.oR.error("Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),null}finally{l(!1)}}),[d]),p=(0,o.useCallback)((async e=>{try{console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour cr\xe9ation:",e);const t={...e,contractHours:parseFloat(e.contractHours)||35,hourlyRate:parseFloat(e.hourlyRate)||0},o=await d.post(n.Sn.EMPLOYEES.BASE,t);if(console.log("R\xe9ponse de l'API pour cr\xe9ation:",o),o&&!1===o.success)return console.error("Erreur API:",o.message||"Erreur lors de la cr\xe9ation de l'employ\xe9"),{success:!1,error:o.message||"Erreur lors de la cr\xe9ation de l'employ\xe9"};if(o&&o.employee)return r((e=>[...e,o.employee])),{success:!0,employee:o.employee};if(o&&"object"===typeof o){if(o.message&&o.message.includes("erreur"))return{success:!1,error:o.message};if(o.id)return r((e=>[...e,o])),{success:!0,employee:o}}return r((e=>[...e,o])),{success:!0,employee:o}}catch(t){console.error("Erreur lors de la cr\xe9ation de l'employ\xe9:",t);let e="Erreur lors de la cr\xe9ation de l'employ\xe9";return t.response&&t.response.data?e=t.response.data.message||e:t.message&&(e=t.message),{success:!1,error:e}}}),[d]),h=(0,o.useCallback)((async(e,t)=>{try{if(!e)return console.error("ID d'employ\xe9 non valide:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour mise \xe0 jour:",t);const s={...t,contractHours:parseFloat(t.contractHours)||35,hourlyRate:parseFloat(t.hourlyRate)||0},a=await d.put(n.Sn.EMPLOYEES.BY_ID(e),s);if(console.log("R\xe9ponse de l'API pour mise \xe0 jour:",a),!a.ok){var o;const e=(null===(o=a.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}return r((r=>r.map((r=>r.id===e?{...r,...a.data}:r)))),{success:!0,employee:a.data}}catch(s){return console.error("Erreur lors de la mise \xe0 jour de l'employ\xe9:",s),{success:!1,error:s.message||"Erreur inconnue"}}}),[d]),y=(0,o.useCallback)((async e=>{try{if(!e)return console.error("ID d'employ\xe9 non valide pour suppression:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Tentative de suppression de l'employ\xe9 avec ID:",e);const t=await d.delete(n.Sn.EMPLOYEES.BY_ID(e));if(console.log("R\xe9ponse de l'API pour suppression:",t),t&&!0===t.success)return r((r=>r.filter((r=>r.id!==e)))),{success:!0};{const e=(null===t||void 0===t?void 0:t.message)||"Erreur lors de la suppression de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}}catch(t){return console.error("Erreur lors de la suppression de l'employ\xe9:",t),{success:!1,error:t.message||"Erreur inconnue"}}}),[d]),g=(0,o.useCallback)((r=>r&&"all"!==r?e.filter((e=>e.status===r)):e),[e]),x=(0,o.useCallback)((async e=>{try{const o=await d.get(`/api/hour-balance/${e}`);return o.ok?(r((r=>r.map((r=>r.id===e?{...r,hour_balance:o.data.hour_balance}:r)))),o.data.hour_balance):(console.warn(`Avertissement: Impossible de r\xe9cup\xe9rer le solde d'heures pour l'employ\xe9 #${e}:`,(null===(t=o.data)||void 0===t?void 0:t.message)||"Raison inconnue"),0);var t}catch(o){return console.warn(`Avertissement: Erreur lors de la r\xe9cup\xe9ration du solde d'heures pour l'employ\xe9 #${e}:`,o),0}}),[d]),f=(0,o.useCallback)((async()=>{try{const r=e.map((e=>x(e.id)));await Promise.all(r)}catch(r){console.error("Erreur lors de la r\xe9cup\xe9ration des soldes d'heures:",r)}}),[e,x]);return(0,o.useEffect)((()=>{let e=!0,t=0;const o=async()=>{if(t>=3)e&&(c("Erreur lors du chargement des employ\xe9s apr\xe8s plusieurs tentatives"),l(!1));else try{console.log("Chargement des employ\xe9s...");if(!localStorage.getItem("token"))return console.error("Token d'authentification manquant"),c("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),void l(!1);const t=await d.get(n.Sn.EMPLOYEES.BASE);console.log("Donn\xe9es des employ\xe9s re\xe7ues:",t),e&&(Array.isArray(t)?(r(t),c(null)):(console.error("Format de donn\xe9es invalide:",t),c("Format de donn\xe9es invalide")),l(!1))}catch(s){e&&(console.error("Erreur lors du chargement des employ\xe9s:",s),c(s.message||"Erreur lors du chargement des employ\xe9s"),t++,setTimeout(o,1e3*Math.pow(2,t)))}};return o(),()=>{e=!1}}),[d]),(0,o.useEffect)((()=>{e.length>0&&f()}),[e.length,f]),{employees:e,loading:t,error:i,fetchEmployees:u,fetchEmployeeById:m,createEmployee:p,updateEmployee:h,deleteEmployee:y,getEmployeesByStatus:g,fetchEmployeeHourBalance:x,fetchAllEmployeesHourBalances:f}}},4634:(e,r,t)=>{t.d(r,{A:()=>a});var o=t(5043),s=t(3768),n=t(4227);const a=()=>{const e=(0,o.useCallback)((async e=>{try{const t={};e.headers.forEach(((e,r)=>{t[r]=e})),console.log("R\xe9ponse du serveur:",{url:e.url,status:e.status,statusText:e.statusText,headers:t});const o=e.headers.get("content-type");let n;if(o&&o.includes("application/json"))n=await e.json(),console.log("Donn\xe9es JSON re\xe7ues:",n);else{const t=await e.text();console.warn("R\xe9ponse non-JSON re\xe7ue:",t);try{n=JSON.parse(t),console.log("Texte pars\xe9 comme JSON:",n)}catch(r){n={message:t}}}if(e.ok)return n;{401!==e.status&&403!==e.status||(console.error("Erreur d'authentification:",n),s.oR.error("Session expir\xe9e ou acc\xe8s non autoris\xe9. Veuillez vous reconnecter."),localStorage.removeItem("token"),localStorage.removeItem("user"),setTimeout((()=>{window.location.href="/login"}),2e3)),500===e.status&&(console.error("Erreur serveur:",n),console.error("URL:",e.url),console.error("M\xe9thode:",e.method),n.error&&console.error("D\xe9tails de l'erreur:",n.error),n.stack&&console.error("Stack trace:",n.stack));const r=n.message||n.error||e.statusText||"Erreur inconnue",t=new Error(r);throw t.status=e.status,t.response={status:e.status,data:n},t}}catch(t){throw console.error("Erreur lors du traitement de la r\xe9ponse:",t),t}}),[]);return(0,o.useMemo)((()=>({get:async r=>{try{console.log(`[API] GET ${r}`);const t=localStorage.getItem("token");if(!t)return console.error("Token d'authentification manquant pour la requ\xeate GET"),s.oR.error("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),setTimeout((()=>{window.location.href="/login"}),2e3),{ok:!1,status:401,data:[]};const o=await fetch(`${n.H$}${r}`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},credentials:"include"});return await e(o)}catch(t){throw console.error(`[API] GET ${r} Error:`,t),401===t.status||403===t.status?(s.oR.error("Session expir\xe9e. Veuillez vous reconnecter."),setTimeout((()=>{window.location.href="/login"}),2e3)):s.oR.error(t.message||"Erreur lors de la r\xe9cup\xe9ration des donn\xe9es"),t}},post:async(r,t)=>{try{if(!t||"object"!==typeof t)throw console.error("Donn\xe9es invalides pour la requ\xeate POST:",t),new Error("Donn\xe9es invalides pour la requ\xeate POST");const s={};for(const e in t)s[(o=e,o.replace(/[A-Z]/g,(e=>`_${e.toLowerCase()}`)))]=t[e];const a=localStorage.getItem("token");if(!a)throw console.error("Token d'authentification manquant"),new Error("Vous devez \xeatre connect\xe9 pour effectuer cette action");const l={"Content-Type":"application/json",Authorization:`Bearer ${a}`};console.log("D\xe9tails de la requ\xeate POST:",{endpoint:r,dataSize:JSON.stringify(s).length,headers:{...l,Authorization:"Bearer [MASQU\xc9]"}});const i=new AbortController,c=setTimeout((()=>i.abort()),3e4),d=await fetch(`${n.H$}${r}`,{method:"POST",headers:l,body:JSON.stringify(s),signal:i.signal});return clearTimeout(c),e(d)}catch(s){if("AbortError"===s.name)throw console.error("La requ\xeate a \xe9t\xe9 interrompue (timeout):",s),new Error("La requ\xeate a pris trop de temps, veuillez r\xe9essayer");if(s.message.includes("NetworkError")||s.message.includes("Failed to fetch"))throw console.error("Erreur r\xe9seau lors de la requ\xeate POST:",s),new Error("Probl\xe8me de connexion au serveur, veuillez v\xe9rifier votre connexion internet");throw console.error("Erreur lors de la requ\xeate POST:",s),s}var o},put:async(r,t)=>{try{console.log(`[API] PUT ${r}`,t);const o=localStorage.getItem("token"),s=JSON.parse(JSON.stringify(t)),a=await fetch(`${n.H$}${r}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:o?`Bearer ${o}`:""},body:JSON.stringify(s),credentials:"include"}),l=await e(a);return console.log(`[API] PUT ${r} Response:`,l),l}catch(o){return console.error(`[API] PUT ${r} Error:`,o),{ok:!1,status:0,data:{message:o.message||"Erreur lors de la requ\xeate PUT"},headers:new Headers}}},delete:async r=>{try{console.log(`[API] DELETE ${r}`);const t=localStorage.getItem("token"),o=await fetch(`${n.H$}${r}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:t?`Bearer ${t}`:""},credentials:"include"}),s=await e(o);return console.log(`[API] DELETE ${r} Response:`,s),s}catch(t){return console.error(`[API] DELETE ${r} Error:`,t),{ok:!1,status:0,data:{message:t.message||"Erreur lors de la requ\xeate DELETE"},headers:new Headers}}}})),[e])}},8760:(e,r,t)=>{t.r(r),t.d(r,{default:()=>ze});var o=t(3750),s=t.n(o),n=t(5464),a=t(6213),l=t(5200),i=t(2479),c=t(579);const d=n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`,u=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
`,m=n.Ay.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`,p=n.Ay.h3`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0;
`,h=n.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,y=n.Ay.div`
  font-size: 1.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,g=n.Ay.div`
  text-align: center;
  padding: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,x=()=>{const{employees:e,loading:r}=(0,i.A)();return(0,c.jsx)(d,{children:r?(0,c.jsx)(g,{children:"Chargement des statistiques..."}):(0,c.jsx)(c.Fragment,{children:(0,c.jsxs)(u,{children:[(0,c.jsxs)(m,{children:[(0,c.jsx)(p,{children:"Total employ\xe9s"}),(0,c.jsx)(h,{color:"#4F46E5",children:(0,c.jsx)(l.cfS,{})})]}),(0,c.jsx)(y,{children:(null===e||void 0===e?void 0:e.length)||0})]})})})};var f=t(9734),v=t(2227),b=t(7786),$=t(5043),j=t(3768),A=t(4227),w=t(5016),E=t(4634),k=t(2693);const S=()=>{const[e,r]=(0,$.useState)([]),[t,o]=(0,$.useState)(!0),[s,n]=(0,$.useState)(null),a=(0,E.A)(),{user:i}=(0,w.A)(),{activities:d,socket:u,requestActivitiesUpdate:m,fallbackMode:p}=(0,k.A)(),h=(0,$.useCallback)((async function(){try{o(!0);const e=await a.get(A.Sn.ACTIVITIES.BASE);if(!e||!Array.isArray(e)&&!e.data)throw new Error("Erreur lors du chargement des activit\xe9s: format de r\xe9ponse invalide");{const t=Array.isArray(e)?e:Array.isArray(e.data)?e.data:[];r(t),n(null)}}catch(e){console.error("Erreur lors du chargement des activit\xe9s:",e),n("Erreur lors du chargement des activit\xe9s"),j.oR.error("Erreur lors du chargement des activit\xe9s"),r([])}finally{o(!1)}}),[a]),y=(0,$.useCallback)((async e=>{try{const o=await a.post(A.Sn.ACTIVITIES.BASE,e);if(o.ok)return r((e=>[...e,o.data])),j.oR.success("Activit\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,activity:o.data};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la cr\xe9ation de l'activit\xe9")}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'activit\xe9:",o),j.oR.error("Erreur lors de la cr\xe9ation de l'activit\xe9"),{success:!1,error:o.message}}}),[a]),g=(0,$.useCallback)((async(e,t)=>{try{const s=await a.put(`${A.Sn.ACTIVITIES.BASE}/${e}`,t);if(s.ok)return r((r=>r.map((r=>r.id===e?{...r,...s.data}:r)))),j.oR.success("Activit\xe9 mise \xe0 jour avec succ\xe8s"),{success:!0,activity:s.data};var o;throw new Error((null===(o=s.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'activit\xe9")}catch(s){return console.error("Erreur lors de la mise \xe0 jour de l'activit\xe9:",s),j.oR.error("Erreur lors de la mise \xe0 jour de l'activit\xe9"),{success:!1,error:s.message}}}),[a]),x=(0,$.useCallback)((async e=>{try{const o=await a.delete(`${A.Sn.ACTIVITIES.BASE}/${e}`);if(o.ok)return r((r=>r.filter((r=>r.id!==e)))),j.oR.success("Activit\xe9 supprim\xe9e avec succ\xe8s"),{success:!0};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de l'activit\xe9")}catch(o){return console.error("Erreur lors de la suppression de l'activit\xe9:",o),j.oR.error("Erreur lors de la suppression de l'activit\xe9"),{success:!1,error:o.message}}}),[a]),f=(0,$.useCallback)((e=>{if(!e)return"";const{type:r,entity_type:t,entity_id:o,user_id:s,details:n,user:a}=e,l=a&&a.name?a.name:"Un utilisateur";if("update"===r&&"employee"===t&&n&&n.employeeName)return`${l} a modifi\xe9 l'employ\xe9 ${n.employeeName}`;let i=`${l} ${{create:"a cr\xe9\xe9",update:"a modifi\xe9",delete:"a supprim\xe9",approve:"a approuv\xe9",reject:"a rejet\xe9"}[r]||r} ${{employee:"un employ\xe9",schedule:"un planning",vacation:"une demande de cong\xe9",shift:"un horaire",user:"un utilisateur"}[t]||t}`;return n&&("string"===typeof n?i+=` : ${n}`:"object"===typeof n&&n.employeeName&&"employee"===t&&(i+=` : ${n.employeeName}`)),i}),[]),v=(0,$.useCallback)((e=>{if(!e)return"";const r=new Date(e),t=new Date-r,o=Math.floor(t/1e3),s=Math.floor(o/60),n=Math.floor(s/60),a=Math.floor(n/24);return o<60?"\xe0 l'instant":s<60?`il y a ${s} minute${s>1?"s":""}`:n<24?`il y a ${n} heure${n>1?"s":""}`:a<7?`il y a ${a} jour${a>1?"s":""}`:r.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}),[]),b=(0,$.useCallback)((e=>{switch(e){case"create":return(0,c.jsx)(l.GGD,{});case"update":return(0,c.jsx)(l.SG1,{});case"delete":return(0,c.jsx)(l.IXo,{});case"approve":return(0,c.jsx)(l.YrT,{});case"reject":return(0,c.jsx)(l.yGN,{});default:return null}}),[]);return(0,$.useEffect)((()=>{d&&Array.isArray(d)&&d.length>0&&(console.log("Nouvelles activit\xe9s re\xe7ues via WebSocket:",d),r((e=>{const r=Array.isArray(e)?e:[],t=new Map;return d.forEach((e=>{t.set(e.id,e)})),r.forEach((e=>{t.has(e.id)||t.set(e.id,e)})),Array.from(t.values()).sort(((e,r)=>new Date(r.timestamp)-new Date(e.timestamp)))})),o(!1))}),[d]),(0,$.useEffect)((()=>{h();const e=setInterval((()=>{h()}),12e4);return()=>clearInterval(e)}),[h]),(0,$.useEffect)((()=>{u&&!p?(console.log("WebSocket connect\xe9, on va rafra\xeechir les activit\xe9s"),m()):p&&(console.log("Mode de secours WebSocket actif, utilisation de l'API REST"),h())}),[u,m,p,h]),(0,$.useEffect)((()=>{p&&(console.log("Passage en mode de secours, r\xe9cup\xe9ration des activit\xe9s via API REST"),h())}),[p,h]),{activities:e,loading:t,error:s,fetchActivities:h,createActivity:y,updateActivity:g,deleteActivity:x,getActivityIcon:b,formatActivityDescription:f,formatActivityDate:v}},C=(n.i7`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,n.i7`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`),T=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }
`,I=n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  padding-bottom: 0.75rem;
`,R=n.Ay.h3`
  font-size: 1.2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,z=n.Ay.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: ${e=>{let{theme:r}=e;return r.colors.primaryLight}};
  border: none;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: ${e=>{let{theme:r}=e;return r.colors.primary}}22;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    transition: transform 0.3s ease;
  }

  &:hover svg {
    transform: rotate(180deg);
  }
`,P=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,L=(0,n.Ay)(b.P.div)`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  transition: all 0.3s ease;
  border-left: 3px solid ${e=>{let{color:r}=e;return r}};
  background-color: ${e=>{let{theme:r,color:t}=e;return`${t}08`}};

  &:hover {
    background-color: ${e=>{let{theme:r,color:t}=e;return`${t}15`}};
    transform: translateX(5px);
  }
`,D=n.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.1);
    animation: ${C} 1.5s infinite;
  }
`,B=n.Ay.div`
  flex: 1;
`,M=n.Ay.div`
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.4;
`,F=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,O=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,N=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,q=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  svg {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`,_=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,G=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,H=n.Ay.button`
  display: block;
  width: 100%;
  background-color: transparent;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.primary}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 0.75rem;
  margin-top: 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
    color: white;
  }
`,Y=n.Ay.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{color:r}=e;return r}};
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 0.5rem;
`,U=e=>{switch(e){case"create":return(0,c.jsx)(l.GGD,{});case"update":return(0,c.jsx)(l.SG1,{});case"delete":return(0,c.jsx)(l.IXo,{});case"approve":return(0,c.jsx)(l.YrT,{});case"reject":return(0,c.jsx)(l.yGN,{});default:return(0,c.jsx)(l.S8s,{})}},W=e=>{switch(e){case"create":return"Cr\xe9ation";case"update":return"Modification";case"delete":return"Suppression";case"approve":return"Approbation";case"reject":return"Rejet";case"system":return"Syst\xe8me";default:return"Information"}},J=()=>{const{activities:e,loading:r,error:t,fetchActivities:o,formatActivityDescription:s,formatActivityDate:n}=S(),a=Array.isArray(e)?e:[],i={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:100,damping:10}}};return(0,c.jsxs)(T,{children:[(0,c.jsxs)(I,{children:[(0,c.jsxs)(R,{children:[(0,c.jsx)(l.Ohp,{size:18})," Activit\xe9s r\xe9centes",!r&&a.length>0&&(0,c.jsx)(Y,{color:"#4F46E5",children:a.length})]}),(0,c.jsxs)(z,{onClick:()=>{o(!0)},disabled:r,children:[(0,c.jsx)(l.jTZ,{size:16,className:r?"animate-spin":""}),"Actualiser"]})]}),r?(0,c.jsxs)(q,{children:[(0,c.jsx)(l.jTZ,{size:32}),(0,c.jsx)("div",{children:"Chargement des activit\xe9s..."})]}):t?(0,c.jsxs)(_,{children:[(0,c.jsx)(l.yGN,{size:32}),(0,c.jsx)("div",{children:"Une erreur est survenue lors du chargement des activit\xe9s."})]}):0===a.length?(0,c.jsxs)(G,{children:[(0,c.jsx)(l.S8s,{size:32}),(0,c.jsx)("div",{children:"Aucune activit\xe9 r\xe9cente."})]}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(b.P.div,{variants:{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},initial:"hidden",animate:"visible",children:(0,c.jsx)(P,{children:a.slice(0,5).map(((e,r)=>{const t=(e=>{switch(e){case"create":return"#10B981";case"update":return"#F59E0B";case"delete":return"#EF4444";case"approve":return"#3B82F6";case"reject":return"#EC4899";case"system":return"#8B5CF6";default:return"#4F46E5"}})(e.type),{date:o,time:n}=(e=>{if(!e)return{date:"",time:""};const r=new Date(e);return{date:(0,f.GP)(r,"dd MMMM yyyy",{locale:v.fr}),time:(0,f.GP)(r,"HH:mm:ss",{locale:v.fr})}})(e.timestamp);return(0,c.jsxs)(L,{color:t,variants:i,whileHover:{scale:1.01},children:[(0,c.jsx)(D,{color:t,children:U(e.type)}),(0,c.jsxs)(B,{children:[(0,c.jsxs)(M,{children:[s(e),(0,c.jsx)(Y,{color:t,children:W(e.type)})]}),(0,c.jsxs)(F,{children:[(0,c.jsxs)(O,{children:[(0,c.jsx)(l.Ohp,{size:12})," ",n]}),(0,c.jsxs)(N,{children:[(0,c.jsx)(l.wIk,{size:12})," ",o]})]})]})]},e.id||r)}))})}),a.length>5&&(0,c.jsxs)(H,{children:["Voir toutes les activit\xe9s (",a.length,")"]})]})]})},V=n.Ay.div`
  position: relative;
  width: 100%;
  max-width: ${e=>{let{expanded:r}=e;return r?"600px":"300px"}};
  transition: max-width 0.3s ease;
`,Z=n.Ay.div`
  display: flex;
  align-items: center;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border: 1px solid
    ${e=>{let{theme:r,focused:t}=e;return t?r.colors.primary:r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 0.5rem 1rem;
  box-shadow: ${e=>{let{theme:r,focused:t}=e;return t?`0 0 0 2px ${r.colors.primary}22`:"none"}};
  transition: all 0.2s ease;

  &:hover {
    border-color: ${e=>{let{theme:r,focused:t}=e;return t?r.colors.primary:`${r.colors.primary}88`}};
  }
`,X=n.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`,Q=n.Ay.input`
  flex: 1;
  border: none;
  background: none;
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  outline: none;
  padding: 0.25rem 0;

  &::placeholder {
    color: ${e=>{let{theme:r}=e;return r.colors.text.disabled}};
  }
`,K=n.Ay.button`
  background: none;
  border: none;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  border-radius: 50%;
  display: ${e=>{let{visible:r}=e;return r?"flex":"none"}};
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,ee=n.Ay.button`
  background: none;
  border: none;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  cursor: pointer;
  padding: 0.25rem;
  margin-left: 0.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  transform: ${e=>{let{expanded:r}=e;return r?"rotate(180deg)":"rotate(0)"}};

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,re=n.Ay.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  right: 0;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  max-height: 400px;
  overflow-y: auto;
  z-index: 100;
  display: ${e=>{let{visible:r}=e;return r?"block":"none"}};
`,te=n.Ay.div`
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  }
`,oe=n.Ay.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.semiBold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,se=n.Ay.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,ne=n.Ay.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:r,color:t}=e;return t?`${t}22`:`${r.colors.primary}22`}};
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`,ae=n.Ay.div`
  flex: 1;
`,le=n.Ay.div`
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,ie=n.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,ce=n.Ay.span`
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}33`}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  padding: 0 0.25rem;
  border-radius: 2px;
`,de=n.Ay.div`
  padding: 1.5rem;
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,ue=n.Ay.div`
  padding: 1rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  margin-top: 0.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: ${e=>{let{visible:r}=e;return r?"block":"none"}};
`,me=n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`,pe=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,he=n.Ay.label`
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,ye=n.Ay.select`
  padding: 0.5rem;
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,ge=n.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`,xe=n.Ay.button`
  padding: 0.5rem 1rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  cursor: pointer;
  transition: all 0.2s ease;

  ${e=>{let{primary:r,theme:t}=e;return r?`\n    background-color: ${t.colors.primary};\n    color: white;\n    border: 1px solid ${t.colors.primary};\n    \n    &:hover {\n      background-color: ${t.colors.primary}dd;\n    }\n  `:`\n    background-color: transparent;\n    color: ${t.colors.text.primary};\n    border: 1px solid ${t.colors.border};\n    \n    &:hover {\n      background-color: ${t.colors.background};\n      border-color: ${t.colors.text.secondary};\n    }\n  `}}
`,fe=()=>(0,c.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,c.jsx)("path",{d:"M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),ve=()=>(0,c.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,c.jsx)("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),be=()=>(0,c.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,c.jsx)("path",{d:"M19 9L12 16L5 9",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),$e=e=>{let{placeholder:r="Rechercher...",onSearch:t}=e;const[o,s]=(0,$.useState)(""),[n,a]=(0,$.useState)(!1),[l,i]=(0,$.useState)(!1),[d,u]=(0,$.useState)(!1),[m,p]=(0,$.useState)(!1),[h,y]=(0,$.useState)([]),[g,x]=(0,$.useState)({type:"all",date:"all",status:"all"}),f=(0,$.useRef)(null),v=(0,$.useRef)(null);(0,$.useEffect)((()=>{const e=e=>{f.current&&!f.current.contains(e.target)&&(a(!1),u(!1))};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}}),[]),(0,$.useEffect)((()=>{if(o.length>0){const e=((e,r)=>{if(!e)return[];const t=e.toLowerCase();let o=[{id:1,type:"employee",name:"Sophie Martin",role:"Designer",icon:"\ud83d\udc69\u200d\ud83c\udfa8",color:"#4F46E5"},{id:2,type:"employee",name:"Thomas Dubois",role:"D\xe9veloppeur",icon:"\ud83d\udc68\u200d\ud83d\udcbb",color:"#4F46E5"},{id:3,type:"employee",name:"Julie Lefebvre",role:"Marketing",icon:"\ud83d\udc69\u200d\ud83d\udcbc",color:"#4F46E5"},{id:4,type:"employee",name:"Nicolas Moreau",role:"Comptable",icon:"\ud83d\udc68\u200d\ud83d\udcbc",color:"#4F46E5"}].filter((e=>e.name.toLowerCase().includes(t)||e.role.toLowerCase().includes(t))),s=[{id:1,type:"event",name:"R\xe9union d'\xe9quipe",date:"15 Mars 2023",icon:"\ud83d\udcc5",color:"#10B981"},{id:2,type:"event",name:"Pr\xe9sentation client",date:"22 Mars 2023",icon:"\ud83d\udcca",color:"#10B981"},{id:3,type:"event",name:"Formation Excel",date:"5 Avril 2023",icon:"\ud83d\udcda",color:"#10B981"}].filter((e=>e.name.toLowerCase().includes(t)||e.date.toLowerCase().includes(t))),n=[{id:1,type:"vacation",name:"Cong\xe9s d'\xe9t\xe9",employee:"Sophie Martin",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"},{id:2,type:"vacation",name:"RTT",employee:"Thomas Dubois",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"},{id:3,type:"vacation",name:"Cong\xe9 maladie",employee:"Julie Lefebvre",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"}].filter((e=>e.name.toLowerCase().includes(t)||e.employee.toLowerCase().includes(t)));"all"!==r.type&&("employees"===r.type?(s=[],n=[]):"events"===r.type?(o=[],n=[]):"vacations"===r.type&&(o=[],s=[]));const a=[];return o.length>0&&a.push({title:"Employ\xe9s",items:o}),s.length>0&&a.push({title:"\xc9v\xe9nements",items:s}),n.length>0&&a.push({title:"Cong\xe9s",items:n}),a})(o,g);y(e),u(!0)}else y([]),u(!1)}),[o,g]);const b=e=>{x({...g,[e.target.name]:e.target.value})},j=(e,r)=>{if(!r)return e;return e.split(new RegExp(`(${r})`,"gi")).map(((e,t)=>e.toLowerCase()===r.toLowerCase()?(0,c.jsx)(ce,{children:e},t):e))};return(0,c.jsx)("div",{ref:f,children:(0,c.jsxs)(V,{expanded:l,children:[(0,c.jsxs)(Z,{focused:n,children:[(0,c.jsx)(X,{children:(0,c.jsx)(fe,{})}),(0,c.jsx)(Q,{ref:v,type:"text",placeholder:r,value:o,onChange:e=>{s(e.target.value)},onFocus:()=>{a(!0),o.length>0&&u(!0)}}),(0,c.jsx)(K,{visible:o.length>0,onClick:()=>{s(""),v.current.focus()},"aria-label":"Effacer la recherche",children:(0,c.jsx)(ve,{})}),(0,c.jsx)(ee,{expanded:l,onClick:()=>{i(!l),p(!m)},"aria-label":"Recherche avanc\xe9e",children:(0,c.jsx)(be,{})})]}),(0,c.jsxs)(ue,{visible:m,children:[(0,c.jsxs)(me,{children:[(0,c.jsxs)(pe,{children:[(0,c.jsx)(he,{htmlFor:"type",children:"Type"}),(0,c.jsxs)(ye,{id:"type",name:"type",value:g.type,onChange:b,children:[(0,c.jsx)("option",{value:"all",children:"Tous"}),(0,c.jsx)("option",{value:"employees",children:"Employ\xe9s"}),(0,c.jsx)("option",{value:"events",children:"\xc9v\xe9nements"}),(0,c.jsx)("option",{value:"vacations",children:"Cong\xe9s"})]})]}),(0,c.jsxs)(pe,{children:[(0,c.jsx)(he,{htmlFor:"date",children:"Date"}),(0,c.jsxs)(ye,{id:"date",name:"date",value:g.date,onChange:b,children:[(0,c.jsx)("option",{value:"all",children:"Toutes les dates"}),(0,c.jsx)("option",{value:"today",children:"Aujourd'hui"}),(0,c.jsx)("option",{value:"week",children:"Cette semaine"}),(0,c.jsx)("option",{value:"month",children:"Ce mois"}),(0,c.jsx)("option",{value:"year",children:"Cette ann\xe9e"})]})]}),(0,c.jsxs)(pe,{children:[(0,c.jsx)(he,{htmlFor:"status",children:"Statut"}),(0,c.jsxs)(ye,{id:"status",name:"status",value:g.status,onChange:b,children:[(0,c.jsx)("option",{value:"all",children:"Tous les statuts"}),(0,c.jsx)("option",{value:"active",children:"Actif"}),(0,c.jsx)("option",{value:"pending",children:"En attente"}),(0,c.jsx)("option",{value:"completed",children:"Termin\xe9"})]})]})]}),(0,c.jsxs)(ge,{children:[(0,c.jsx)(xe,{onClick:()=>{x({type:"all",date:"all",status:"all"})},children:"R\xe9initialiser"}),(0,c.jsx)(xe,{primary:!0,children:"Appliquer"})]})]}),(0,c.jsx)(re,{visible:d&&h.length>0,children:h.map(((e,r)=>(0,c.jsxs)(te,{children:[(0,c.jsx)(oe,{children:e.title}),e.items.map(((e,s)=>(0,c.jsxs)(se,{onClick:()=>(e=>{t&&t(e),u(!1)})(e),children:[(0,c.jsx)(ne,{color:e.color,children:e.icon}),(0,c.jsxs)(ae,{children:[(0,c.jsx)(le,{children:j(e.name,o)}),(0,c.jsxs)(ie,{children:["employee"===e.type&&j(e.role,o),"event"===e.type&&j(e.date,o),"vacation"===e.type&&j(e.employee,o)]})]})]},`${r}-${s}`)))]},r)))}),d&&o.length>0&&0===h.length&&(0,c.jsx)(re,{visible:!0,children:(0,c.jsxs)(de,{children:['Aucun r\xe9sultat trouv\xe9 pour "',o,'"']})})]})})},je=n.Ay.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,Ae=n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`,we=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`,Ee=n.Ay.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`,ke=n.Ay.div`
  display: flex;
  flex-direction: column;
`,Se=n.Ay.h1`
  font-size: 1.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
`,Ce=n.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0.5rem 0 0 0;
`,Te=n.Ay.div`
  margin-bottom: 2rem;
`,Ie=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 2rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};

  h1 {
    font-size: 1.5rem;
    color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
    margin: 0 0 1rem 0;
  }

  p {
    color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
    margin: 0;
    line-height: 1.5;
  }
`,Re=n.Ay.div`
  margin-bottom: 2rem;
`,ze=(n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`,n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`,n.Ay.h3`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0;
`,n.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,n.Ay.div`
  font-size: 1.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,n.Ay.div`
  margin-top: 0.75rem;
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,n.Ay.div`
  padding: 0.25rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return`${r.colors.border}44`}};

  &:last-child {
    border-bottom: none;
  }
`,n.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 1rem 0;
`,n.Ay.div`
  text-align: center;
  padding: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  margin-bottom: 2rem;
`,n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,n.Ay.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,n.Ay.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
`,n.Ay.div`
  flex: 1;
`,n.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,n.Ay.div`
  display: flex;
  align-items: center;
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,n.Ay.span`
  display: flex;
  align-items: center;
  margin-right: 1rem;
`,n.Ay.span`
  display: flex;
  align-items: center;
`,n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,()=>{const{user:e}=(0,w.A)();return(0,c.jsxs)(je,{children:[(0,c.jsx)(Ae,{children:(0,c.jsxs)(we,{children:[(0,c.jsx)(Ee,{children:(0,c.jsx)(s(),{animationData:a,loop:!0,style:{width:"100%",height:"100%"}})}),(0,c.jsxs)(ke,{children:[(0,c.jsx)(Se,{children:"Tableau de bord"}),(0,c.jsx)(Ce,{children:"Bienvenue sur votre assistant de planification intelligent"})]})]})}),(0,c.jsx)(Te,{children:(0,c.jsxs)(Ie,{children:[(0,c.jsxs)("h1",{children:["Bonjour, ",e?e.first_name&&e.last_name?`${e.first_name} ${e.last_name}`:e.username||"Utilisateur":"Utilisateur","!"]}),(0,c.jsx)("p",{children:"Bienvenue sur votre tableau de bord. Voici un aper\xe7u de votre activit\xe9 r\xe9cente."})]})}),(0,c.jsx)(Re,{children:(0,c.jsx)($e,{placeholder:"Rechercher un employ\xe9, un \xe9v\xe9nement...",onSearch:e=>{console.log("Recherche:",e)}})}),(0,c.jsx)(x,{}),(0,c.jsx)(J,{})]})})}}]);
//# sourceMappingURL=760.053dc7a1.chunk.js.map