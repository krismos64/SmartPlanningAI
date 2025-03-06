"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[524],{2479:(e,r,t)=>{t.d(r,{A:()=>l});var o=t(5043),s=t(3768),n=t(4227),a=t(4634);const l=()=>{const[e,r]=(0,o.useState)([]),[t,l]=(0,o.useState)(!0),[i,c]=(0,o.useState)(null),d=(0,a.A)(),u=(0,o.useCallback)((async()=>{t||l(!0);try{const t=await d.get(n.Sn.EMPLOYEES.BASE);var e;if(!t.ok)throw new Error((null===(e=t.data)||void 0===e?void 0:e.message)||"Erreur lors du chargement des employ\xe9s");{const e=Array.isArray(t.data)?t.data:[];r(e),c(null)}}catch(o){console.error("Erreur lors du chargement des employ\xe9s:",o),c("Erreur lors du chargement des employ\xe9s"),s.oR.error("Erreur lors du chargement des employ\xe9s"),r([])}finally{l(!1)}}),[d,t]),m=(0,o.useCallback)((async e=>{l(!0),c(null);try{const t=await d.get(n.Sn.EMPLOYEES.BY_ID(e));if(t.ok)return t.data;var r;throw new Error((null===(r=t.data)||void 0===r?void 0:r.message)||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9")}catch(t){return console.error(`Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9 #${e}:`,t),c(t.message||"Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),s.oR.error("Erreur lors de la r\xe9cup\xe9ration de l'employ\xe9"),null}finally{l(!1)}}),[d]),h=(0,o.useCallback)((async e=>{try{console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour cr\xe9ation:",e);const o={...e,contractHours:parseFloat(e.contractHours)||35,hourlyRate:parseFloat(e.hourlyRate)||0},s=await d.post(n.Sn.EMPLOYEES.BASE,o);if(console.log("R\xe9ponse de l'API pour cr\xe9ation:",s),!s.ok){var t;const e=(null===(t=s.data)||void 0===t?void 0:t.message)||"Erreur lors de la cr\xe9ation de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}return r((e=>[...e,s.data])),{success:!0,employee:s.data}}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'employ\xe9:",o),{success:!1,error:o.message||"Erreur inconnue"}}}),[d]),p=(0,o.useCallback)((async(e,t)=>{try{if(!e)return console.error("ID d'employ\xe9 non valide:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Donn\xe9es envoy\xe9es \xe0 l'API pour mise \xe0 jour:",t);const s={...t,contractHours:parseFloat(t.contractHours)||35,hourlyRate:parseFloat(t.hourlyRate)||0},a=await d.put(n.Sn.EMPLOYEES.BY_ID(e),s);if(console.log("R\xe9ponse de l'API pour mise \xe0 jour:",a),!a.ok){var o;const e=(null===(o=a.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}return r((r=>r.map((r=>r.id===e?{...r,...a.data}:r)))),{success:!0,employee:a.data}}catch(s){return console.error("Erreur lors de la mise \xe0 jour de l'employ\xe9:",s),{success:!1,error:s.message||"Erreur inconnue"}}}),[d]),y=(0,o.useCallback)((async e=>{try{if(!e)return console.error("ID d'employ\xe9 non valide pour suppression:",e),{success:!1,error:"ID d'employ\xe9 non valide"};console.log("Tentative de suppression de l'employ\xe9 avec ID:",e);const o=await d.delete(n.Sn.EMPLOYEES.BY_ID(e));if(console.log("R\xe9ponse de l'API pour suppression:",o),!o.ok){var t;const e=(null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de l'employ\xe9";return console.error("Erreur API:",e),{success:!1,error:e}}return r((r=>r.filter((r=>r.id!==e)))),{success:!0}}catch(o){return console.error("Erreur lors de la suppression de l'employ\xe9:",o),{success:!1,error:o.message||"Erreur inconnue"}}}),[d]),g=(0,o.useCallback)((r=>r&&"all"!==r?e.filter((e=>e.status===r)):e),[e]);return(0,o.useEffect)((()=>{let e=!0,t=0;const o=async()=>{if(t>=3)e&&(c("Erreur lors du chargement des employ\xe9s apr\xe8s plusieurs tentatives"),l(!1));else try{const t=await d.get(n.Sn.EMPLOYEES.BASE);e&&t.ok&&(r(t.data),c(null))}catch(s){if(e)return console.error("Erreur lors du chargement des employ\xe9s:",s),t++,void setTimeout(o,1e3*Math.pow(2,t))}finally{e&&l(!1)}};return o(),()=>{e=!1}}),[d]),{employees:e,loading:t,error:i,fetchEmployees:u,fetchEmployeeById:m,createEmployee:h,updateEmployee:p,deleteEmployee:y,getEmployeesByStatus:g}}},2524:(e,r,t)=>{t.r(r),t.d(r,{default:()=>ke});var o=t(3750),s=t.n(o),n=t(5464),a=t(6213),l=t(5200),i=t(2479),c=t(5043),d=t(3768),u=t(4227),m=t(4634);const h=()=>{const[e,r]=(0,c.useState)(null),[t,o]=(0,c.useState)(!0),[s,n]=(0,c.useState)(null),a=(0,m.A)(),l=(0,c.useCallback)((async()=>{try{o(!0);const t=await a.get(u.Sn.VACATIONS_STATS);var e;if(!t.ok)throw new Error((null===(e=t.data)||void 0===e?void 0:e.message)||"Erreur lors du chargement des statistiques de cong\xe9s");r(t.data),n(null)}catch(t){console.error("Erreur lors du chargement des statistiques de cong\xe9s:",t),n("Erreur lors du chargement des statistiques de cong\xe9s"),d.oR.error("Erreur lors du chargement des statistiques de cong\xe9s")}finally{o(!1)}}),[a]);return(0,c.useEffect)((()=>{l()}),[l]),{stats:e,loading:t,error:s,fetchStats:l}};var p=t(579);const y=n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`,g=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
`,x=n.Ay.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`,v=n.Ay.h3`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0;
`,f=n.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,b=n.Ay.div`
  font-size: 1.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,$=n.Ay.div`
  text-align: center;
  padding: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,j=()=>{const{employees:e,loading:r}=(0,i.A)(),{pendingVacations:t,employeesOnDayOff:o,employeesOnVacation:s,loading:n}=h(),a=r||n;return(0,p.jsx)(y,{children:a?(0,p.jsx)($,{children:"Chargement des statistiques..."}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsxs)(g,{children:[(0,p.jsxs)(x,{children:[(0,p.jsx)(v,{children:"Total employ\xe9s"}),(0,p.jsx)(f,{color:"#4F46E5",children:(0,p.jsx)(l.cfS,{})})]}),(0,p.jsx)(b,{children:(null===e||void 0===e?void 0:e.length)||0})]}),(0,p.jsxs)(g,{children:[(0,p.jsxs)(x,{children:[(0,p.jsx)(v,{children:"Cong\xe9s en attente"}),(0,p.jsx)(f,{color:"#F59E0B",children:(0,p.jsx)(l.Ohp,{})})]}),(0,p.jsx)(b,{children:t})]}),(0,p.jsxs)(g,{children:[(0,p.jsxs)(x,{children:[(0,p.jsx)(v,{children:"Personnes en repos aujourd'hui"}),(0,p.jsx)(f,{color:"#10B981",children:(0,p.jsx)(l.Wh$,{})})]}),(0,p.jsx)(b,{children:o})]}),(0,p.jsxs)(g,{children:[(0,p.jsxs)(x,{children:[(0,p.jsx)(v,{children:"Personnes en cong\xe9s aujourd'hui"}),(0,p.jsx)(f,{color:"#3B82F6",children:(0,p.jsx)(l.wIk,{})})]}),(0,p.jsx)(b,{children:s})]})]})})};var A=t(5016),E=t(2693);const w=()=>{const[e,r]=(0,c.useState)([]),[t,o]=(0,c.useState)(!0),[s,n]=(0,c.useState)(null),a=(0,m.A)(),{user:i}=(0,A.A)(),{activities:h,socket:y,requestActivitiesUpdate:g,fallbackMode:x}=(0,E.A)(),v=(0,c.useCallback)((async function(){try{o(!0);const t=await a.get(u.Sn.ACTIVITIES.BASE);var e;if(!t.ok)throw new Error((null===(e=t.data)||void 0===e?void 0:e.message)||"Erreur lors du chargement des activit\xe9s");{const e=Array.isArray(t.data)?t.data:[];r(e),n(null)}}catch(t){console.error("Erreur lors du chargement des activit\xe9s:",t),n("Erreur lors du chargement des activit\xe9s"),d.oR.error("Erreur lors du chargement des activit\xe9s"),r([])}finally{o(!1)}}),[a]),f=(0,c.useCallback)((async e=>{try{const o=await a.post(u.Sn.ACTIVITIES.BASE,e);if(o.ok)return r((e=>[...e,o.data])),d.oR.success("Activit\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,activity:o.data};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la cr\xe9ation de l'activit\xe9")}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'activit\xe9:",o),d.oR.error("Erreur lors de la cr\xe9ation de l'activit\xe9"),{success:!1,error:o.message}}}),[a]),b=(0,c.useCallback)((async(e,t)=>{try{const s=await a.put(`${u.Sn.ACTIVITIES.BASE}/${e}`,t);if(s.ok)return r((r=>r.map((r=>r.id===e?{...r,...s.data}:r)))),d.oR.success("Activit\xe9 mise \xe0 jour avec succ\xe8s"),{success:!0,activity:s.data};var o;throw new Error((null===(o=s.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'activit\xe9")}catch(s){return console.error("Erreur lors de la mise \xe0 jour de l'activit\xe9:",s),d.oR.error("Erreur lors de la mise \xe0 jour de l'activit\xe9"),{success:!1,error:s.message}}}),[a]),$=(0,c.useCallback)((async e=>{try{const o=await a.delete(`${u.Sn.ACTIVITIES.BASE}/${e}`);if(o.ok)return r((r=>r.filter((r=>r.id!==e)))),d.oR.success("Activit\xe9 supprim\xe9e avec succ\xe8s"),{success:!0};var t;throw new Error((null===(t=o.data)||void 0===t?void 0:t.message)||"Erreur lors de la suppression de l'activit\xe9")}catch(o){return console.error("Erreur lors de la suppression de l'activit\xe9:",o),d.oR.error("Erreur lors de la suppression de l'activit\xe9"),{success:!1,error:o.message}}}),[a]),j=(0,c.useCallback)((e=>{if(!e)return"";const{type:r,entityType:t,entityId:o,userId:s,details:n}=e;let a=`${e.userName||"Un utilisateur"} ${{create:"a cr\xe9\xe9",update:"a modifi\xe9",delete:"a supprim\xe9",approve:"a approuv\xe9",reject:"a rejet\xe9"}[r]||r} ${{employee:"un employ\xe9",schedule:"un planning",vacation:"une demande de cong\xe9",shift:"un horaire",user:"un utilisateur"}[t]||t}`;if(n)if("string"===typeof n)a+=` : ${n}`;else if("object"===typeof n){a+=` : ${Object.entries(n).map((e=>{let[r,t]=e;return`${r}: ${t}`})).join(", ")}`}return a}),[]),w=(0,c.useCallback)((e=>{if(!e)return"";const r=new Date(e),t=new Date-r,o=Math.floor(t/1e3),s=Math.floor(o/60),n=Math.floor(s/60),a=Math.floor(n/24);return o<60?"\xe0 l'instant":s<60?`il y a ${s} minute${s>1?"s":""}`:n<24?`il y a ${n} heure${n>1?"s":""}`:a<7?`il y a ${a} jour${a>1?"s":""}`:r.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}),[]),k=(0,c.useCallback)((e=>{switch(e){case"create":return(0,p.jsx)(l.GGD,{});case"update":return(0,p.jsx)(l.SG1,{});case"delete":return(0,p.jsx)(l.IXo,{});case"approve":return(0,p.jsx)(l.YrT,{});case"reject":return(0,p.jsx)(l.yGN,{});default:return null}}),[]);return(0,c.useEffect)((()=>{h&&Array.isArray(h)&&h.length>0&&(console.log("Nouvelles activit\xe9s re\xe7ues via WebSocket:",h),r((e=>{const r=Array.isArray(e)?e:[],t=new Map;return h.forEach((e=>{t.set(e.id,e)})),r.forEach((e=>{t.has(e.id)||t.set(e.id,e)})),Array.from(t.values()).sort(((e,r)=>new Date(r.timestamp)-new Date(e.timestamp)))})),o(!1))}),[h]),(0,c.useEffect)((()=>{v();const e=setInterval((()=>{v()}),12e4);return()=>clearInterval(e)}),[v]),(0,c.useEffect)((()=>{y&&!x?(console.log("WebSocket connect\xe9, on va rafra\xeechir les activit\xe9s"),g()):x&&(console.log("Mode de secours WebSocket actif, utilisation de l'API REST"),v())}),[y,g,x,v]),(0,c.useEffect)((()=>{x&&(console.log("Passage en mode de secours, r\xe9cup\xe9ration des activit\xe9s via API REST"),v())}),[x,v]),{activities:e,loading:t,error:s,fetchActivities:v,createActivity:f,updateActivity:b,deleteActivity:$,getActivityIcon:k,formatActivityDescription:j,formatActivityDate:w}},k=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  margin-bottom: 1.5rem;
