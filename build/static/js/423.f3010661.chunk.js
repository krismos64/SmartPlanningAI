"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[423],{290:(e,r,t)=>{t.d(r,{A:()=>i});var o=t(5043),n=t(3768),a=t(4583),s=t(4634);const i=()=>{const[e,r]=(0,o.useState)([]),[t,i]=(0,o.useState)(!0),[l,c]=(0,o.useState)(null),d=(0,s.A)(),u=(0,o.useRef)(!0),m=(0,o.useRef)(null);(0,o.useEffect)((()=>(u.current=!0,()=>{u.current=!1,m.current&&(clearInterval(m.current),m.current=null)})),[]);const p=(0,o.useCallback)((async function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1e3,o=null,n=0;for(;n<r;)try{return await e()}catch(a){if(o=a,n++,n<r){const e=t*Math.pow(2,n-1);console.log(`Tentative ${n}/${r} \xe9chou\xe9e, nouvelle tentative dans ${e}ms`),await new Promise((r=>setTimeout(r,e)))}}throw o}),[]),h=(0,o.useCallback)((async function(){let e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!u.current)return;let t=0;const o=localStorage.getItem("cachedVacations"),n=localStorage.getItem("cachedVacationsTimestamp");if(!e&&o&&n){if((new Date).getTime()-parseInt(n)<3e5)try{const e=JSON.parse(o);return console.log("Utilisation des donn\xe9es en cache pour les cong\xe9s"),void(u.current&&(r(e),i(!1)))}catch(l){console.error("Erreur lors de la lecture du cache:",l)}}const s=async()=>{if(t>=2||!u.current)u.current&&(c("Erreur lors du chargement des cong\xe9s apr\xe8s plusieurs tentatives"),i(!1));else try{console.log("Chargement des cong\xe9s...");if(!localStorage.getItem("token"))return console.error("Token d'authentification manquant"),void(u.current&&(c("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),i(!1)));const e=await d.get(a.Sn.VACATIONS);if(console.log("Donn\xe9es des cong\xe9s re\xe7ues:",e),!u.current)return;if(Array.isArray(e)){const t=e.map((e=>{const r=e.start_date||e.startDate,t=e.end_date||e.endDate;let o="-";if(r&&t){const e=new Date(r),n=new Date(t);e.setHours(0,0,0,0),n.setHours(0,0,0,0);let a=0;const s=new Date(e);for(;s<=n;)0!==s.getDay()&&a++,s.setDate(s.getDate()+1);o=`${a} jour${a>1?"s":""} ouvrable${a>1?"s":""}`}return{...e,employeeName:e.employee_name||e.employeeName||"Employ\xe9 inconnu",startDate:r,endDate:t,duration:o,employeeId:e.employee_id||e.employeeId,approvedAt:e.approved_at||e.approvedAt,approvedBy:e.approved_by||e.approvedBy,rejectedAt:e.rejected_at||e.rejectedAt,rejectedBy:e.rejected_by||e.rejectedBy,rejectionReason:e.rejection_reason||e.rejectionReason,createdAt:e.created_at||e.createdAt,updatedAt:e.updated_at||e.updatedAt}}));console.log("Donn\xe9es des cong\xe9s format\xe9es:",t),u.current&&(r(t),c(null));try{localStorage.setItem("cachedVacations",JSON.stringify(t)),localStorage.setItem("cachedVacationsTimestamp",(new Date).getTime().toString())}catch(l){console.error("Erreur lors de la mise en cache des donn\xe9es:",l)}}else console.error("Format de donn\xe9es invalide:",e),u.current&&c("Format de donn\xe9es invalide");u.current&&i(!1)}catch(e){console.error("Erreur lors du chargement des cong\xe9s:",e),u.current&&c(e.message||"Erreur lors du chargement des cong\xe9s"),t++;const r=500*Math.pow(2,t);console.log(`Nouvelle tentative dans ${r}ms (${t}/2)`);const o=setTimeout((()=>{u.current&&s()}),r);return()=>clearTimeout(o)}};u.current&&(i(!0),c(null)),await s()}),[d]);(0,o.useEffect)((()=>(h(),m.current=setInterval((()=>{u.current&&(console.log("Rafra\xeechissement p\xe9riodique des donn\xe9es de cong\xe9s"),h(!0))}),6e4),()=>{m.current&&(clearInterval(m.current),m.current=null)})),[h]);const y=(0,o.useCallback)((async e=>{try{if(i(!0),c(null),console.log("Donn\xe9es originales de la demande de cong\xe9:",e),!e.employeeId&&!e.employee_id){const e="L'identifiant de l'employ\xe9 est requis";return n.oR.error(e),i(!1),{success:!1,error:e}}if(!e.startDate&&!e.start_date||!e.endDate&&!e.end_date){const e="Les dates de d\xe9but et de fin sont requises";return n.oR.error(e),i(!1),{success:!1,error:e}}const t={employee_id:e.employeeId||e.employee_id,start_date:e.startDate||e.start_date,end_date:e.endDate||e.end_date,type:e.type||"paid",reason:e.reason||"",status:"pending"};if(t.start_date&&!t.start_date.includes("-")){const e=new Date(t.start_date);t.start_date=e.toISOString().split("T")[0]}if(t.end_date&&!t.end_date.includes("-")){const e=new Date(t.end_date);t.end_date=e.toISOString().split("T")[0]}console.log("Donn\xe9es format\xe9es pour la cr\xe9ation de cong\xe9:",t);const o=localStorage.getItem("token");console.log("Token d'authentification pr\xe9sent:",!!o);const s=async()=>{try{const e=await d.post(a.Sn.VACATIONS,t);return console.log("R\xe9ponse de l'API:",e),r((r=>[...r,e])),n.oR.success("Demande de cong\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,data:e}}catch(l){var e,o,s,i;console.error("Erreur lors de la cr\xe9ation de la demande de cong\xe9:",l);const t=(null===(e=l.response)||void 0===e||null===(o=e.data)||void 0===o?void 0:o.message)||(null===(s=l.response)||void 0===s||null===(i=s.data)||void 0===i?void 0:i.error)||l.message||"Erreur lors de la cr\xe9ation de la demande de cong\xe9";throw n.oR.error(t),c(t),l}},u=await p(s,2,1e3);return i(!1),h(!0),u}catch(l){return console.error("Erreur finale lors de la cr\xe9ation de la demande de cong\xe9:",l),i(!1),c(l.message||"Erreur lors de la cr\xe9ation de la demande de cong\xe9"),{success:!1,error:l.message}}}),[d,p,h]),g=(0,o.useCallback)((async(e,t)=>{try{const o=async()=>{const r=await d.put(`${a.Sn.VACATIONS}/${e}`,t);var o;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(o=r.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de la demande de cong\xe9");return r},s=await p(o);return r((r=>r.map((r=>r.id===e?s:r)))),n.oR.success("Demande de cong\xe9 mise \xe0 jour avec succ\xe8s"),h(!0),{success:!0,vacation:s}}catch(o){console.error("Erreur lors de la mise \xe0 jour de la demande de cong\xe9:",o);const e=o.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la mise \xe0 jour de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),f=(0,o.useCallback)((async e=>{try{const t=async()=>{const r=await d.delete(`${a.Sn.VACATIONS}/${e}`);var t;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(t=r.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de la demande de cong\xe9");return r};return await p(t),r((r=>r.filter((r=>r.id!==e)))),n.oR.success("Demande de cong\xe9 supprim\xe9e avec succ\xe8s"),h(!0),{success:!0}}catch(t){console.error("Erreur lors de la suppression de la demande de cong\xe9:",t);const e=t.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la suppression de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),v=(0,o.useCallback)((async function(e,t){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";try{const s=async()=>{const r=await d.put(`${a.Sn.VACATIONS}/${e}/status`,{status:t,comment:o});var n;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(n=r.data)||void 0===n?void 0:n.message)||`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9`);return r},i=await p(s);return r((r=>r.map((r=>r.id===e?i:r)))),n.oR.success(`Demande de cong\xe9 ${"approved"===t?"approuv\xe9e":"rejet\xe9e"} avec succ\xe8s`),h(!0),{success:!0,vacation:i}}catch(s){console.error(`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9:`,s);const e=s.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),x=(0,o.useCallback)((r=>r?e.filter((e=>e.status===r)):e),[e]),$=(0,o.useCallback)((()=>h(!0)),[h]);return{vacations:e,loading:t,error:l,fetchVacations:h,refreshVacations:$,createVacation:y,updateVacation:g,deleteVacation:f,updateVacationStatus:v,getVacationsByStatus:x,approveVacation:e=>v(e,"approved"),rejectVacation:(e,r)=>v(e,"rejected",r)}}},7013:(e,r,t)=>{t.d(r,{A:()=>u});var o=t(5043),n=t(3768),a=t(5200),s=t(4583),i=t(5016),l=t(4634),c=t(2693),d=t(579);const u=()=>{const[e,r]=(0,o.useState)([]),[t,u]=(0,o.useState)(!0),[m,p]=(0,o.useState)(null),h=(0,l.A)(),{user:y}=(0,i.A)(),{activities:g,socket:f,requestActivitiesUpdate:v,fallbackMode:x}=(0,c.A)(),$=(0,o.useCallback)((async function(){try{u(!0);const e=await h.get(s.Sn.ACTIVITIES.BASE);if(!e||!Array.isArray(e)&&!e.data)throw new Error("Erreur lors du chargement des activit\xe9s: format de r\xe9ponse invalide");{const t=Array.isArray(e)?e:Array.isArray(e.data)?e.data:[];r(t),p(null)}}catch(e){console.error("Erreur lors du chargement des activit\xe9s:",e),p("Erreur lors du chargement des activit\xe9s"),n.oR.error("Erreur lors du chargement des activit\xe9s"),r([])}finally{u(!1)}}),[h]),b=(0,o.useCallback)((async e=>{try{const o=await h.post(s.Sn.ACTIVITIES.BASE,e);if(o.ok)return r((e=>[...e,o.data])),n.oR.success("Activit\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,activity:o.data};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la cr\xe9ation de l'activit\xe9")}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'activit\xe9:",o),n.oR.error("Erreur lors de la cr\xe9ation de l'activit\xe9"),{success:!1,error:o.message}}}),[h]),j=(0,o.useCallback)((async(e,t)=>{try{const a=await h.put(`${s.Sn.ACTIVITIES.BASE}/${e}`,t);if(a.ok)return r((r=>r.map((r=>r.id===e?{...r,...a.data}:r)))),n.oR.success("Activit\xe9 mise \xe0 jour avec succ\xe8s"),{success:!0,activity:a.data};var o;throw new Error((null===(o=a.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'activit\xe9")}catch(a){return console.error("Erreur lors de la mise \xe0 jour de l'activit\xe9:",a),n.oR.error("Erreur lors de la mise \xe0 jour de l'activit\xe9"),{success:!1,error:a.message}}}),[h]),A=(0,o.useCallback)((async e=>{try{const o=await h.delete(`${s.Sn.ACTIVITIES.BASE}/${e}`);if(o.ok)return r((r=>r.filter((r=>r.id!==e)))),n.oR.success("Activit\xe9 supprim\xe9e avec succ\xe8s"),{success:!0};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de l'activit\xe9")}catch(o){return console.error("Erreur lors de la suppression de l'activit\xe9:",o),n.oR.error("Erreur lors de la suppression de l'activit\xe9"),{success:!1,error:o.message}}}),[h]),w=(0,o.useCallback)((e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}}),[]),_=(0,o.useCallback)((e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}}),[]),k=(0,o.useCallback)(((e,r)=>{if(!e||!r)return"";const t=new Date(e),o=new Date(r);return`du ${t.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})} au ${o.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}`}),[]),E=(0,o.useCallback)((e=>{if(!e)return"";if(e.description)return e.description;const{type:r,entity_type:t,entity_id:o,user_id:n,details:a,user:s}=e,i=s&&s.name?s.name:"Un utilisateur";let l=`${i} ${{create:"a cr\xe9\xe9",update:"a modifi\xe9",delete:"a supprim\xe9",approve:"a approuv\xe9",reject:"a rejet\xe9",vacation_status_update:"a mis \xe0 jour le statut de"}[r]||r} ${{employee:"un employ\xe9",schedule:"un planning",vacation:"une demande de cong\xe9",shift:"un horaire",user:"un utilisateur"}[t]||t}`;if(a){let e;try{e="string"===typeof a?JSON.parse(a):a}catch(c){e=a}if("vacation"===t){if("create"===r&&e.employee_name&&e.start_date&&e.end_date){const r=e.employee_name;return`${i} a cr\xe9\xe9 une demande de cong\xe9 ${w(e.type)} pour ${r} ${k(e.start_date,e.end_date)}`}if("vacation_status_update"===r&&e.new_status){const r=e.new_status,t=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,n=e.start_date&&e.end_date?k(e.start_date,e.end_date):"",a=e.vacation_type?w(e.vacation_type):"";return`${i} a ${_(r)} la demande de cong\xe9${a?" "+a:""} de ${t}${n?" "+n:""}`}if("update"===r){const r=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,t=e.start_date&&e.end_date?k(e.start_date,e.end_date):"",n=e.vacation_type?w(e.vacation_type):"";return`${i} a modifi\xe9 la demande de cong\xe9${n?" "+n:""} de ${r}${t?" "+t:""}`}if("delete"===r){const r=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,t=e.start_date&&e.end_date?k(e.start_date,e.end_date):"",n=e.vacation_type?w(e.vacation_type):"";return`${i} a supprim\xe9 la demande de cong\xe9${n?" "+n:""} de ${r}${t?" "+t:""}`}}if("employee"===t&&e.action&&("Ajout d'heures"===e.action||"Soustraction d'heures"===e.action)){const r=e.employeeName||`Employ\xe9 #${o}`,t=e.hours||"?";return`${i} a ${"Ajout d'heures"===e.action?"ajout\xe9":"soustrait"} ${t}h au solde d'heures de ${r}`}"string"===typeof e?l+=` : ${e}`:"object"===typeof e&&e.employeeName&&"employee"===t&&(l+=` : ${e.employeeName}`)}return l}),[k,w,_]),S=(0,o.useCallback)((e=>{if(!e)return"";const r=new Date(e),t=new Date-r,o=Math.floor(t/1e3),n=Math.floor(o/60),a=Math.floor(n/60),s=Math.floor(a/24);return o<60?"\xe0 l'instant":n<60?`il y a ${n} minute${n>1?"s":""}`:a<24?`il y a ${a} heure${a>1?"s":""}`:s<7?`il y a ${s} jour${s>1?"s":""}`:r.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}),[]),C=(0,o.useCallback)((e=>{switch(e){case"create":return(0,d.jsx)(a.GGD,{});case"update":return(0,d.jsx)(a.SG1,{});case"delete":return(0,d.jsx)(a.IXo,{});case"approve":return(0,d.jsx)(a.YrT,{});case"reject":return(0,d.jsx)(a.yGN,{});default:return null}}),[]);return(0,o.useEffect)((()=>{g&&Array.isArray(g)&&g.length>0&&(console.log("Nouvelles activit\xe9s re\xe7ues via WebSocket:",g),r((e=>{const r=Array.isArray(e)?e:[],t=new Map;return g.forEach((e=>{t.set(e.id,e)})),r.forEach((e=>{t.has(e.id)||t.set(e.id,e)})),Array.from(t.values()).sort(((e,r)=>new Date(r.timestamp)-new Date(e.timestamp)))})),u(!1))}),[g]),(0,o.useEffect)((()=>{$();const e=setInterval((()=>{$()}),12e4);return()=>clearInterval(e)}),[$]),(0,o.useEffect)((()=>{f&&!x?(console.log("WebSocket connect\xe9, on va rafra\xeechir les activit\xe9s"),v()):x&&(console.log("Mode de secours WebSocket actif, utilisation de l'API REST"),$())}),[f,v,x,$]),(0,o.useEffect)((()=>{x&&(console.log("Passage en mode de secours, r\xe9cup\xe9ration des activit\xe9s via API REST"),$())}),[x,$]),{activities:e,loading:t,error:m,fetchActivities:$,createActivity:b,updateActivity:j,deleteActivity:A,getActivityIcon:C,formatActivityDescription:E,formatActivityDate:S,formatVacationDates:k,translateVacationType:w,translateVacationStatus:_}}},9423:(e,r,t)=>{t.r(r),t.d(r,{default:()=>Me});var o=t(6226),n=t(3750),a=t.n(n),s=t(5043),i=t(5200),l=t(3216),c=t(1529),d=t(6213),u=t(9525),m=t(4089),p=t(7013),h=t(579);c.i7`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;const y=c.i7`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`,g=c.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }
`,f=c.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  padding-bottom: 0.75rem;
`,v=c.Ay.h3`
  font-size: 1.2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  svg {
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,x=c.Ay.button`
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
`,$=c.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,b=(0,c.Ay)(o.P.div)`
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
`,j=c.Ay.div`
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
    animation: ${y} 1.5s infinite;
  }
`,A=c.Ay.div`
  flex: 1;
`,w=c.Ay.div`
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.4;
`,_=c.Ay.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,k=c.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,E=c.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,S=c.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
`,C=c.Ay.div`
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
`,D=c.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,R=c.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,I=c.Ay.button`
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
`,z=c.Ay.span`
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
`,T=(e,r)=>{if("vacation"===r)return(0,h.jsx)(i.Wh$,{});switch(e){case"create":return(0,h.jsx)(i.GGD,{});case"update":return(0,h.jsx)(i.SG1,{});case"delete":return(0,h.jsx)(i.IXo,{});case"approve":return(0,h.jsx)(i.YrT,{});case"reject":return(0,h.jsx)(i.yGN,{});case"system":default:return(0,h.jsx)(i.S8s,{});case"vacation_status_update":return(0,h.jsx)(i.Wh$,{})}},V=(e,r,t)=>{if("vacation"===r){let r="";switch(t&&"object"===typeof t&&(t.type?r=F(t.type):t.vacation_type&&(r=F(t.vacation_type))),e){case"create":return"Nouvelle demande"+(r?" "+r:"");case"update":return"Modification cong\xe9"+(r?" "+r:"");case"delete":return"Suppression cong\xe9"+(r?" "+r:"");case"approve":return"Approbation cong\xe9"+(r?" "+r:"");case"reject":return"Rejet cong\xe9"+(r?" "+r:"");case"vacation_status_update":let e="";return t&&"object"===typeof t&&t.new_status&&(e=N(t.new_status)),`Cong\xe9 ${e}${r?" "+r:""}`;default:return"Cong\xe9"+(r?" "+r:"")}}switch(e){case"create":return"Cr\xe9ation";case"update":return"Modification";case"delete":return"Suppression";case"approve":return"Approbation";case"reject":return"Rejet";case"system":return"Syst\xe8me";case"vacation_status_update":return"Mise \xe0 jour statut";default:return"Information"}},F=e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}},N=e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}},B=()=>{const e=(0,l.Zp)(),{activities:r,loading:t,error:n,fetchActivities:a,formatActivityDescription:s,formatActivityDate:c}=(0,p.A)(),d=Array.isArray(r)?r:[],y={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:100,damping:10}}};return(0,h.jsxs)(g,{children:[(0,h.jsxs)(f,{children:[(0,h.jsxs)(v,{children:[(0,h.jsx)(i.Ohp,{size:18})," Activit\xe9s r\xe9centes",!t&&d.length>0&&(0,h.jsx)(z,{color:"#4F46E5",children:d.length})]}),(0,h.jsxs)(x,{onClick:()=>{a(!0)},disabled:t,children:[(0,h.jsx)(i.jTZ,{size:16,className:t?"animate-spin":""}),"Actualiser"]})]}),t?(0,h.jsxs)(C,{children:[(0,h.jsx)(i.jTZ,{size:32}),(0,h.jsx)("div",{children:"Chargement des activit\xe9s..."})]}):n?(0,h.jsxs)(D,{children:[(0,h.jsx)(i.yGN,{size:32}),(0,h.jsx)("div",{children:"Une erreur est survenue lors du chargement des activit\xe9s."})]}):0===d.length?(0,h.jsxs)(R,{children:[(0,h.jsx)(i.S8s,{size:32}),(0,h.jsx)("div",{children:"Aucune activit\xe9 r\xe9cente."})]}):(0,h.jsxs)(h.Fragment,{children:[(0,h.jsx)(o.P.div,{variants:{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},initial:"hidden",animate:"visible",children:(0,h.jsx)($,{children:d.slice(0,5).map(((e,r)=>{const t=((e,r)=>{if("vacation"===r)return"#6366F1";switch(e){case"create":return"#10B981";case"update":return"#F59E0B";case"delete":return"#EF4444";case"approve":return"#3B82F6";case"reject":return"#EC4899";case"system":return"#8B5CF6";case"vacation_status_update":return"#6366F1";default:return"#4F46E5"}})(e.type,e.entity_type),{date:o,time:n}=(e=>{if(!e)return{date:"",time:""};const r=new Date(e);return{date:(0,u.A)(r,"dd MMMM yyyy",{locale:m.A}),time:(0,u.A)(r,"HH:mm:ss",{locale:m.A})}})(e.timestamp),a=(e=>{if(!e||!e.details)return{};let r=e.details;if("string"===typeof r)try{r=JSON.parse(r)}catch(t){return{}}return{employeeName:r.employee_name||"",employeeId:r.employee_id||"",vacationType:r.type||r.vacation_type||"",startDate:r.start_date||"",endDate:r.end_date||"",status:r.status||r.new_status||"",previousStatus:r.previous_status||""}})(e);let l="",c="";return"vacation"===e.entity_type&&(l=a.vacationType?F(a.vacationType):"",c=a.status?N(a.status):""),(0,h.jsxs)(b,{color:t,variants:y,whileHover:{scale:1.01},children:[(0,h.jsx)(j,{color:t,children:T(e.type,e.entity_type)}),(0,h.jsxs)(A,{children:[(0,h.jsxs)(w,{children:[s(e),(0,h.jsx)(z,{color:t,children:V(e.type,e.entity_type,e.details)})]}),(0,h.jsxs)(_,{children:[(0,h.jsxs)(k,{children:[(0,h.jsx)(i.Ohp,{size:12})," ",n]}),(0,h.jsxs)(E,{children:[(0,h.jsx)(i.wIk,{size:12})," ",o]}),"vacation"===e.entity_type&&a.employeeName&&(0,h.jsxs)(S,{children:[(0,h.jsx)(i.JXP,{size:12})," ",a.employeeName]})]})]})]},e.id||r)}))})}),d.length>5&&(0,h.jsxs)(I,{onClick:()=>{e("/activities")},children:["Voir toutes les activit\xe9s (",d.length,")"]})]})]})},L=c.Ay.div`
  position: relative;
  width: 100%;
  max-width: ${e=>{let{expanded:r}=e;return r?"600px":"300px"}};
  transition: max-width 0.3s ease;
`,P=c.Ay.div`
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
`,M=c.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`,G=c.Ay.input`
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
`,O=c.Ay.button`
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
`,W=(c.Ay.button`
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
`,c.Ay.div`
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
`),H=c.Ay.div`
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  }
`,q=c.Ay.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.semiBold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,Y=c.Ay.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,X=c.Ay.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:r,color:t}=e;return t?`${t}22`:`${r.colors.primary}22`}};
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`,J=c.Ay.div`
  flex: 1;
`,U=c.Ay.div`
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,Z=c.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,K=c.Ay.span`
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}33`}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  padding: 0 0.25rem;
  border-radius: 2px;
`,Q=c.Ay.div`
  padding: 1.5rem;
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,ee=(c.Ay.div`
  padding: 1rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  margin-top: 0.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: ${e=>{let{visible:r}=e;return r?"block":"none"}};
