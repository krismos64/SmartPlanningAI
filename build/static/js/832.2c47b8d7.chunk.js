"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[832],{4634:(e,t,r)=>{r.d(t,{A:()=>s});var o=r(5043),a=r(3768),n=r(4583);const s=()=>{const e=(0,o.useCallback)((async e=>{try{const r={};e.headers.forEach(((e,t)=>{r[t]=e})),console.log("R\xe9ponse du serveur:",{url:e.url,status:e.status,statusText:e.statusText,headers:r});const o=e.headers.get("content-type");let n;if(o&&o.includes("application/json"))n=await e.json(),console.log("Donn\xe9es JSON re\xe7ues:",n);else{const r=await e.text();console.warn("R\xe9ponse non-JSON re\xe7ue:",r);try{n=JSON.parse(r),console.log("Texte pars\xe9 comme JSON:",n)}catch(t){n={message:r}}}if(e.ok)return n;{if(401===e.status||403===e.status){console.error("Erreur d'authentification:",n),a.oR.error("Session expir\xe9e ou acc\xe8s non autoris\xe9. Veuillez vous reconnecter.");const t=new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");throw t.status=e.status,t.response={status:e.status,data:n},t}500===e.status&&(console.error("Erreur serveur:",n),console.error("URL:",e.url),console.error("M\xe9thode:",e.method),n.error&&console.error("D\xe9tails de l'erreur:",n.error),n.stack&&console.error("Stack trace:",n.stack));const t=n.message||n.error||e.statusText||"Erreur inconnue",r=new Error(t);throw r.status=e.status,r.response={status:e.status,data:n},r}}catch(r){throw console.error("Erreur lors du traitement de la r\xe9ponse:",r),r}}),[]);return(0,o.useMemo)((()=>{const t=e=>{if("zipCode"===e)return console.log(`Conversion sp\xe9ciale: ${e} -> zip_code`),"zip_code";const t=e.replace(/[A-Z]/g,(e=>`_${e.toLowerCase()}`));return console.log(`Conversion camelCase -> snake_case: ${e} -> ${t}`),t};return{get:async t=>{try{const r=n.H$||"http://localhost:5001";console.log(`[API] GET ${r}${t}`);const o=t.includes("/departments"),a=localStorage.getItem("token"),s={"Content-Type":"application/json",...a&&{Authorization:`Bearer ${a}`}},i=await fetch(`${r}${t}`,{method:"GET",headers:s});if(!o&&!i.ok){const e=await i.json();throw new Error(e.message||`Erreur lors de la requ\xeate GET ${t}`)}const l=await e(i);return o?{ok:i.ok,status:i.status,data:l,headers:i.headers}:l}catch(r){console.error(`[API] GET ${t} Error:`,r);if(t.includes("/departments"))return console.log("Erreur silencieuse pour les d\xe9partements"),{ok:!1,status:r.status||0,data:{message:r.message||"Erreur lors de la requ\xeate GET"},headers:new Headers};throw r}},post:async(r,o)=>{try{if(!o||"object"!==typeof o)throw console.error("Donn\xe9es invalides pour la requ\xeate POST:",o),new Error("Donn\xe9es invalides pour la requ\xeate POST");const a=n.H$||"http://localhost:5001";console.log(`[API] POST ${a}${r}`);const s=localStorage.getItem("token");if(!s)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const i=JSON.parse(JSON.stringify(o));void 0!==i.hourlyRate&&(console.log("Suppression de hourlyRate des donn\xe9es"),delete i.hourlyRate);const l={};for(const e in i)l[t(e)]=i[e];console.log("Donn\xe9es converties en snake_case pour POST:",l);const c={"Content-Type":"application/json",Authorization:`Bearer ${s}`};console.log("D\xe9tails de la requ\xeate POST:",{endpoint:r,dataSize:JSON.stringify(l).length,headers:{...c,Authorization:"Bearer [MASQU\xc9]"}});const d=new AbortController,u=setTimeout((()=>d.abort()),3e4),p=await fetch(`${a}${r}`,{method:"POST",headers:c,body:JSON.stringify(l),signal:d.signal});if(clearTimeout(u),401===p.status||403===p.status)throw console.error("Erreur d'authentification:",p.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");return e(p)}catch(a){if("AbortError"===a.name)throw console.error("La requ\xeate a \xe9t\xe9 interrompue (timeout):",a),new Error("La requ\xeate a pris trop de temps. Veuillez r\xe9essayer.");if(a.message.includes("NetworkError")||a.message.includes("Failed to fetch"))throw console.error("Erreur r\xe9seau lors de la requ\xeate POST:",a),new Error("Probl\xe8me de connexion au serveur, veuillez v\xe9rifier votre connexion internet");throw console.error("Erreur lors de la requ\xeate POST:",a),a}},put:async(r,o)=>{try{const a=n.H$||"http://localhost:5001";console.log(`[API] PUT ${a}${r}`,o);const s=localStorage.getItem("token");if(!s)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const i=JSON.parse(JSON.stringify(o));console.log("Donn\xe9es nettoy\xe9es:",i),void 0!==i.hourlyRate&&(console.log("Suppression de hourlyRate des donn\xe9es"),delete i.hourlyRate);const l={};for(const e in i)l[t(e)]=i[e];console.log("Donn\xe9es converties en snake_case:",l);const c=await fetch(`${a}${r}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${s}`},body:JSON.stringify(l)});if(401===c.status||403===c.status)throw console.error("Erreur d'authentification:",c.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const d=await e(c);return console.log(`[API] PUT ${r} Response:`,d),d}catch(a){return console.error(`[API] PUT ${r} Error:`,a),{ok:!1,status:a.status||0,data:{message:a.message||"Erreur lors de la requ\xeate PUT"},headers:new Headers}}},delete:async t=>{try{const r=n.H$||"http://localhost:5004";console.log(`[API] DELETE ${r}${t}`);const o=localStorage.getItem("token");if(!o)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const a=await fetch(`${r}${t}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`}});if(401===a.status||403===a.status)throw console.error("Erreur d'authentification:",a.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const s=await e(a);return console.log(`[API] DELETE ${t} Response:`,s),s}catch(r){return console.error(`[API] DELETE ${t} Error:`,r),{ok:!1,status:r.status||0,data:{message:r.message||"Erreur lors de la requ\xeate DELETE"},headers:new Headers}}}}}),[e])}},6803:(e,t,r)=>{r.d(t,{A:()=>o});const o=r(7598).A},6946:(e,t,r)=>{r.d(t,{A:()=>v});var o=r(8168),a=r(8587),n=r(5043),s=r(8387),i=r(7518),l=r(8812),c=r(8698),d=r(5527),u=r(579);const p=["className","component"];var m=r(9386),h=r(8279),y=r(3375);const g=(0,h.A)(),f=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const{themeId:t,defaultTheme:r,defaultClassName:m="MuiBox-root",generateClassName:h}=e,y=(0,i.Ay)("div",{shouldForwardProp:e=>"theme"!==e&&"sx"!==e&&"as"!==e})(l.A);return n.forwardRef((function(e,n){const i=(0,d.A)(r),l=(0,c.A)(e),{className:g,component:f="div"}=l,v=(0,a.A)(l,p);return(0,u.jsx)(y,(0,o.A)({as:f,ref:n,className:(0,s.A)(g,h?h(m):m),theme:t&&i[t]||i},v))}))}({themeId:y.A,defaultTheme:g,defaultClassName:"MuiBox-root",generateClassName:m.A.generate}),v=f},7013:(e,t,r)=>{r.d(t,{A:()=>u});var o=r(5043),a=r(3768),n=r(5200),s=r(4583),i=r(5016),l=r(4634),c=r(2693),d=r(579);const u=()=>{const[e,t]=(0,o.useState)([]),[r,u]=(0,o.useState)(!0),[p,m]=(0,o.useState)(null),h=(0,l.A)(),{user:y}=(0,i.A)(),{activities:g,socket:f,requestActivitiesUpdate:v,fallbackMode:x}=(0,c.A)(),b=(0,o.useCallback)((async function(){try{u(!0);const e=await h.get(s.Sn.ACTIVITIES.BASE);if(!e||!Array.isArray(e)&&!e.data)throw new Error("Erreur lors du chargement des activit\xe9s: format de r\xe9ponse invalide");{const r=Array.isArray(e)?e:Array.isArray(e.data)?e.data:[];t(r),m(null)}}catch(e){console.error("Erreur lors du chargement des activit\xe9s:",e),m("Erreur lors du chargement des activit\xe9s"),a.oR.error("Erreur lors du chargement des activit\xe9s"),t([])}finally{u(!1)}}),[h]),$=(0,o.useCallback)((async e=>{try{const o=await h.post(s.Sn.ACTIVITIES.BASE,e);if(o.ok)return t((e=>[...e,o.data])),a.oR.success("Activit\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,activity:o.data};var r;throw new Error((null===(r=o.data)||void 0===r?void 0:r.message)||"Erreur lors de la cr\xe9ation de l'activit\xe9")}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'activit\xe9:",o),a.oR.error("Erreur lors de la cr\xe9ation de l'activit\xe9"),{success:!1,error:o.message}}}),[h]),A=(0,o.useCallback)((async(e,r)=>{try{const n=await h.put(`${s.Sn.ACTIVITIES.BASE}/${e}`,r);if(n.ok)return t((t=>t.map((t=>t.id===e?{...t,...n.data}:t)))),a.oR.success("Activit\xe9 mise \xe0 jour avec succ\xe8s"),{success:!0,activity:n.data};var o;throw new Error((null===(o=n.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'activit\xe9")}catch(n){return console.error("Erreur lors de la mise \xe0 jour de l'activit\xe9:",n),a.oR.error("Erreur lors de la mise \xe0 jour de l'activit\xe9"),{success:!1,error:n.message}}}),[h]),j=(0,o.useCallback)((async e=>{try{const o=await h.delete(`${s.Sn.ACTIVITIES.BASE}/${e}`);if(o.ok)return t((t=>t.filter((t=>t.id!==e)))),a.oR.success("Activit\xe9 supprim\xe9e avec succ\xe8s"),{success:!0};var r;throw new Error((null===(r=o.data)||void 0===r?void 0:r.message)||"Erreur lors de la suppression de l'activit\xe9")}catch(o){return console.error("Erreur lors de la suppression de l'activit\xe9:",o),a.oR.error("Erreur lors de la suppression de l'activit\xe9"),{success:!1,error:o.message}}}),[h]),w=(0,o.useCallback)((e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}}),[]),E=(0,o.useCallback)((e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}}),[]),S=(0,o.useCallback)(((e,t)=>{if(!e||!t)return"";const r=new Date(e),o=new Date(t);return`du ${r.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})} au ${o.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}`}),[]),T=(0,o.useCallback)((e=>{if(!e)return"";if(e.description)return e.description;const{type:t,entity_type:r,entity_id:o,user_id:a,details:n,user:s}=e,i=s&&s.name?s.name:"Un utilisateur";let l=`${i} ${{create:"a cr\xe9\xe9",update:"a modifi\xe9",delete:"a supprim\xe9",approve:"a approuv\xe9",reject:"a rejet\xe9",vacation_status_update:"a mis \xe0 jour le statut de"}[t]||t} ${{employee:"un employ\xe9",schedule:"un planning",vacation:"une demande de cong\xe9",shift:"un horaire",user:"un utilisateur"}[r]||r}`;if(n){let e;try{e="string"===typeof n?JSON.parse(n):n}catch(c){e=n}if("vacation"===r){if("create"===t&&e.employee_name&&e.start_date&&e.end_date){const t=e.employee_name;return`${i} a cr\xe9\xe9 une demande de cong\xe9 ${w(e.type)} pour ${t} ${S(e.start_date,e.end_date)}`}if("vacation_status_update"===t&&e.new_status){const t=e.new_status,r=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,a=e.start_date&&e.end_date?S(e.start_date,e.end_date):"",n=e.vacation_type?w(e.vacation_type):"";return`${i} a ${E(t)} la demande de cong\xe9${n?" "+n:""} de ${r}${a?" "+a:""}`}if("update"===t){const t=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,r=e.start_date&&e.end_date?S(e.start_date,e.end_date):"",a=e.vacation_type?w(e.vacation_type):"";return`${i} a modifi\xe9 la demande de cong\xe9${a?" "+a:""} de ${t}${r?" "+r:""}`}if("delete"===t){const t=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,r=e.start_date&&e.end_date?S(e.start_date,e.end_date):"",a=e.vacation_type?w(e.vacation_type):"";return`${i} a supprim\xe9 la demande de cong\xe9${a?" "+a:""} de ${t}${r?" "+r:""}`}}if("employee"===r&&e.action&&("Ajout d'heures"===e.action||"Soustraction d'heures"===e.action)){const t=e.employeeName||`Employ\xe9 #${o}`,r=e.hours||"?";return`${i} a ${"Ajout d'heures"===e.action?"ajout\xe9":"soustrait"} ${r}h au solde d'heures de ${t}`}"string"===typeof e?l+=` : ${e}`:"object"===typeof e&&e.employeeName&&"employee"===r&&(l+=` : ${e.employeeName}`)}return l}),[S,w,E]),k=(0,o.useCallback)((e=>{if(!e)return"";const t=new Date(e),r=new Date-t,o=Math.floor(r/1e3),a=Math.floor(o/60),n=Math.floor(a/60),s=Math.floor(n/24);return o<60?"\xe0 l'instant":a<60?`il y a ${a} minute${a>1?"s":""}`:n<24?`il y a ${n} heure${n>1?"s":""}`:s<7?`il y a ${s} jour${s>1?"s":""}`:t.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}),[]),_=(0,o.useCallback)((e=>{switch(e){case"create":return(0,d.jsx)(n.GGD,{});case"update":return(0,d.jsx)(n.SG1,{});case"delete":return(0,d.jsx)(n.IXo,{});case"approve":return(0,d.jsx)(n.YrT,{});case"reject":return(0,d.jsx)(n.yGN,{});default:return null}}),[]);return(0,o.useEffect)((()=>{g&&Array.isArray(g)&&g.length>0&&(console.log("Nouvelles activit\xe9s re\xe7ues via WebSocket:",g),t((e=>{const t=Array.isArray(e)?e:[],r=new Map;return g.forEach((e=>{r.set(e.id,e)})),t.forEach((e=>{r.has(e.id)||r.set(e.id,e)})),Array.from(r.values()).sort(((e,t)=>new Date(t.timestamp)-new Date(e.timestamp)))})),u(!1))}),[g]),(0,o.useEffect)((()=>{b();const e=setInterval((()=>{b()}),12e4);return()=>clearInterval(e)}),[b]),(0,o.useEffect)((()=>{f&&!x?(console.log("WebSocket connect\xe9, on va rafra\xeechir les activit\xe9s"),v()):x&&(console.log("Mode de secours WebSocket actif, utilisation de l'API REST"),b())}),[f,v,x,b]),(0,o.useEffect)((()=>{x&&(console.log("Passage en mode de secours, r\xe9cup\xe9ration des activit\xe9s via API REST"),b())}),[x,b]),{activities:e,loading:r,error:p,fetchActivities:b,createActivity:$,updateActivity:A,deleteActivity:j,getActivityIcon:_,formatActivityDescription:T,formatActivityDate:k,formatVacationDates:S,translateVacationType:w,translateVacationStatus:E}}},7832:(e,t,r)=>{r.r(t),r.d(t,{default:()=>Z});var o=r(9662),a=r(579);const n=(0,o.A)((0,a.jsx)("path",{d:"M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9m-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8z"}),"History");var s=r(6946),i=r(4794),l=r(6226),c=r(5043),d=r(5200),u=r(1529),p=r(3681),m=r(7013);const h=(e,t)=>{if("vacation"===t)return"#6366F1";switch(e){case"create":return"#10B981";case"update":return"#F59E0B";case"delete":return"#EF4444";case"approve":return"#3B82F6";case"reject":return"#EC4899";case"system":return"#8B5CF6";case"vacation_status_update":return"#6366F1";default:return"#4F46E5"}},y=(e,t)=>{if("vacation"===t)return(0,a.jsx)(d.Wh$,{});switch(e){case"create":return(0,a.jsx)(d.GGD,{});case"update":return(0,a.jsx)(d.SG1,{});case"delete":return(0,a.jsx)(d.IXo,{});case"approve":return(0,a.jsx)(d.YrT,{});case"reject":return(0,a.jsx)(d.yGN,{});case"system":default:return(0,a.jsx)(d.S8s,{});case"vacation_status_update":return(0,a.jsx)(d.Wh$,{})}},g=e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}},f=(e,t,r)=>{if("vacation"===t){let t="";switch(r&&"object"===typeof r&&(r.type?t=g(r.type):r.vacation_type&&(t=g(r.vacation_type))),e){case"create":return"Nouvelle demande"+(t?" "+t:"");case"update":return"Modification cong\xe9"+(t?" "+t:"");case"delete":return"Suppression cong\xe9"+(t?" "+t:"");case"approve":return"Approbation cong\xe9"+(t?" "+t:"");case"reject":return"Rejet cong\xe9"+(t?" "+t:"");case"vacation_status_update":let e="";return r&&"object"===typeof r&&r.new_status&&(e=(e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}})(r.new_status)),`Cong\xe9 ${e}${t?" "+t:""}`;default:return"Cong\xe9"+(t?" "+t:"")}}switch(e){case"create":return"Cr\xe9ation";case"update":return"Modification";case"delete":return"Suppression";case"approve":return"Approbation";case"reject":return"Rejet";case"system":return"Syst\xe8me";case"vacation_status_update":return"Mise \xe0 jour statut";default:return"Information"}};var v=r(1734);const x=(0,u.Ay)(s.A)((e=>{let{theme:t}=e;const{theme:r}=(0,p.D)(),o="dark"===r;return{display:"flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",borderRadius:"50%",background:o?`linear-gradient(135deg, ${(0,i.X4)("#8B5CF6",.2)}, ${(0,i.X4)("#6366F1",.4)})`:`linear-gradient(135deg, ${(0,i.X4)("#8B5CF6",.1)}, ${(0,i.X4)("#6366F1",.3)})`,boxShadow:o?`0 4px 20px ${(0,i.X4)("#000",.25)}`:`0 4px 15px ${(0,i.X4)("#000",.08)}`,color:o?"#C4B5FD":"#6366F1",flexShrink:0,transition:"all 0.3s ease","& .MuiSvgIcon-root":{fontSize:40}}})),b=u.Ay.div`
  padding: 2rem;
