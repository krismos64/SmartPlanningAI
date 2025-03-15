"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[764],{290:(e,r,t)=>{t.d(r,{A:()=>i});var o=t(5043),n=t(3768),s=t(4583),a=t(4634);const i=()=>{const[e,r]=(0,o.useState)([]),[t,i]=(0,o.useState)(!0),[c,l]=(0,o.useState)(null),d=(0,a.A)(),u=(0,o.useRef)(!0),m=(0,o.useRef)(null);(0,o.useEffect)((()=>(u.current=!0,()=>{u.current=!1,m.current&&(clearInterval(m.current),m.current=null)})),[]);const p=(0,o.useCallback)((async function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:3,t=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1e3,o=null,n=0;for(;n<r;)try{return await e()}catch(s){if(o=s,n++,n<r){const e=t*Math.pow(2,n-1);console.log(`Tentative ${n}/${r} \xe9chou\xe9e, nouvelle tentative dans ${e}ms`),await new Promise((r=>setTimeout(r,e)))}}throw o}),[]),h=(0,o.useCallback)((async function(){let e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];if(!u.current)return;let t=0;const o=localStorage.getItem("cachedVacations"),n=localStorage.getItem("cachedVacationsTimestamp");if(!e&&o&&n){if((new Date).getTime()-parseInt(n)<3e5)try{const e=JSON.parse(o);return console.log("Utilisation des donn\xe9es en cache pour les cong\xe9s"),void(u.current&&(r(e),i(!1)))}catch(c){console.error("Erreur lors de la lecture du cache:",c)}}const a=async()=>{if(t>=2||!u.current)u.current&&(l("Erreur lors du chargement des cong\xe9s apr\xe8s plusieurs tentatives"),i(!1));else try{console.log("Chargement des cong\xe9s...");if(!localStorage.getItem("token"))return console.error("Token d'authentification manquant"),void(u.current&&(l("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),i(!1)));const e=await d.get(s.Sn.VACATIONS);if(console.log("Donn\xe9es des cong\xe9s re\xe7ues:",e),!u.current)return;if(Array.isArray(e)){const t=e.map((e=>{const r=e.start_date||e.startDate,t=e.end_date||e.endDate;let o="-";if(r&&t){const e=new Date(r),n=new Date(t);e.setHours(0,0,0,0),n.setHours(0,0,0,0);let s=0;const a=new Date(e);for(;a<=n;)0!==a.getDay()&&s++,a.setDate(a.getDate()+1);o=`${s} jour${s>1?"s":""} ouvrable${s>1?"s":""}`}return{...e,employeeName:e.employee_name||e.employeeName||"Employ\xe9 inconnu",startDate:r,endDate:t,duration:o,employeeId:e.employee_id||e.employeeId,approvedAt:e.approved_at||e.approvedAt,approvedBy:e.approved_by||e.approvedBy,rejectedAt:e.rejected_at||e.rejectedAt,rejectedBy:e.rejected_by||e.rejectedBy,rejectionReason:e.rejection_reason||e.rejectionReason,createdAt:e.created_at||e.createdAt,updatedAt:e.updated_at||e.updatedAt}}));console.log("Donn\xe9es des cong\xe9s format\xe9es:",t),u.current&&(r(t),l(null));try{localStorage.setItem("cachedVacations",JSON.stringify(t)),localStorage.setItem("cachedVacationsTimestamp",(new Date).getTime().toString())}catch(c){console.error("Erreur lors de la mise en cache des donn\xe9es:",c)}}else console.error("Format de donn\xe9es invalide:",e),u.current&&l("Format de donn\xe9es invalide");u.current&&i(!1)}catch(e){console.error("Erreur lors du chargement des cong\xe9s:",e),u.current&&l(e.message||"Erreur lors du chargement des cong\xe9s"),t++;const r=500*Math.pow(2,t);console.log(`Nouvelle tentative dans ${r}ms (${t}/2)`);const o=setTimeout((()=>{u.current&&a()}),r);return()=>clearTimeout(o)}};u.current&&(i(!0),l(null)),await a()}),[d]);(0,o.useEffect)((()=>(h(),m.current=setInterval((()=>{u.current&&(console.log("Rafra\xeechissement p\xe9riodique des donn\xe9es de cong\xe9s"),h(!0))}),6e4),()=>{m.current&&(clearInterval(m.current),m.current=null)})),[h]);const g=(0,o.useCallback)((async e=>{try{if(i(!0),l(null),console.log("Donn\xe9es originales de la demande de cong\xe9:",e),!e.employeeId&&!e.employee_id){const e="L'identifiant de l'employ\xe9 est requis";return n.oR.error(e),i(!1),{success:!1,error:e}}if(!e.startDate&&!e.start_date||!e.endDate&&!e.end_date){const e="Les dates de d\xe9but et de fin sont requises";return n.oR.error(e),i(!1),{success:!1,error:e}}const t={employee_id:e.employeeId||e.employee_id,start_date:e.startDate||e.start_date,end_date:e.endDate||e.end_date,type:e.type||"paid",reason:e.reason||"",status:"pending"};if(t.start_date&&!t.start_date.includes("-")){const e=new Date(t.start_date);t.start_date=e.toISOString().split("T")[0]}if(t.end_date&&!t.end_date.includes("-")){const e=new Date(t.end_date);t.end_date=e.toISOString().split("T")[0]}console.log("Donn\xe9es format\xe9es pour la cr\xe9ation de cong\xe9:",t);const o=localStorage.getItem("token");console.log("Token d'authentification pr\xe9sent:",!!o);const a=async()=>{try{const e=await d.post(s.Sn.VACATIONS,t);return console.log("R\xe9ponse de l'API:",e),r((r=>[...r,e])),n.oR.success("Demande de cong\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,data:e}}catch(c){var e,o,a,i;console.error("Erreur lors de la cr\xe9ation de la demande de cong\xe9:",c);const t=(null===(e=c.response)||void 0===e||null===(o=e.data)||void 0===o?void 0:o.message)||(null===(a=c.response)||void 0===a||null===(i=a.data)||void 0===i?void 0:i.error)||c.message||"Erreur lors de la cr\xe9ation de la demande de cong\xe9";throw n.oR.error(t),l(t),c}},u=await p(a,2,1e3);return i(!1),h(!0),u}catch(c){return console.error("Erreur finale lors de la cr\xe9ation de la demande de cong\xe9:",c),i(!1),l(c.message||"Erreur lors de la cr\xe9ation de la demande de cong\xe9"),{success:!1,error:c.message}}}),[d,p,h]),x=(0,o.useCallback)((async(e,t)=>{try{const o=async()=>{const r=await d.put(`${s.Sn.VACATIONS}/${e}`,t);var o;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(o=r.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de la demande de cong\xe9");return r},a=await p(o);return r((r=>r.map((r=>r.id===e?a:r)))),n.oR.success("Demande de cong\xe9 mise \xe0 jour avec succ\xe8s"),h(!0),{success:!0,vacation:a}}catch(o){console.error("Erreur lors de la mise \xe0 jour de la demande de cong\xe9:",o);const e=o.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la mise \xe0 jour de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),y=(0,o.useCallback)((async e=>{try{const t=async()=>{const r=await d.delete(`${s.Sn.VACATIONS}/${e}`);var t;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(t=r.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de la demande de cong\xe9");return r};return await p(t),r((r=>r.filter((r=>r.id!==e)))),n.oR.success("Demande de cong\xe9 supprim\xe9e avec succ\xe8s"),h(!0),{success:!0}}catch(t){console.error("Erreur lors de la suppression de la demande de cong\xe9:",t);const e=t.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la suppression de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),j=(0,o.useCallback)((async function(e,t){let o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";try{const a=async()=>{const r=await d.put(`${s.Sn.VACATIONS}/${e}/status`,{status:t,comment:o});var n;if(r&&"object"===typeof r&&"ok"in r&&!r.ok)throw new Error((null===(n=r.data)||void 0===n?void 0:n.message)||`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9`);return r},i=await p(a);return r((r=>r.map((r=>r.id===e?i:r)))),n.oR.success(`Demande de cong\xe9 ${"approved"===t?"approuv\xe9e":"rejet\xe9e"} avec succ\xe8s`),h(!0),{success:!0,vacation:i}}catch(a){console.error(`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9:`,a);const e=a.message||"Erreur inconnue";return n.oR.error(`Erreur lors de la ${"approved"===t?"validation":"rejet"} de la demande de cong\xe9: ${e}`),{success:!1,error:e}}}),[d,p,h]),v=(0,o.useCallback)((r=>r?e.filter((e=>e.status===r)):e),[e]),f=(0,o.useCallback)((()=>h(!0)),[h]);return{vacations:e,loading:t,error:c,fetchVacations:h,refreshVacations:f,createVacation:g,updateVacation:x,deleteVacation:y,updateVacationStatus:j,getVacationsByStatus:v,approveVacation:e=>j(e,"approved"),rejectVacation:(e,r)=>j(e,"rejected",r)}}},1764:(e,r,t)=>{t.r(r),t.d(r,{default:()=>Y});var o=t(6226),n=t(5043),s=t(5200),a=t(1529),i=t(2479),c=t(290),l=t(579);const d=a.Ay.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,u=a.Ay.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`,m=a.Ay.div`
  display: flex;
  flex-direction: column;