`,c.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`,c.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,c.Ay.label`
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,c.Ay.select`
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
`,c.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`,c.Ay.button`
  padding: 0.5rem 1rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  cursor: pointer;
  transition: all 0.2s ease;

  ${e=>{let{primary:r,theme:t}=e;return r?`\n    background-color: ${t.colors.primary};\n    color: white;\n    border: 1px solid ${t.colors.primary};\n    \n    &:hover {\n      background-color: ${t.colors.primary}dd;\n    }\n  `:`\n    background-color: transparent;\n    color: ${t.colors.text.primary};\n    border: 1px solid ${t.colors.border};\n    \n    &:hover {\n      background-color: ${t.colors.background};\n      border-color: ${t.colors.text.secondary};\n    }\n  `}}
`,e=>{let{placeholder:r="Rechercher...",onSearch:t,initialResults:o=[],customGetResults:n}=e;const[a,l]=(0,s.useState)(""),[c,d]=(0,s.useState)(!1),[u,m]=(0,s.useState)(!1),[p,y]=(0,s.useState)(o),g=(0,s.useRef)(null),f=(0,s.useRef)(null);(0,s.useEffect)((()=>{const e=e=>{g.current&&!g.current.contains(e.target)&&(d(!1),m(!1))};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}}),[]),(0,s.useEffect)((()=>{if(a.length>1){if(n)t(a);else{y([])}m(!0)}else y([]),m(!1)}),[a,n,t]),(0,s.useEffect)((()=>{o&&o.length>0&&(y(o),a.length>1&&m(!0))}),[o,a]);const v=(e,r)=>{if(!r||!e)return e;return e.split(new RegExp(`(${r})`,"gi")).map(((e,t)=>e.toLowerCase()===r.toLowerCase()?(0,h.jsx)(K,{children:e},t):e))};return(0,h.jsx)("div",{ref:g,children:(0,h.jsxs)(L,{children:[(0,h.jsxs)(P,{focused:c,children:[(0,h.jsx)(M,{children:(0,h.jsx)(i.CKj,{})}),(0,h.jsx)(G,{ref:f,type:"text",placeholder:r,value:a,onChange:e=>{l(e.target.value)},onFocus:()=>{d(!0),a.length>1&&m(!0)}}),(0,h.jsx)(O,{visible:a.length>0,onClick:()=>{l(""),y([]),m(!1),f.current.focus()},"aria-label":"Effacer la recherche",children:(0,h.jsx)(i.yGN,{})})]}),(0,h.jsx)(W,{visible:u&&p.length>0,children:0===p.length?(0,h.jsxs)(Q,{children:['Aucun r\xe9sultat trouv\xe9 pour "',a,'"']}):p.map(((e,r)=>(0,h.jsxs)(H,{children:[(0,h.jsx)(q,{children:e.title}),e.items.map(((e,r)=>(0,h.jsxs)(Y,{onClick:()=>(e=>{t&&t(e),m(!1)})(e),children:[(0,h.jsx)(X,{color:e.color,children:"employee"===e.type?(0,h.jsx)(i.JXP,{}):"vacation"===e.type?(0,h.jsx)(i.Wh$,{}):(0,h.jsx)(i.wIk,{})}),(0,h.jsxs)(J,{children:[(0,h.jsxs)(U,{children:[v(e.name,a),e.status&&(0,h.jsx)("span",{style:{marginLeft:"8px"},children:"approved"===e.status?(0,h.jsx)(i.A3x,{color:"#10B981"}):"rejected"===e.status?(0,h.jsx)(i.q_G,{color:"#EF4444"}):(0,h.jsx)(i.Ohp,{color:"#F59E0B"})})]}),(0,h.jsx)(Z,{children:"employee"===e.type?e.role:"vacation"===e.type?`${e.employee} (${e.dates})`:e.date})]})]},r)))]},r)))})]})})});var re=t(5016),te=t(2479),oe=t(290),ne=t(1734);const ae=c.Ay.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,se=c.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`,ie=c.Ay.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`,le=c.Ay.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`,ce=c.Ay.div`
  display: flex;
  flex-direction: column;