`,$=(u.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`,u.Ay.h1`
  font-size: 1.8rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  margin: 0;
`),A=u.Ay.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`,j=u.Ay.div`
  position: relative;
  flex: 1;
  min-width: 250px;

  input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
    border: 1px solid ${e=>{let{theme:t}=e;return t.colors.border}};
    background-color: ${e=>{let{theme:t}=e;return t.colors.background}};
    color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
    font-size: 0.9rem;

    &:focus {
      outline: none;
      border-color: ${e=>{let{theme:t}=e;return t.colors.primary}};
      box-shadow: 0 0 0 2px ${e=>{let{theme:t}=e;return t.colors.primaryLight}};
    }
  }

  svg {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
  }
`,w=u.Ay.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
  border: 1px solid
    ${e=>{let{theme:t,active:r}=e;return r?t.colors.primary:t.colors.border}};
  background-color: ${e=>{let{theme:t,active:r}=e;return r?t.colors.primaryLight:t.colors.background}};
  color: ${e=>{let{theme:t,active:r}=e;return r?t.colors.primary:t.colors.text.primary}};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:t}=e;return t.colors.backgroundAlt}};
    border-color: ${e=>{let{theme:t}=e;return t.colors.primary}};
  }
`,E=u.Ay.div`
  position: relative;
`,S=(0,u.Ay)(w)`
  min-width: 150px;
  justify-content: space-between;
`,T=u.Ay.div`
  position: absolute;
  top: calc(100% + 0.5rem);
  left: 0;
  width: 200px;
  background-color: ${e=>{let{theme:t}=e;return t.colors.surface}};
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:t}=e;return t.shadows.medium}};
  z-index: 10;
  overflow: hidden;
  border: 1px solid ${e=>{let{theme:t}=e;return t.colors.border}};
`,k=u.Ay.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:t}=e;return t.colors.backgroundAlt}};
  }

  svg {
    color: ${e=>{let{theme:t,selected:r}=e;return r?t.colors.primary:"transparent"}};
  }