`,S=n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`,C=n.Ay.h3`
  font-size: 1.2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
`,T=n.Ay.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  cursor: pointer;
  font-size: 0.875rem;
  padding: 0.5rem;
  transition: color 0.2s ease;

  &:hover {
    color: ${e=>{let{theme:r}=e;return r.colors.primaryDark}};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`,I=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,R=n.Ay.div`
  display: flex;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,P=n.Ay.div`
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
`,L=n.Ay.div`
  flex: 1;
`,z=n.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,D=n.Ay.div`
  font-size: 0.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,B=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,M=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
`,F=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,O=n.Ay.button`
  display: block;
  width: 100%;
  background-color: transparent;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.primary}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 0.5rem;
  margin-top: 1rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,q=e=>{switch(e){case"create":return"#10B981";case"update":return"#F59E0B";case"delete":return"#EF4444";case"approve":return"#3B82F6";default:return"#4F46E5"}},N=e=>{switch(e){case"create":return"+";case"update":return"\u270e";case"delete":return"\u2212";case"approve":return"\u2713";default:return"\u2022"}},W=()=>{const{activities:e,loading:r,error:t,fetchActivities:o,formatActivityDescription:s,formatActivityDate:n}=w(),a=Array.isArray(e)?e:[];return(0,p.jsxs)(k,{children:[(0,p.jsxs)(S,{children:[(0,p.jsx)(C,{children:"Activit\xe9s r\xe9centes"}),(0,p.jsxs)(T,{onClick:()=>{o(!0)},disabled:r,children:[(0,p.jsx)(l.jTZ,{className:r?"animate-spin":"",size:16}),"Rafra\xeechir"]})]}),r?(0,p.jsx)(B,{children:"Chargement des activit\xe9s..."}):t?(0,p.jsx)(M,{children:"Une erreur est survenue lors du chargement des activit\xe9s."}):0===a.length?(0,p.jsx)(F,{children:"Aucune activit\xe9 r\xe9cente."}):(0,p.jsxs)(p.Fragment,{children:[(0,p.jsx)(I,{children:a.slice(0,5).map((e=>(0,p.jsxs)(R,{children:[(0,p.jsx)(P,{color:q(e.type),children:N(e.type)}),(0,p.jsxs)(L,{children:[(0,p.jsx)(z,{children:s(e)}),(0,p.jsx)(D,{children:n(e.timestamp)})]})]},e.id)))}),a.length>5&&(0,p.jsx)(O,{children:"Voir toutes les activit\xe9s"})]})]})},U=n.Ay.div`
  position: relative;
  width: 100%;
  max-width: ${e=>{let{expanded:r}=e;return r?"600px":"300px"}};
  transition: max-width 0.3s ease;
`,H=n.Ay.div`
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
`,V=n.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
`,_=n.Ay.input`
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
`,Y=n.Ay.button`
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
`,G=n.Ay.button`
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
`,J=n.Ay.div`
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
`,Z=n.Ay.div`
  padding: 0.5rem 0;

  &:not(:last-child) {
    border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  }
`,Q=n.Ay.div`
  padding: 0.5rem 1rem;
  font-size: 0.75rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.semiBold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`,X=n.Ay.div`
  padding: 0.75rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}11`}};
  }