`,de=c.Ay.h1`
  font-size: 1.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
`,ue=c.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0.5rem 0 0 0;
`,me=(0,c.Ay)(o.P.div)`
  margin-bottom: 2rem;
`,pe=(0,c.Ay)(o.P.div)`
  background: linear-gradient(
    135deg,
    ${e=>{let{theme:r}=e;return r.colors.primary}},
    ${e=>{let{theme:r}=e;return r.colors.primary}}dd
  );
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 2rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  color: white;
  position: relative;
  overflow: hidden;

  h1 {
    font-size: 1.5rem;
    margin: 0 0 1rem 0;
    font-weight: 600;
  }

  p {
    margin: 0;
    line-height: 1.5;
    opacity: 0.9;
    max-width: 80%;
  }

  &::after {
    content: "";
    position: absolute;
    top: -50px;
    right: -50px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    z-index: 1;
  }
`,he=(0,c.Ay)(o.P.div)`
  margin-bottom: 2rem;
`,ye=(0,c.Ay)(o.P.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`,ge=(0,c.Ay)(o.P.div)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }
`,fe=c.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`,ve=c.Ay.h3`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0;
`,xe=c.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,$e=c.Ay.div`
  font-size: 1.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,be=c.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r,positive:t}=e;return t?r.colors.success:!1===t?r.colors.error:r.colors.text.secondary}};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.5rem;