`,_=u.Ay.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`,C=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background-color: ${e=>{let{theme:t,color:r}=e;return r?`${r}15`:t.colors.primaryLight}};
  border: 1px solid ${e=>{let{theme:t,color:r}=e;return r||t.colors.primary}};
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.small}};
  font-size: 0.8rem;

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
    padding: 0;
    margin-left: 0.25rem;

    &:hover {
      color: ${e=>{let{theme:t}=e;return t.colors.error}};
    }
  }
`,z=u.Ay.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`,R=u.Ay.input`
  padding: 0.75rem 1rem;
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
  border: 1px solid ${e=>{let{theme:t}=e;return t.colors.border}};
  background-color: ${e=>{let{theme:t}=e;return t.colors.background}};
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  font-size: 0.9rem;
  width: 150px;

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:t}=e;return t.colors.primary}};
    box-shadow: 0 0 0 2px ${e=>{let{theme:t}=e;return t.colors.primaryLight}};
  }
`,D=(u.Ay.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
  border: none;
  background-color: ${e=>{let{theme:t}=e;return t.colors.primaryLight}};
  color: ${e=>{let{theme:t}=e;return t.colors.primary}};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:t}=e;return t.colors.primary}}22;
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
`,u.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`),I=(0,u.Ay)(l.P.div)`
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.medium}};
  transition: all 0.3s ease;
  border-left: 3px solid ${e=>{let{color:t}=e;return t}};
  background-color: ${e=>{let{theme:t,color:r}=e;return`${r}08`}};
  box-shadow: ${e=>{let{theme:t}=e;return t.shadows.small}};

  &:hover {
    background-color: ${e=>{let{theme:t,color:r}=e;return`${r}15`}};
    transform: translateX(5px);
    box-shadow: ${e=>{let{theme:t}=e;return t.shadows.medium}};
  }
`,N=u.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:t}=e;return`${t}22`}};
  color: ${e=>{let{color:t}=e;return t}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  margin-right: 1rem;
  flex-shrink: 0;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
`,P=u.Ay.div`
  flex: 1;
`,F=u.Ay.div`
  font-size: 0.9rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.4;
`,M=u.Ay.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{color:t}=e;return t}};
  color: white;
  border-radius: 12px;
  padding: 0.25rem 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  margin-left: 0.5rem;
`,B=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
`,O=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,L=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,V=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: ${e=>{let{theme:t}=e;return t.colors.primary}};
`,G=u.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
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
`,q=u.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:t}=e;return t.colors.error}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,J=u.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,H=u.Ay.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`,X=u.Ay.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: ${e=>{let{theme:t}=e;return t.borderRadius.small}};
  border: 1px solid
    ${e=>{let{theme:t,active:r}=e;return r?t.colors.primary:t.colors.border}};
  background-color: ${e=>{let{theme:t,active:r}=e;return r?t.colors.primaryLight:t.colors.background}};
  color: ${e=>{let{theme:t,active:r}=e;return r?t.colors.primary:t.colors.text.primary}};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:t}=e;return t.colors.primaryLight}};
    border-color: ${e=>{let{theme:t}=e;return t.colors.primary}};
    color: ${e=>{let{theme:t}=e;return t.colors.primary}};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    background-color: ${e=>{let{theme:t}=e;return t.colors.background}};
    border-color: ${e=>{let{theme:t}=e;return t.colors.border}};
    color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
  }