`,K=n.Ay.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:r,color:t}=e;return t?`${t}22`:`${r.colors.primary}22`}};
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`,ee=n.Ay.div`
  flex: 1;
`,re=n.Ay.div`
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,te=n.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,oe=n.Ay.span`
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}33`}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  padding: 0 0.25rem;
  border-radius: 2px;
`,se=n.Ay.div`
  padding: 1.5rem;
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,ne=n.Ay.div`
  padding: 1rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  margin-top: 0.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: ${e=>{let{visible:r}=e;return r?"block":"none"}};
`,ae=n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`,le=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,ie=n.Ay.label`
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,ce=n.Ay.select`
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
`,de=n.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`,ue=n.Ay.button`
  padding: 0.5rem 1rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 0.875rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.medium}};
  cursor: pointer;
  transition: all 0.2s ease;

  ${e=>{let{primary:r,theme:t}=e;return r?`\n    background-color: ${t.colors.primary};\n    color: white;\n    border: 1px solid ${t.colors.primary};\n    \n    &:hover {\n      background-color: ${t.colors.primary}dd;\n    }\n  `:`\n    background-color: transparent;\n    color: ${t.colors.text.primary};\n    border: 1px solid ${t.colors.border};\n    \n    &:hover {\n      background-color: ${t.colors.background};\n      border-color: ${t.colors.text.secondary};\n    }\n  `}}
`,me=()=>(0,p.jsx)("svg",{width:"18",height:"18",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,p.jsx)("path",{d:"M21 21L15 15M17 10C17 13.866 13.866 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10Z",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),he=()=>(0,p.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,p.jsx)("path",{d:"M18 6L6 18M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),pe=()=>(0,p.jsx)("svg",{width:"16",height:"16",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:(0,p.jsx)("path",{d:"M19 9L12 16L5 9",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})}),ye=e=>{let{placeholder:r="Rechercher...",onSearch:t}=e;const[o,s]=(0,c.useState)(""),[n,a]=(0,c.useState)(!1),[l,i]=(0,c.useState)(!1),[d,u]=(0,c.useState)(!1),[m,h]=(0,c.useState)(!1),[y,g]=(0,c.useState)([]),[x,v]=(0,c.useState)({type:"all",date:"all",status:"all"}),f=(0,c.useRef)(null),b=(0,c.useRef)(null);(0,c.useEffect)((()=>{const e=e=>{f.current&&!f.current.contains(e.target)&&(a(!1),u(!1))};return document.addEventListener("mousedown",e),()=>{document.removeEventListener("mousedown",e)}}),[]),(0,c.useEffect)((()=>{if(o.length>0){const e=((e,r)=>{if(!e)return[];const t=e.toLowerCase();let o=[{id:1,type:"employee",name:"Sophie Martin",role:"Designer",icon:"\ud83d\udc69\u200d\ud83c\udfa8",color:"#4F46E5"},{id:2,type:"employee",name:"Thomas Dubois",role:"D\xe9veloppeur",icon:"\ud83d\udc68\u200d\ud83d\udcbb",color:"#4F46E5"},{id:3,type:"employee",name:"Julie Lefebvre",role:"Marketing",icon:"\ud83d\udc69\u200d\ud83d\udcbc",color:"#4F46E5"},{id:4,type:"employee",name:"Nicolas Moreau",role:"Comptable",icon:"\ud83d\udc68\u200d\ud83d\udcbc",color:"#4F46E5"}].filter((e=>e.name.toLowerCase().includes(t)||e.role.toLowerCase().includes(t))),s=[{id:1,type:"event",name:"R\xe9union d'\xe9quipe",date:"15 Mars 2023",icon:"\ud83d\udcc5",color:"#10B981"},{id:2,type:"event",name:"Pr\xe9sentation client",date:"22 Mars 2023",icon:"\ud83d\udcca",color:"#10B981"},{id:3,type:"event",name:"Formation Excel",date:"5 Avril 2023",icon:"\ud83d\udcda",color:"#10B981"}].filter((e=>e.name.toLowerCase().includes(t)||e.date.toLowerCase().includes(t))),n=[{id:1,type:"vacation",name:"Cong\xe9s d'\xe9t\xe9",employee:"Sophie Martin",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"},{id:2,type:"vacation",name:"RTT",employee:"Thomas Dubois",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"},{id:3,type:"vacation",name:"Cong\xe9 maladie",employee:"Julie Lefebvre",icon:"\ud83c\udfd6\ufe0f",color:"#F59E0B"}].filter((e=>e.name.toLowerCase().includes(t)||e.employee.toLowerCase().includes(t)));"all"!==r.type&&("employees"===r.type?(s=[],n=[]):"events"===r.type?(o=[],n=[]):"vacations"===r.type&&(o=[],s=[]));const a=[];return o.length>0&&a.push({title:"Employ\xe9s",items:o}),s.length>0&&a.push({title:"\xc9v\xe9nements",items:s}),n.length>0&&a.push({title:"Cong\xe9s",items:n}),a})(o,x);g(e),u(!0)}else g([]),u(!1)}),[o,x]);const $=e=>{v({...x,[e.target.name]:e.target.value})},j=(e,r)=>{if(!r)return e;return e.split(new RegExp(`(${r})`,"gi")).map(((e,t)=>e.toLowerCase()===r.toLowerCase()?(0,p.jsx)(oe,{children:e},t):e))};return(0,p.jsx)("div",{ref:f,children:(0,p.jsxs)(U,{expanded:l,children:[(0,p.jsxs)(H,{focused:n,children:[(0,p.jsx)(V,{children:(0,p.jsx)(me,{})}),(0,p.jsx)(_,{ref:b,type:"text",placeholder:r,value:o,onChange:e=>{s(e.target.value)},onFocus:()=>{a(!0),o.length>0&&u(!0)}}),(0,p.jsx)(Y,{visible:o.length>0,onClick:()=>{s(""),b.current.focus()},"aria-label":"Effacer la recherche",children:(0,p.jsx)(he,{})}),(0,p.jsx)(G,{expanded:l,onClick:()=>{i(!l),h(!m)},"aria-label":"Recherche avanc\xe9e",children:(0,p.jsx)(pe,{})})]}),(0,p.jsxs)(ne,{visible:m,children:[(0,p.jsxs)(ae,{children:[(0,p.jsxs)(le,{children:[(0,p.jsx)(ie,{htmlFor:"type",children:"Type"}),(0,p.jsxs)(ce,{id:"type",name:"type",value:x.type,onChange:$,children:[(0,p.jsx)("option",{value:"all",children:"Tous"}),(0,p.jsx)("option",{value:"employees",children:"Employ\xe9s"}),(0,p.jsx)("option",{value:"events",children:"\xc9v\xe9nements"}),(0,p.jsx)("option",{value:"vacations",children:"Cong\xe9s"})]})]}),(0,p.jsxs)(le,{children:[(0,p.jsx)(ie,{htmlFor:"date",children:"Date"}),(0,p.jsxs)(ce,{id:"date",name:"date",value:x.date,onChange:$,children:[(0,p.jsx)("option",{value:"all",children:"Toutes les dates"}),(0,p.jsx)("option",{value:"today",children:"Aujourd'hui"}),(0,p.jsx)("option",{value:"week",children:"Cette semaine"}),(0,p.jsx)("option",{value:"month",children:"Ce mois"}),(0,p.jsx)("option",{value:"year",children:"Cette ann\xe9e"})]})]}),(0,p.jsxs)(le,{children:[(0,p.jsx)(ie,{htmlFor:"status",children:"Statut"}),(0,p.jsxs)(ce,{id:"status",name:"status",value:x.status,onChange:$,children:[(0,p.jsx)("option",{value:"all",children:"Tous les statuts"}),(0,p.jsx)("option",{value:"active",children:"Actif"}),(0,p.jsx)("option",{value:"pending",children:"En attente"}),(0,p.jsx)("option",{value:"completed",children:"Termin\xe9"})]})]})]}),(0,p.jsxs)(de,{children:[(0,p.jsx)(ue,{onClick:()=>{v({type:"all",date:"all",status:"all"})},children:"R\xe9initialiser"}),(0,p.jsx)(ue,{primary:!0,children:"Appliquer"})]})]}),(0,p.jsx)(J,{visible:d&&y.length>0,children:y.map(((e,r)=>(0,p.jsxs)(Z,{children:[(0,p.jsx)(Q,{children:e.title}),e.items.map(((e,s)=>(0,p.jsxs)(X,{onClick:()=>(e=>{t&&t(e),u(!1)})(e),children:[(0,p.jsx)(K,{color:e.color,children:e.icon}),(0,p.jsxs)(ee,{children:[(0,p.jsx)(re,{children:j(e.name,o)}),(0,p.jsxs)(te,{children:["employee"===e.type&&j(e.role,o),"event"===e.type&&j(e.date,o),"vacation"===e.type&&j(e.employee,o)]})]})]},`${r}-${s}`)))]},r)))}),d&&o.length>0&&0===y.length&&(0,p.jsx)(J,{visible:!0,children:(0,p.jsxs)(se,{children:['Aucun r\xe9sultat trouv\xe9 pour "',o,'"']})})]})})},ge=n.Ay.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,xe=n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`,ve=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`,fe=n.Ay.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`,be=n.Ay.div`
  display: flex;
  flex-direction: column;
`,$e=n.Ay.h1`
  font-size: 1.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
`,je=n.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin: 0.5rem 0 0 0;
`,Ae=n.Ay.div`
  margin-bottom: 2rem;
`,Ee=n.Ay.div`
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
`,we=n.Ay.div`
  margin-bottom: 2rem;
`,ke=(n.Ay.div`
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
`,()=>{const{user:e}=(0,A.A)();return(0,p.jsxs)(ge,{children:[(0,p.jsx)(xe,{children:(0,p.jsxs)(ve,{children:[(0,p.jsx)(fe,{children:(0,p.jsx)(s(),{animationData:a,loop:!0,style:{width:"100%",height:"100%"}})}),(0,p.jsxs)(be,{children:[(0,p.jsx)($e,{children:"Tableau de bord"}),(0,p.jsx)(je,{children:"Bienvenue sur votre assistant de planification intelligent"})]})]})}),(0,p.jsx)(Ae,{children:(0,p.jsxs)(Ee,{children:[(0,p.jsxs)("h1",{children:["Bonjour, ",e?e.first_name&&e.last_name?`${e.first_name} ${e.last_name}`:e.username||"Utilisateur":"Utilisateur","!"]}),(0,p.jsx)("p",{children:"Bienvenue sur votre tableau de bord. Voici un aper\xe7u de votre activit\xe9 r\xe9cente."})]})}),(0,p.jsx)(we,{children:(0,p.jsx)(ye,{placeholder:"Rechercher un employ\xe9, un \xe9v\xe9nement...",onSearch:e=>{console.log("Recherche:",e)}})}),(0,p.jsx)(j,{}),(0,p.jsx)(W,{})]})})},4634:(e,r,t)=>{t.d(r,{A:()=>a});var o=t(5043),s=t(3768),n=t(4227);const a=()=>{const e=(0,o.useCallback)((async e=>{try{const r={};e.headers.forEach(((e,t)=>{r[t]=e})),console.log("R\xe9ponse du serveur:",{url:e.url,status:e.status,statusText:e.statusText,headers:r});const t=e.headers.get("content-type");let o;if(t&&t.includes("application/json"))o=await e.json();else{const r=await e.text();console.warn("R\xe9ponse non-JSON re\xe7ue:",r),o={message:r}}if(e.ok)return o;{401!==e.status&&403!==e.status||(console.error("Erreur d'authentification:",o),s.oR.error("Session expir\xe9e ou acc\xe8s non autoris\xe9. Veuillez vous reconnecter."),setTimeout((()=>{window.location.href="/login"}),2e3)),500===e.status&&(console.error("Erreur serveur:",o),console.error("URL:",e.url),console.error("M\xe9thode:",e.method),o.error&&console.error("D\xe9tails de l'erreur:",o.error),o.stack&&console.error("Stack trace:",o.stack));const r=o.message||o.error||e.statusText||"Erreur inconnue",t=new Error(r);throw t.status=e.status,t.response={status:e.status,data:o},t}}catch(r){throw console.error("Erreur lors du traitement de la r\xe9ponse:",r),r}}),[]);return(0,o.useMemo)((()=>({get:async r=>{try{console.log(`[API] GET ${r}`);const t=localStorage.getItem("token"),o=await fetch(`${n.H$}${r}`,{method:"GET",headers:{"Content-Type":"application/json",Authorization:t?`Bearer ${t}`:""},credentials:"include"}),s=await e(o);return console.log(`[API] GET ${r} Response:`,s),s}catch(t){return console.error(`[API] GET ${r} Error:`,t),{ok:!1,status:0,data:{message:t.message||"Erreur lors de la requ\xeate GET"},headers:new Headers}}},post:async(r,t)=>{try{if(!t||"object"!==typeof t)throw console.error("Donn\xe9es invalides pour la requ\xeate POST:",t),new Error("Donn\xe9es invalides pour la requ\xeate POST");const s={};for(const e in t)s[(o=e,o.replace(/[A-Z]/g,(e=>`_${e.toLowerCase()}`)))]=t[e];const a=localStorage.getItem("token");if(!a)throw console.error("Token d'authentification manquant"),new Error("Vous devez \xeatre connect\xe9 pour effectuer cette action");const l={"Content-Type":"application/json",Authorization:`Bearer ${a}`};console.log("D\xe9tails de la requ\xeate POST:",{endpoint:r,dataSize:JSON.stringify(s).length,headers:{...l,Authorization:"Bearer [MASQU\xc9]"}});const i=new AbortController,c=setTimeout((()=>i.abort()),3e4),d=await fetch(`${n.H$}${r}`,{method:"POST",headers:l,body:JSON.stringify(s),signal:i.signal});return clearTimeout(c),e(d)}catch(s){if("AbortError"===s.name)throw console.error("La requ\xeate a \xe9t\xe9 interrompue (timeout):",s),new Error("La requ\xeate a pris trop de temps, veuillez r\xe9essayer");if(s.message.includes("NetworkError")||s.message.includes("Failed to fetch"))throw console.error("Erreur r\xe9seau lors de la requ\xeate POST:",s),new Error("Probl\xe8me de connexion au serveur, veuillez v\xe9rifier votre connexion internet");throw console.error("Erreur lors de la requ\xeate POST:",s),s}var o},put:async(r,t)=>{try{console.log(`[API] PUT ${r}`,t);const o=localStorage.getItem("token"),s=JSON.parse(JSON.stringify(t)),a=await fetch(`${n.H$}${r}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:o?`Bearer ${o}`:""},body:JSON.stringify(s),credentials:"include"}),l=await e(a);return console.log(`[API] PUT ${r} Response:`,l),l}catch(o){return console.error(`[API] PUT ${r} Error:`,o),{ok:!1,status:0,data:{message:o.message||"Erreur lors de la requ\xeate PUT"},headers:new Headers}}},delete:async r=>{try{console.log(`[API] DELETE ${r}`);const t=localStorage.getItem("token"),o=await fetch(`${n.H$}${r}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:t?`Bearer ${t}`:""},credentials:"include"}),s=await e(o);return console.log(`[API] DELETE ${r} Response:`,s),s}catch(t){return console.error(`[API] DELETE ${r} Error:`,t),{ok:!1,status:0,data:{message:t.message||"Erreur lors de la requ\xeate DELETE"},headers:new Headers}}}})),[e])}}}]);
//# sourceMappingURL=524.9325b942.chunk.js.map