`,je=c.Ay.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
`,Ae=c.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,we=(0,c.Ay)(o.P.div)`
  margin-bottom: 2rem;
`,_e=c.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`,ke=(0,c.Ay)(o.P.div)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
    background-color: ${e=>{let{theme:r,color:t}=e;return t?`${t}11`:r.colors.backgroundAlt}};
  }
`,Ee=c.Ay.div`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin-bottom: 1rem;
`,Se=c.Ay.h3`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 0.5rem 0;
`,Ce=c.Ay.p`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0;
`,De=(0,c.Ay)(o.P.div)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  height: fit-content;
`,Re=c.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,Ie=c.Ay.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  background-color: ${e=>{let{theme:r,color:t}=e;return t?`${t}11`:r.colors.backgroundAlt}};
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(5px);
  }
`,ze=c.Ay.div`
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
  flex-shrink: 0;
`,Te=c.Ay.div`
  flex: 1;
`,Ve=c.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
  font-weight: 500;
`,Fe=c.Ay.div`
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,Ne=c.Ay.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 1rem;
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`,Be=((0,c.Ay)(o.P.div)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  margin-bottom: 2rem;
`,c.Ay.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{theme:r}=e;return r.colors.backgroundAlt}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.875rem;
`),Le={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:.5}}},Pe={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},Me=()=>{const{user:e}=(0,re.A)(),r=(0,l.Zp)(),{employees:t,isLoading:o}=(0,te.A)(),{vacations:n,isLoading:c}=(0,oe.A)(),[u,m]=(0,s.useState)({totalEmployees:0,pendingVacations:0,upcomingVacations:[],todayAbsent:0}),[p,y]=(0,s.useState)([]);(0,s.useEffect)((()=>{if(!o&&!c){var e,r,a,s;const o=(null===t||void 0===t?void 0:t.length)||0,i=(null===n||void 0===n||null===(e=n.filter((e=>"pending"===e.status)))||void 0===e?void 0:e.length)||0,l=new Date;l.setHours(0,0,0,0);const c=(null===n||void 0===n||null===(r=n.filter((e=>{const r=new Date(e.start_date);return"approved"===e.status&&r>=l})))||void 0===r||null===(a=r.sort(((e,r)=>new Date(e.start_date)-new Date(r.start_date))))||void 0===a?void 0:a.slice(0,5))||[],d=(null===n||void 0===n||null===(s=n.filter((e=>{const r=new Date(e.start_date),t=new Date(e.end_date);return r.setHours(0,0,0,0),t.setHours(23,59,59,999),"approved"===e.status&&l>=r&&l<=t})))||void 0===s?void 0:s.length)||0;m({totalEmployees:o,pendingVacations:i,upcomingVacations:c,todayAbsent:d})}}),[t,n,o,c]);const g=e=>{r(e)};return(0,h.jsxs)(ae,{children:[(0,h.jsx)(se,{children:(0,h.jsxs)(ie,{children:[(0,h.jsx)(le,{children:(0,h.jsx)(a(),{animationData:d,loop:!0,style:{width:"100%",height:"100%"}})}),(0,h.jsxs)(ce,{children:[(0,h.jsx)(de,{children:"Tableau de bord"}),(0,h.jsx)(ue,{children:"Bienvenue sur votre assistant de planification intelligent"})]})]})}),(0,h.jsx)(me,{initial:"hidden",animate:"visible",variants:Le,children:(0,h.jsxs)(pe,{children:[(0,h.jsxs)("h1",{children:["Bonjour, ",e?e.first_name&&e.last_name?`${e.first_name} ${e.last_name}`:e.username||"Utilisateur":"Utilisateur","!"]}),(0,h.jsx)("p",{children:"Bienvenue sur votre tableau de bord. Voici un aper\xe7u de votre activit\xe9 r\xe9cente et des t\xe2ches \xe0 venir."})]})}),(0,h.jsx)(he,{initial:"hidden",animate:"visible",variants:Le,children:(0,h.jsx)(ee,{placeholder:"Rechercher un employ\xe9, un cong\xe9...",onSearch:e=>{if("string"===typeof e){const r=(e=>{if(!e||e.length<2)return[];const r=e.toLowerCase();let o=t.filter((e=>e.first_name.toLowerCase().includes(r)||e.last_name.toLowerCase().includes(r)||e.email.toLowerCase().includes(r)||e.department&&e.department.toLowerCase().includes(r))),a=n.filter((e=>{const t=`${e.employee_first_name} ${e.employee_last_name}`.toLowerCase(),o=`${new Date(e.start_date).toLocaleDateString("fr-FR")} - ${new Date(e.end_date).toLocaleDateString("fr-FR")}`;return t.includes(r)||e.type&&e.type.toLowerCase().includes(r)||o.includes(r)}));const s=[];return o.length>0&&s.push({title:"Employ\xe9s",items:o.map((e=>({id:e.id,type:"employee",name:`${e.first_name} ${e.last_name}`,role:e.department||"Non sp\xe9cifi\xe9",color:"#4F46E5"})))}),a.length>0&&s.push({title:"Cong\xe9s",items:a.map((e=>{let r="#F59E0B";"approved"===e.status?r="#10B981":"rejected"===e.status&&(r="#EF4444");const t=new Date(e.start_date).toLocaleDateString("fr-FR"),o=new Date(e.end_date).toLocaleDateString("fr-FR");return{id:e.id,type:"vacation",name:e.type||"Cong\xe9",employee:`${e.employee_first_name} ${e.employee_last_name}`,dates:`${t} - ${o}`,status:e.status,color:r}}))}),s})(e);y(r)}else console.log("\xc9l\xe9ment s\xe9lectionn\xe9:",e),"employee"===e.type?r(`/employees/${e.id}`):"vacation"===e.type&&r(`/vacations/${e.id}`)},initialResults:p,customGetResults:!0})}),(0,h.jsxs)(ye,{initial:"hidden",animate:"visible",variants:Pe,children:[(0,h.jsxs)(ge,{variants:Le,children:[(0,h.jsxs)(fe,{children:[(0,h.jsx)(ve,{children:"Total employ\xe9s"}),(0,h.jsx)(xe,{color:"#4F46E5",children:(0,h.jsx)(i.cfS,{})})]}),(0,h.jsx)($e,{children:u.totalEmployees}),(0,h.jsx)(be,{children:"\xc9quipe compl\xe8te"})]}),(0,h.jsxs)(ge,{variants:Le,children:[(0,h.jsxs)(fe,{children:[(0,h.jsx)(ve,{children:"Demandes en attente"}),(0,h.jsx)(xe,{color:"#F59E0B",children:(0,h.jsx)(i.Ohp,{})})]}),(0,h.jsx)($e,{children:u.pendingVacations}),(0,h.jsx)(be,{positive:0===u.pendingVacations,children:0===u.pendingVacations?"Aucune demande en attente":"N\xe9cessite votre attention"})]}),(0,h.jsxs)(ge,{variants:Le,children:[(0,h.jsxs)(fe,{children:[(0,h.jsx)(ve,{children:"Absents aujourd'hui"}),(0,h.jsx)(xe,{color:"#EC4899",children:(0,h.jsx)(i.Wh$,{})})]}),(0,h.jsx)($e,{children:u.todayAbsent}),(0,h.jsx)(be,{children:0===u.todayAbsent?"Tout le monde est pr\xe9sent":`${u.todayAbsent} employ\xe9(s) absent(s)`})]})]}),(0,h.jsxs)(we,{initial:"hidden",animate:"visible",variants:Le,children:[(0,h.jsxs)(Ae,{children:[(0,h.jsx)(i.vQY,{size:18,color:"#4F46E5"}),"Actions rapides"]}),(0,h.jsxs)(_e,{children:[(0,h.jsxs)(ke,{whileHover:{scale:1.03},whileTap:{scale:.98},onClick:()=>g("/employees"),color:"#4F46E5",children:[(0,h.jsx)(Ee,{color:"#4F46E5",children:(0,h.jsx)(i.cfS,{})}),(0,h.jsx)(Se,{children:"G\xe9rer les employ\xe9s"}),(0,h.jsx)(Ce,{children:"Ajouter, modifier ou supprimer des employ\xe9s"})]}),(0,h.jsxs)(ke,{whileHover:{scale:1.03},whileTap:{scale:.98},onClick:()=>g("/vacations"),color:"#EC4899",children:[(0,h.jsx)(Ee,{color:"#EC4899",children:(0,h.jsx)(i.Wh$,{})}),(0,h.jsx)(Se,{children:"G\xe9rer les cong\xe9s"}),(0,h.jsx)(Ce,{children:"Approuver ou rejeter les demandes de cong\xe9s"})]}),(0,h.jsxs)(ke,{whileHover:{scale:1.03},whileTap:{scale:.98},onClick:()=>g("/schedule"),color:"#10B981",children:[(0,h.jsx)(Ee,{color:"#10B981",children:(0,h.jsx)(i.wIk,{})}),(0,h.jsx)(Se,{children:"Planning"}),(0,h.jsx)(Ce,{children:"Consulter et modifier le planning"})]}),(0,h.jsxs)(ke,{whileHover:{scale:1.03},whileTap:{scale:.98},onClick:()=>g("/stats"),color:"#F59E0B",children:[(0,h.jsx)(Ee,{color:"#F59E0B",children:(0,h.jsx)(i.eXT,{})}),(0,h.jsx)(Se,{children:"Statistiques"}),(0,h.jsx)(Ce,{children:"Consulter les statistiques de l'entreprise"})]})]})]}),(0,h.jsx)(je,{children:(0,h.jsxs)(De,{initial:"hidden",animate:"visible",variants:Le,children:[(0,h.jsxs)(Ae,{children:[(0,h.jsx)(i.wIk,{size:18,color:"#EC4899"}),"Prochains cong\xe9s"]}),0===u.upcomingVacations.length?(0,h.jsx)(Be,{children:"Aucun cong\xe9 \xe0 venir"}):(0,h.jsxs)(Re,{children:[u.upcomingVacations.map(((e,r)=>(0,h.jsxs)(Ie,{color:"#EC4899",children:[(0,h.jsx)(ze,{color:"#EC4899",children:(0,h.jsx)(i.Wh$,{})}),(0,h.jsxs)(Te,{children:[(0,h.jsx)(Ve,{children:e.employee_name||`Employ\xe9 #${e.employee_id}`}),(0,h.jsxs)(Fe,{children:[(0,h.jsx)(i.wIk,{size:12}),(0,ne.Yq)(e.start_date)," -"," ",(0,ne.Yq)(e.end_date)]})]})]},r))),(0,h.jsxs)(Ne,{onClick:()=>g("/vacations"),children:["Voir tous les cong\xe9s"," ",(0,h.jsx)(i.dyV,{size:14,style:{marginLeft:"4px"}})]})]})]})}),(0,h.jsx)(B,{})]})}}}]);
//# sourceMappingURL=423.f3010661.chunk.js.map