`,U=e=>{if(!e||!e.details)return{};let t=e.details;if("string"===typeof t)try{t=JSON.parse(t)}catch(r){return{}}return{employeeName:t.employee_name||"",employeeId:t.employee_id||"",vacationType:t.type||t.vacation_type||"",startDate:t.start_date||"",endDate:t.end_date||"",status:t.status||t.new_status||"",previousStatus:t.previous_status||""}},W=[{id:"create",label:"Cr\xe9ation",icon:(0,a.jsx)(d.GGD,{})},{id:"update",label:"Modification",icon:(0,a.jsx)(d.SG1,{})},{id:"delete",label:"Suppression",icon:(0,a.jsx)(d.IXo,{})},{id:"approve",label:"Approbation",icon:(0,a.jsx)(d.YrT,{})},{id:"reject",label:"Rejet",icon:(0,a.jsx)(d.yGN,{})},{id:"vacation_status_update",label:"Mise \xe0 jour statut",icon:(0,a.jsx)(d.Wh$,{})}],Y=[{id:"vacation",label:"Cong\xe9s",icon:(0,a.jsx)(d.Wh$,{})},{id:"employee",label:"Employ\xe9s",icon:(0,a.jsx)(d.JXP,{})},{id:"schedule",label:"Planning",icon:(0,a.jsx)(d.wIk,{})}],K=[{id:"paid",label:"Cong\xe9 pay\xe9"},{id:"unpaid",label:"Cong\xe9 non pay\xe9"},{id:"sick",label:"Cong\xe9 maladie"},{id:"other",label:"Autre cong\xe9"}],Z=()=>{const[e,t]=(0,c.useState)(""),[r,o]=(0,c.useState)(1),[i]=(0,c.useState)(10),[u,p]=(0,c.useState)({activityTypes:[],entityTypes:[],vacationTypes:[],dateRange:{startDate:"",endDate:""}}),[g,w]=(0,c.useState)(null),{activities:Z,loading:Q,error:ee,fetchActivities:te,formatActivityDescription:re}=(0,m.A)(),oe=e=>{w(g===e?null:e)},ae=(e,t)=>{p((r=>{const o=[...r[e]],a=o.indexOf(t);return-1===a?o.push(t):o.splice(a,1),{...r,[e]:o}})),o(1)},ne=(e,t)=>{p((r=>({...r,dateRange:{...r.dateRange,[e]:t}}))),o(1)},se=Array.isArray(Z)?Z.filter((t=>{const r=re(t).toLowerCase().includes(e.toLowerCase()),o=0===u.activityTypes.length||u.activityTypes.includes(t.type),a=0===u.entityTypes.length||u.entityTypes.includes(t.entity_type);let n=!0;if("vacation"===t.entity_type&&u.vacationTypes.length>0){const e=U(t);n=u.vacationTypes.includes(e.vacationType)}let s=!0;if(u.dateRange.startDate||u.dateRange.endDate){const e=new Date(t.timestamp);if(u.dateRange.startDate){const t=new Date(u.dateRange.startDate);t.setHours(0,0,0,0),s=s&&e>=t}if(u.dateRange.endDate){const t=new Date(u.dateRange.endDate);t.setHours(23,59,59,999),s=s&&e<=t}}return r&&o&&a&&n&&s})):[],ie=r*i,le=ie-i,ce=se.slice(le,ie),de=Math.ceil(se.length/i),ue=[];for(let a=1;a<=de;a++)ue.push(a);const pe={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:100,damping:10}}},me=()=>{const e=[];return u.activityTypes.forEach((t=>{const r=W.find((e=>e.id===t));r&&e.push({type:"activityTypes",id:t,label:r.label,color:h(t,null)})})),u.entityTypes.forEach((t=>{const r=Y.find((e=>e.id===t));r&&e.push({type:"entityTypes",id:t,label:r.label,color:"vacation"===t?"#6366F1":"#4F46E5"})})),u.vacationTypes.forEach((t=>{const r=K.find((e=>e.id===t));r&&e.push({type:"vacationTypes",id:t,label:r.label,color:"#6366F1"})})),e};return(0,a.jsxs)(b,{children:[(0,a.jsx)(s.A,{component:"div",sx:{mb:4,display:"flex",flexDirection:"column"},children:(0,a.jsxs)(s.A,{component:"div",sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[(0,a.jsxs)(s.A,{component:"div",sx:{display:"flex",alignItems:"center"},children:[(0,a.jsx)(x,{children:(0,a.jsx)(n,{})}),(0,a.jsxs)(s.A,{component:"div",sx:{ml:2},children:[(0,a.jsx)($,{children:"Historique des activit\xe9s"}),(0,a.jsx)("span",{style:{color:"#777",fontSize:"1rem"},children:"Suivez toutes les activit\xe9s et les changements r\xe9cents"})]})]}),(0,a.jsxs)("button",{onClick:()=>{te(!0)},style:{display:"flex",alignItems:"center",gap:"0.5rem",padding:"0.75rem 1rem",borderRadius:"0.375rem",border:"none",backgroundColor:"#EEF2FF",color:"#4F46E5",cursor:"pointer",transition:"all 0.2s ease"},children:[(0,a.jsx)(d.jTZ,{size:16}),"Actualiser"]})]})}),(0,a.jsxs)(A,{children:[(0,a.jsxs)(j,{children:[(0,a.jsx)(d.CKj,{size:16}),(0,a.jsx)("input",{type:"text",placeholder:"Rechercher dans les activit\xe9s...",value:e,onChange:e=>t(e.target.value)})]}),(0,a.jsxs)(E,{children:[(0,a.jsxs)(S,{onClick:()=>oe("activityTypes"),active:u.activityTypes.length>0,children:["Type d'activit\xe9",(0,a.jsx)(d.fK4,{size:16})]}),"activityTypes"===g&&(0,a.jsx)(T,{children:W.map((e=>(0,a.jsxs)(k,{onClick:()=>ae("activityTypes",e.id),selected:u.activityTypes.includes(e.id),children:[(0,a.jsx)(d.YrT,{size:16}),e.icon," ",e.label]},e.id)))})]}),(0,a.jsxs)(E,{children:[(0,a.jsxs)(S,{onClick:()=>oe("entityTypes"),active:u.entityTypes.length>0,children:["Type d'entit\xe9",(0,a.jsx)(d.fK4,{size:16})]}),"entityTypes"===g&&(0,a.jsx)(T,{children:Y.map((e=>(0,a.jsxs)(k,{onClick:()=>ae("entityTypes",e.id),selected:u.entityTypes.includes(e.id),children:[(0,a.jsx)(d.YrT,{size:16}),e.icon," ",e.label]},e.id)))})]}),(0,a.jsxs)(E,{children:[(0,a.jsxs)(S,{onClick:()=>oe("vacationTypes"),active:u.vacationTypes.length>0,children:["Type de cong\xe9",(0,a.jsx)(d.fK4,{size:16})]}),"vacationTypes"===g&&(0,a.jsx)(T,{children:K.map((e=>(0,a.jsxs)(k,{onClick:()=>ae("vacationTypes",e.id),selected:u.vacationTypes.includes(e.id),children:[(0,a.jsx)(d.YrT,{size:16}),e.label]},e.id)))})]}),(0,a.jsxs)(z,{children:[(0,a.jsx)(R,{type:"date",placeholder:"Date de d\xe9but",value:u.dateRange.startDate,onChange:e=>ne("startDate",e.target.value)}),(0,a.jsx)("span",{children:"-"}),(0,a.jsx)(R,{type:"date",placeholder:"Date de fin",value:u.dateRange.endDate,onChange:e=>ne("endDate",e.target.value)})]})]}),me().length>0&&(0,a.jsx)(_,{children:me().map((e=>(0,a.jsxs)(C,{color:e.color,children:[e.label,(0,a.jsx)("button",{onClick:()=>{return t=e.type,r=e.id,void p((e=>{const o=[...e[t]],a=o.indexOf(r);return-1!==a&&o.splice(a,1),{...e,[t]:o}}));var t,r},children:(0,a.jsx)(d.yGN,{size:14})})]},`${e.type}-${e.id}`)))}),Q?(0,a.jsxs)(G,{children:[(0,a.jsx)(d.jTZ,{size:32}),(0,a.jsx)("div",{children:"Chargement des activit\xe9s..."})]}):ee?(0,a.jsx)(q,{children:(0,a.jsx)("div",{children:"Une erreur est survenue lors du chargement des activit\xe9s."})}):0===se.length?(0,a.jsx)(J,{children:(0,a.jsx)("div",{children:"Aucune activit\xe9 trouv\xe9e."})}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(l.P.div,{variants:{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},initial:"hidden",animate:"visible",children:(0,a.jsx)(D,{children:ce.map(((e,t)=>{const r=h(e.type,e.entity_type),{date:o,time:n}=(0,v.r6)(e.timestamp),s=U(e);return(0,a.jsxs)(I,{color:r,variants:pe,whileHover:{scale:1.01},children:[(0,a.jsx)(N,{color:r,children:y(e.type,e.entity_type)}),(0,a.jsxs)(P,{children:[(0,a.jsxs)(F,{children:[re(e),(0,a.jsx)(M,{color:r,children:f(e.type,e.entity_type,e.details)})]}),(0,a.jsxs)(B,{children:[(0,a.jsxs)(O,{children:[(0,a.jsx)(d.Ohp,{size:12})," ",n]}),(0,a.jsxs)(L,{children:[(0,a.jsx)(d.wIk,{size:12})," ",o]}),"vacation"===e.entity_type&&s.employeeName&&(0,a.jsxs)(V,{children:[(0,a.jsx)(d.JXP,{size:12})," ",s.employeeName]})]})]})]},e.id||t)}))})}),de>1&&(0,a.jsxs)(H,{children:[(0,a.jsx)(X,{onClick:()=>o((e=>Math.max(e-1,1))),disabled:1===r,children:"<"}),ue.map((e=>(0,a.jsx)(X,{active:r===e,onClick:()=>o(e),children:e},e))),(0,a.jsx)(X,{onClick:()=>o((e=>Math.min(e+1,de))),disabled:r===de,children:">"})]})]})]})}},8387:(e,t,r)=>{function o(e){var t,r,a="";if("string"==typeof e||"number"==typeof e)a+=e;else if("object"==typeof e)if(Array.isArray(e)){var n=e.length;for(t=0;t<n;t++)e[t]&&(r=o(e[t]))&&(a&&(a+=" "),a+=r)}else for(r in e)e[r]&&(a&&(a+=" "),a+=r);return a}r.d(t,{A:()=>a});const a=function(){for(var e,t,r=0,a="",n=arguments.length;r<n;r++)(e=arguments[r])&&(t=o(e))&&(a&&(a+=" "),a+=t);return a}},8698:(e,t,r)=>{r.d(t,{A:()=>c});var o=r(8168),a=r(8587),n=r(9172),s=r(7758);const i=["sx"],l=e=>{var t,r;const o={systemProps:{},otherProps:{}},a=null!=(t=null==e||null==(r=e.theme)?void 0:r.unstable_sxConfig)?t:s.A;return Object.keys(e).forEach((t=>{a[t]?o.systemProps[t]=e[t]:o.otherProps[t]=e[t]})),o};function c(e){const{sx:t}=e,r=(0,a.A)(e,i),{systemProps:s,otherProps:c}=l(r);let d;return d=Array.isArray(t)?[s,...t]:"function"===typeof t?function(){const e=t(...arguments);return(0,n.Q)(e)?(0,o.A)({},s,e):s}:(0,o.A)({},s,t),(0,o.A)({},c,{sx:d})}},9662:(e,t,r)=>{r.d(t,{A:()=>x});var o=r(8168),a=r(5043),n=r(8587),s=r(8795),i=r(8610),l=r(6803),c=r(2876),d=r(4535),u=r(2532),p=r(2372);function m(e){return(0,p.Ay)("MuiSvgIcon",e)}(0,u.A)("MuiSvgIcon",["root","colorPrimary","colorSecondary","colorAction","colorError","colorDisabled","fontSizeInherit","fontSizeSmall","fontSizeMedium","fontSizeLarge"]);var h=r(579);const y=["children","className","color","component","fontSize","htmlColor","inheritViewBox","titleAccess","viewBox"],g=(0,d.Ay)("svg",{name:"MuiSvgIcon",slot:"Root",overridesResolver:(e,t)=>{const{ownerState:r}=e;return[t.root,"inherit"!==r.color&&t[`color${(0,l.A)(r.color)}`],t[`fontSize${(0,l.A)(r.fontSize)}`]]}})((e=>{let{theme:t,ownerState:r}=e;var o,a,n,s,i,l,c,d,u,p,m,h,y,g,f,v,x;return{userSelect:"none",width:"1em",height:"1em",display:"inline-block",fill:"currentColor",flexShrink:0,transition:null==(o=t.transitions)||null==(a=o.create)?void 0:a.call(o,"fill",{duration:null==(n=t.transitions)||null==(s=n.duration)?void 0:s.shorter}),fontSize:{inherit:"inherit",small:(null==(i=t.typography)||null==(l=i.pxToRem)?void 0:l.call(i,20))||"1.25rem",medium:(null==(c=t.typography)||null==(d=c.pxToRem)?void 0:d.call(c,24))||"1.5rem",large:(null==(u=t.typography)||null==(p=u.pxToRem)?void 0:p.call(u,35))||"2.1875rem"}[r.fontSize],color:null!=(m=null==(h=(t.vars||t).palette)||null==(y=h[r.color])?void 0:y.main)?m:{action:null==(g=(t.vars||t).palette)||null==(f=g.action)?void 0:f.active,disabled:null==(v=(t.vars||t).palette)||null==(x=v.action)?void 0:x.disabled,inherit:void 0}[r.color]}})),f=a.forwardRef((function(e,t){const r=(0,c.A)({props:e,name:"MuiSvgIcon"}),{children:a,className:d,color:u="inherit",component:p="svg",fontSize:f="medium",htmlColor:v,inheritViewBox:x=!1,titleAccess:b,viewBox:$="0 0 24 24"}=r,A=(0,n.A)(r,y),j=(0,o.A)({},r,{color:u,component:p,fontSize:f,instanceFontSize:e.fontSize,inheritViewBox:x,viewBox:$}),w={};x||(w.viewBox=$);const E=(e=>{const{color:t,fontSize:r,classes:o}=e,a={root:["root","inherit"!==t&&`color${(0,l.A)(t)}`,`fontSize${(0,l.A)(r)}`]};return(0,i.A)(a,m,o)})(j);return(0,h.jsxs)(g,(0,o.A)({as:p,className:(0,s.A)(E.root,d),focusable:"false",color:v,"aria-hidden":!b||void 0,role:b?"img":void 0,ref:t},w,A,{ownerState:j,children:[a,b?(0,h.jsx)("title",{children:b}):null]}))}));f.muiName="SvgIcon";const v=f;function x(e,t){function r(r,a){return(0,h.jsx)(v,(0,o.A)({"data-testid":`${t}Icon`,ref:a},r,{children:e}))}return r.muiName=v.muiName,a.memo(a.forwardRef(r))}}}]);
//# sourceMappingURL=832.2c47b8d7.chunk.js.map