`,p=a.Ay.h1`
  font-size: 1.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 0.5rem 0;
`,h=a.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1rem;
  margin: 0;
`,g=a.Ay.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  border: none;
  background-color: ${e=>{let{theme:r}=e;return r.colors.primaryLight}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primary}}22;
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
`,x=(0,a.Ay)(o.P.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`,y=(0,a.Ay)(o.P.div)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }
`,j=a.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`,v=a.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,f=a.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,b=a.Ay.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.background}66`}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
  position: relative;
`,$=a.Ay.div`
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.875rem;
`,w=a.Ay.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  text-align: center;
`,A=a.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-align: center;
`,E=a.Ay.div`
  height: 8px;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.border}`}};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${e=>{let{value:r}=e;return`${r}%`}};
    background-color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`,k=a.Ay.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`,S=a.Ay.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,_=a.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,D=a.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.text.primary}};
`,T=a.Ay.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return r}};
  margin-right: 0.5rem;
`,C=a.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`,z=a.Ay.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,V=a.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,F=a.Ay.div`
  flex: 1;
  height: 8px;
  background-color: ${e=>{let{theme:r}=e;return r.colors.border}};
  border-radius: 4px;
  margin: 0 1rem;
  overflow: hidden;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${e=>{let{percentage:r}=e;return`${r}%`}};
    background-color: ${e=>{let{color:r}=e;return r}};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`,B=a.Ay.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  min-width: 40px;
  text-align: right;
`,I=a.Ay.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};

  svg {
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`,R=a.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,N=a.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`,O=a.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }
`,q=a.Ay.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
  margin-bottom: 1rem;
`,M=a.Ay.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.text.primary}};
`,H=a.Ay.div`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-top: 0.5rem;
`,Z={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:.5}}},P={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},Y=()=>{const{employees:e,loading:r,fetchEmployees:t}=(0,i.A)(),{vacations:o,loading:a,fetchVacations:Y}=(0,c.A)(),[L,J]=(0,n.useState)({employees:{total:0,active:0,onVacation:0,departments:[]},vacations:{total:0,pending:0,approved:0,rejected:0,byType:{paid:0,unpaid:0,sick:0,other:0},byMonth:{}}});(0,n.useEffect)((()=>{if(!r&&!a&&e&&o){const r=e.length,t=new Date;t.setHours(0,0,0,0);const n=o.filter((e=>{const r=new Date(e.start_date),o=new Date(e.end_date);return r.setHours(0,0,0,0),o.setHours(23,59,59,999),"approved"===e.status&&t>=r&&t<=o})).map((e=>e.employee_id)),s=[...new Set(n)].length,a=r-s,i=[],c=o.length,l=o.filter((e=>"pending"===e.status)).length,d=o.filter((e=>"approved"===e.status)).length,u=o.filter((e=>"rejected"===e.status)).length,m=o.filter((e=>"paid"===e.type)).length,p=o.filter((e=>"unpaid"===e.type)).length,h=o.filter((e=>"sick"===e.type)).length,g=o.filter((e=>"other"===e.type)).length,x={};o.forEach((e=>{const r=new Date(e.start_date),t=r.getMonth(),o=r.getFullYear(),n=`${o}-${t}`;x[n]||(x[n]={month:t,year:o,count:0,approved:0,pending:0,rejected:0}),x[n].count++,"approved"===e.status?x[n].approved++:"pending"===e.status?x[n].pending++:"rejected"===e.status&&x[n].rejected++})),J({employees:{total:r,active:a,onVacation:s,departments:i},vacations:{total:c,pending:l,approved:d,rejected:u,byType:{paid:m,unpaid:p,sick:h,other:g},byMonth:x}})}}),[e,o,r,a]);const W=e=>0===L.vacations.total?0:Math.round(L.vacations.byType[e]/L.vacations.total*100),X=()=>0===L.employees.total?0:Math.round(L.employees.active/L.employees.total*100),G=()=>{const e=L.vacations.approved+L.vacations.rejected;return 0===e?0:Math.round(L.vacations.approved/e*100)};return(0,l.jsxs)(d,{children:[(0,l.jsxs)(u,{children:[(0,l.jsxs)(m,{children:[(0,l.jsx)(p,{children:"Statistiques"}),(0,l.jsx)(h,{children:"Consultez les statistiques et les analyses de votre organisation"})]}),(0,l.jsxs)(g,{onClick:()=>{t(),Y()},disabled:r||a,children:[(0,l.jsx)(s.jTZ,{size:16}),"Actualiser"]})]}),r||a?(0,l.jsxs)(I,{children:[(0,l.jsx)(s.jTZ,{size:24}),(0,l.jsx)("div",{children:"Chargement des statistiques..."})]}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsxs)(R,{children:[(0,l.jsx)(s.vQY,{size:18,color:"#4F46E5"}),"Vue d'ensemble"]}),(0,l.jsxs)(N,{children:[(0,l.jsxs)(O,{children:[(0,l.jsx)(q,{color:"#4F46E5",children:(0,l.jsx)(s.cfS,{})}),(0,l.jsx)(M,{children:L.employees.total}),(0,l.jsx)(H,{children:"Employ\xe9s au total"})]}),(0,l.jsxs)(O,{children:[(0,l.jsx)(q,{color:"#F59E0B",children:(0,l.jsx)(s.Ohp,{})}),(0,l.jsx)(M,{children:L.vacations.pending}),(0,l.jsx)(H,{children:"Demandes en attente"})]}),(0,l.jsxs)(O,{children:[(0,l.jsx)(q,{color:"#10B981",children:(0,l.jsx)(s.A3x,{})}),(0,l.jsx)(M,{children:L.vacations.approved}),(0,l.jsx)(H,{children:"Demandes approuv\xe9es"})]}),(0,l.jsxs)(O,{children:[(0,l.jsx)(q,{color:"#EF4444",children:(0,l.jsx)(s.q_G,{})}),(0,l.jsx)(M,{children:L.vacations.rejected}),(0,l.jsx)(H,{children:"Demandes rejet\xe9es"})]})]}),(0,l.jsxs)(x,{initial:"hidden",animate:"visible",variants:P,children:[(0,l.jsxs)(y,{variants:Z,children:[(0,l.jsxs)(j,{children:[(0,l.jsxs)(v,{children:[(0,l.jsx)(s.cfS,{size:18,color:"#4F46E5"}),"Employ\xe9s"]}),(0,l.jsx)(f,{color:"#4F46E5",children:(0,l.jsx)(s.cfS,{})})]}),(0,l.jsx)(b,{children:r?(0,l.jsxs)(I,{children:[(0,l.jsx)(s.jTZ,{size:24}),(0,l.jsx)("div",{children:"Chargement..."})]}):(0,l.jsxs)($,{children:[(0,l.jsx)(w,{color:"#4F46E5",children:L.employees.total}),(0,l.jsx)(A,{children:"Employ\xe9s au total"})]})}),(0,l.jsxs)(k,{children:[(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#10B981"}),"Actifs"]}),(0,l.jsx)(D,{children:L.employees.active})]}),(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#EC4899"}),"En cong\xe9"]}),(0,l.jsx)(D,{children:L.employees.onVacation})]}),(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#4F46E5"}),"Taux de pr\xe9sence"]}),(0,l.jsxs)(D,{children:[X(),"%"]})]})]}),(0,l.jsx)(E,{value:X(),color:"#4F46E5"})]}),(0,l.jsxs)(y,{variants:Z,children:[(0,l.jsxs)(j,{children:[(0,l.jsxs)(v,{children:[(0,l.jsx)(s.Wh$,{size:18,color:"#EC4899"}),"Types de cong\xe9s"]}),(0,l.jsx)(f,{color:"#EC4899",children:(0,l.jsx)(s.Wh$,{})})]}),(0,l.jsx)(b,{children:a?(0,l.jsxs)(I,{children:[(0,l.jsx)(s.jTZ,{size:24}),(0,l.jsx)("div",{children:"Chargement..."})]}):(0,l.jsxs)($,{children:[(0,l.jsx)(w,{color:"#EC4899",children:L.vacations.total}),(0,l.jsx)(A,{children:"Demandes de cong\xe9s"})]})}),(0,l.jsxs)(C,{children:[(0,l.jsxs)(z,{children:[(0,l.jsxs)(V,{children:[(0,l.jsx)(T,{color:"#4F46E5"}),"Cong\xe9s pay\xe9s"]}),(0,l.jsx)(F,{percentage:W("paid"),color:"#4F46E5"}),(0,l.jsx)(B,{children:L.vacations.byType.paid})]}),(0,l.jsxs)(z,{children:[(0,l.jsxs)(V,{children:[(0,l.jsx)(T,{color:"#F59E0B"}),"Cong\xe9s non pay\xe9s"]}),(0,l.jsx)(F,{percentage:W("unpaid"),color:"#F59E0B"}),(0,l.jsx)(B,{children:L.vacations.byType.unpaid})]}),(0,l.jsxs)(z,{children:[(0,l.jsxs)(V,{children:[(0,l.jsx)(T,{color:"#10B981"}),"Cong\xe9s maladie"]}),(0,l.jsx)(F,{percentage:W("sick"),color:"#10B981"}),(0,l.jsx)(B,{children:L.vacations.byType.sick})]}),(0,l.jsxs)(z,{children:[(0,l.jsxs)(V,{children:[(0,l.jsx)(T,{color:"#8B5CF6"}),"Autres cong\xe9s"]}),(0,l.jsx)(F,{percentage:W("other"),color:"#8B5CF6"}),(0,l.jsx)(B,{children:L.vacations.byType.other})]})]})]}),(0,l.jsxs)(y,{variants:Z,children:[(0,l.jsxs)(j,{children:[(0,l.jsxs)(v,{children:[(0,l.jsx)(s.eXT,{size:18,color:"#10B981"}),"Statut des demandes"]}),(0,l.jsx)(f,{color:"#10B981",children:(0,l.jsx)(s.eXT,{})})]}),(0,l.jsx)(b,{children:a?(0,l.jsxs)(I,{children:[(0,l.jsx)(s.jTZ,{size:24}),(0,l.jsx)("div",{children:"Chargement..."})]}):(0,l.jsxs)($,{children:[(0,l.jsxs)(w,{color:"#10B981",children:[G(),"%"]}),(0,l.jsx)(A,{children:"Taux d'approbation"})]})}),(0,l.jsxs)(k,{children:[(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#F59E0B"}),"En attente"]}),(0,l.jsx)(D,{color:"#F59E0B",children:L.vacations.pending})]}),(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#10B981"}),"Approuv\xe9es"]}),(0,l.jsx)(D,{color:"#10B981",children:L.vacations.approved})]}),(0,l.jsxs)(S,{children:[(0,l.jsxs)(_,{children:[(0,l.jsx)(T,{color:"#EF4444"}),"Rejet\xe9es"]}),(0,l.jsx)(D,{color:"#EF4444",children:L.vacations.rejected})]})]}),(0,l.jsx)(E,{value:G(),color:"#10B981"})]})]})]})]})}}}]);
//# sourceMappingURL=764.719754f3.chunk.js.map