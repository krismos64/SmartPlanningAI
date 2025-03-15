"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[968],{3968:(e,t,r)=>{r.r(t),r.d(t,{default:()=>W});var o=r(6226),a=r(5043),s=r(5200),n=r(1529),i=r(7013),c=r(579);const l=(e,t)=>{if("vacation"===t)return"#6366F1";switch(e){case"create":return"#10B981";case"update":return"#F59E0B";case"delete":return"#EF4444";case"approve":return"#3B82F6";case"reject":return"#EC4899";case"system":return"#8B5CF6";case"vacation_status_update":return"#6366F1";default:return"#4F46E5"}},d=(e,t)=>{if("vacation"===t)return(0,c.jsx)(s.Wh$,{});switch(e){case"create":return(0,c.jsx)(s.GGD,{});case"update":return(0,c.jsx)(s.SG1,{});case"delete":return(0,c.jsx)(s.IXo,{});case"approve":return(0,c.jsx)(s.YrT,{});case"reject":return(0,c.jsx)(s.yGN,{});case"system":default:return(0,c.jsx)(s.S8s,{});case"vacation_status_update":return(0,c.jsx)(s.Wh$,{})}},u=e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}},p=(e,t,r)=>{if("vacation"===t){let t="";switch(r&&"object"===typeof r&&(r.type?t=u(r.type):r.vacation_type&&(t=u(r.vacation_type))),e){case"create":return"Nouvelle demande"+(t?" "+t:"");case"update":return"Modification cong\xe9"+(t?" "+t:"");case"delete":return"Suppression cong\xe9"+(t?" "+t:"");case"approve":return"Approbation cong\xe9"+(t?" "+t:"");case"reject":return"Rejet cong\xe9"+(t?" "+t:"");case"vacation_status_update":let e="";return r&&"object"===typeof r&&r.new_status&&(e=(e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}})(r.new_status)),`Cong\xe9 ${e}${t?" "+t:""}`;default:return"Cong\xe9"+(t?" "+t:"")}}switch(e){case"create":return"Cr\xe9ation";case"update":return"Modification";case"delete":return"Suppression";case"approve":return"Approbation";case"reject":return"Rejet";case"system":return"Syst\xe8me";case"vacation_status_update":return"Mise \xe0 jour statut";default:return"Information"}};var m=r(1734);const y=n.Ay.div`
  padding: 2rem;
`,h=n.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`,g=n.Ay.h1`
  font-size: 1.8rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  margin: 0;
`,v=n.Ay.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`,f=n.Ay.div`
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
`,x=n.Ay.button`
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
`,$=n.Ay.div`
  position: relative;
`,b=(0,n.Ay)(x)`
  min-width: 150px;
  justify-content: space-between;
`,j=n.Ay.div`
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
`,w=n.Ay.div`
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
`,A=n.Ay.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`,E=n.Ay.div`
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
`,T=n.Ay.div`
  display: flex;
  gap: 0.5rem;
  align-items: center;
`,k=n.Ay.input`
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
`,_=n.Ay.button`
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
`,S=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,C=(0,n.Ay)(o.P.div)`
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
`,D=n.Ay.div`
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
`,R=n.Ay.div`
  flex: 1;
`,z=n.Ay.div`
  font-size: 0.9rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  margin-bottom: 0.5rem;
  font-weight: 500;
  line-height: 1.4;
`,I=n.Ay.span`
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
`,P=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.75rem;
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
`,N=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,O=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
`,L=n.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-weight: 500;
  color: ${e=>{let{theme:t}=e;return t.colors.primary}};
`,G=n.Ay.div`
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
`,M=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:t}=e;return t.colors.error}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,q=n.Ay.div`
  text-align: center;
  padding: 2rem 0;
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
`,V=n.Ay.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
`,F=n.Ay.button`
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
`,J=e=>{if(!e||!e.details)return{};let t=e.details;if("string"===typeof t)try{t=JSON.parse(t)}catch(r){return{}}return{employeeName:t.employee_name||"",employeeId:t.employee_id||"",vacationType:t.type||t.vacation_type||"",startDate:t.start_date||"",endDate:t.end_date||"",status:t.status||t.new_status||"",previousStatus:t.previous_status||""}},B=[{id:"create",label:"Cr\xe9ation",icon:(0,c.jsx)(s.GGD,{})},{id:"update",label:"Modification",icon:(0,c.jsx)(s.SG1,{})},{id:"delete",label:"Suppression",icon:(0,c.jsx)(s.IXo,{})},{id:"approve",label:"Approbation",icon:(0,c.jsx)(s.YrT,{})},{id:"reject",label:"Rejet",icon:(0,c.jsx)(s.yGN,{})},{id:"vacation_status_update",label:"Mise \xe0 jour statut",icon:(0,c.jsx)(s.Wh$,{})}],H=[{id:"vacation",label:"Cong\xe9s",icon:(0,c.jsx)(s.Wh$,{})},{id:"employee",label:"Employ\xe9s",icon:(0,c.jsx)(s.JXP,{})},{id:"schedule",label:"Planning",icon:(0,c.jsx)(s.wIk,{})}],U=[{id:"paid",label:"Cong\xe9 pay\xe9"},{id:"unpaid",label:"Cong\xe9 non pay\xe9"},{id:"sick",label:"Cong\xe9 maladie"},{id:"other",label:"Autre cong\xe9"}],W=()=>{const[e,t]=(0,a.useState)(""),[r,n]=(0,a.useState)(1),[u]=(0,a.useState)(10),[x,W]=(0,a.useState)({activityTypes:[],entityTypes:[],vacationTypes:[],dateRange:{startDate:"",endDate:""}}),[Y,X]=(0,a.useState)(null),{activities:K,loading:Z,error:Q,fetchActivities:ee,formatActivityDescription:te}=(0,i.A)(),re=e=>{X(Y===e?null:e)},oe=(e,t)=>{W((r=>{const o=[...r[e]],a=o.indexOf(t);return-1===a?o.push(t):o.splice(a,1),{...r,[e]:o}})),n(1)},ae=(e,t)=>{W((r=>({...r,dateRange:{...r.dateRange,[e]:t}}))),n(1)},se=Array.isArray(K)?K.filter((t=>{const r=te(t).toLowerCase().includes(e.toLowerCase()),o=0===x.activityTypes.length||x.activityTypes.includes(t.type),a=0===x.entityTypes.length||x.entityTypes.includes(t.entity_type);let s=!0;if("vacation"===t.entity_type&&x.vacationTypes.length>0){const e=J(t);s=x.vacationTypes.includes(e.vacationType)}let n=!0;if(x.dateRange.startDate||x.dateRange.endDate){const e=new Date(t.timestamp);if(x.dateRange.startDate){const t=new Date(x.dateRange.startDate);t.setHours(0,0,0,0),n=n&&e>=t}if(x.dateRange.endDate){const t=new Date(x.dateRange.endDate);t.setHours(23,59,59,999),n=n&&e<=t}}return r&&o&&a&&s&&n})):[],ne=r*u,ie=ne-u,ce=se.slice(ie,ne),le=Math.ceil(se.length/u),de=[];for(let o=1;o<=le;o++)de.push(o);const ue={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{type:"spring",stiffness:100,damping:10}}},pe=()=>{const e=[];return x.activityTypes.forEach((t=>{const r=B.find((e=>e.id===t));r&&e.push({type:"activityTypes",id:t,label:r.label,color:l(t,null)})})),x.entityTypes.forEach((t=>{const r=H.find((e=>e.id===t));r&&e.push({type:"entityTypes",id:t,label:r.label,color:"vacation"===t?"#6366F1":"#4F46E5"})})),x.vacationTypes.forEach((t=>{const r=U.find((e=>e.id===t));r&&e.push({type:"vacationTypes",id:t,label:r.label,color:"#6366F1"})})),e};return(0,c.jsxs)(y,{children:[(0,c.jsxs)(h,{children:[(0,c.jsx)(g,{children:"Historique des activit\xe9s"}),(0,c.jsxs)(_,{onClick:()=>{ee(!0)},disabled:Z,children:[(0,c.jsx)(s.jTZ,{size:16,className:Z?"animate-spin":""}),"Actualiser"]})]}),(0,c.jsxs)(v,{children:[(0,c.jsxs)(f,{children:[(0,c.jsx)(s.CKj,{size:16}),(0,c.jsx)("input",{type:"text",placeholder:"Rechercher dans les activit\xe9s...",value:e,onChange:e=>t(e.target.value)})]}),(0,c.jsxs)($,{children:[(0,c.jsxs)(b,{onClick:()=>re("activityTypes"),active:x.activityTypes.length>0,children:["Type d'activit\xe9",(0,c.jsx)(s.fK4,{size:16})]}),"activityTypes"===Y&&(0,c.jsx)(j,{children:B.map((e=>(0,c.jsxs)(w,{onClick:()=>oe("activityTypes",e.id),selected:x.activityTypes.includes(e.id),children:[(0,c.jsx)(s.YrT,{size:16}),e.icon," ",e.label]},e.id)))})]}),(0,c.jsxs)($,{children:[(0,c.jsxs)(b,{onClick:()=>re("entityTypes"),active:x.entityTypes.length>0,children:["Type d'entit\xe9",(0,c.jsx)(s.fK4,{size:16})]}),"entityTypes"===Y&&(0,c.jsx)(j,{children:H.map((e=>(0,c.jsxs)(w,{onClick:()=>oe("entityTypes",e.id),selected:x.entityTypes.includes(e.id),children:[(0,c.jsx)(s.YrT,{size:16}),e.icon," ",e.label]},e.id)))})]}),(0,c.jsxs)($,{children:[(0,c.jsxs)(b,{onClick:()=>re("vacationTypes"),active:x.vacationTypes.length>0,children:["Type de cong\xe9",(0,c.jsx)(s.fK4,{size:16})]}),"vacationTypes"===Y&&(0,c.jsx)(j,{children:U.map((e=>(0,c.jsxs)(w,{onClick:()=>oe("vacationTypes",e.id),selected:x.vacationTypes.includes(e.id),children:[(0,c.jsx)(s.YrT,{size:16}),e.label]},e.id)))})]}),(0,c.jsxs)(T,{children:[(0,c.jsx)(k,{type:"date",placeholder:"Date de d\xe9but",value:x.dateRange.startDate,onChange:e=>ae("startDate",e.target.value)}),(0,c.jsx)("span",{children:"-"}),(0,c.jsx)(k,{type:"date",placeholder:"Date de fin",value:x.dateRange.endDate,onChange:e=>ae("endDate",e.target.value)})]})]}),pe().length>0&&(0,c.jsx)(A,{children:pe().map((e=>(0,c.jsxs)(E,{color:e.color,children:[e.label,(0,c.jsx)("button",{onClick:()=>{return t=e.type,r=e.id,void W((e=>{const o=[...e[t]],a=o.indexOf(r);return-1!==a&&o.splice(a,1),{...e,[t]:o}}));var t,r},children:(0,c.jsx)(s.yGN,{size:14})})]},`${e.type}-${e.id}`)))}),Z?(0,c.jsxs)(G,{children:[(0,c.jsx)(s.jTZ,{size:32}),(0,c.jsx)("div",{children:"Chargement des activit\xe9s..."})]}):Q?(0,c.jsx)(M,{children:(0,c.jsx)("div",{children:"Une erreur est survenue lors du chargement des activit\xe9s."})}):0===se.length?(0,c.jsx)(q,{children:(0,c.jsx)("div",{children:"Aucune activit\xe9 trouv\xe9e."})}):(0,c.jsxs)(c.Fragment,{children:[(0,c.jsx)(o.P.div,{variants:{hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},initial:"hidden",animate:"visible",children:(0,c.jsx)(S,{children:ce.map(((e,t)=>{const r=l(e.type,e.entity_type),{date:o,time:a}=(0,m.r6)(e.timestamp),n=J(e);return(0,c.jsxs)(C,{color:r,variants:ue,whileHover:{scale:1.01},children:[(0,c.jsx)(D,{color:r,children:d(e.type,e.entity_type)}),(0,c.jsxs)(R,{children:[(0,c.jsxs)(z,{children:[te(e),(0,c.jsx)(I,{color:r,children:p(e.type,e.entity_type,e.details)})]}),(0,c.jsxs)(P,{children:[(0,c.jsxs)(N,{children:[(0,c.jsx)(s.Ohp,{size:12})," ",a]}),(0,c.jsxs)(O,{children:[(0,c.jsx)(s.wIk,{size:12})," ",o]}),"vacation"===e.entity_type&&n.employeeName&&(0,c.jsxs)(L,{children:[(0,c.jsx)(s.JXP,{size:12})," ",n.employeeName]})]})]})]},e.id||t)}))})}),le>1&&(0,c.jsxs)(V,{children:[(0,c.jsx)(F,{onClick:()=>n((e=>Math.max(e-1,1))),disabled:1===r,children:"<"}),de.map((e=>(0,c.jsx)(F,{active:r===e,onClick:()=>n(e),children:e},e))),(0,c.jsx)(F,{onClick:()=>n((e=>Math.min(e+1,le))),disabled:r===le,children:">"})]})]})]})}},4634:(e,t,r)=>{r.d(t,{A:()=>n});var o=r(5043),a=r(3768),s=r(4583);const n=()=>{const e=(0,o.useCallback)((async e=>{try{const r={};e.headers.forEach(((e,t)=>{r[t]=e})),console.log("R\xe9ponse du serveur:",{url:e.url,status:e.status,statusText:e.statusText,headers:r});const o=e.headers.get("content-type");let s;if(o&&o.includes("application/json"))s=await e.json(),console.log("Donn\xe9es JSON re\xe7ues:",s);else{const r=await e.text();console.warn("R\xe9ponse non-JSON re\xe7ue:",r);try{s=JSON.parse(r),console.log("Texte pars\xe9 comme JSON:",s)}catch(t){s={message:r}}}if(e.ok)return s;{if(401===e.status||403===e.status){console.error("Erreur d'authentification:",s),a.oR.error("Session expir\xe9e ou acc\xe8s non autoris\xe9. Veuillez vous reconnecter.");const t=new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");throw t.status=e.status,t.response={status:e.status,data:s},t}500===e.status&&(console.error("Erreur serveur:",s),console.error("URL:",e.url),console.error("M\xe9thode:",e.method),s.error&&console.error("D\xe9tails de l'erreur:",s.error),s.stack&&console.error("Stack trace:",s.stack));const t=s.message||s.error||e.statusText||"Erreur inconnue",r=new Error(t);throw r.status=e.status,r.response={status:e.status,data:s},r}}catch(r){throw console.error("Erreur lors du traitement de la r\xe9ponse:",r),r}}),[]);return(0,o.useMemo)((()=>{const t=e=>{if("zipCode"===e)return console.log(`Conversion sp\xe9ciale: ${e} -> zip_code`),"zip_code";const t=e.replace(/[A-Z]/g,(e=>`_${e.toLowerCase()}`));return console.log(`Conversion camelCase -> snake_case: ${e} -> ${t}`),t};return{get:async t=>{try{const r=s.H$||"http://localhost:5001";console.log(`[API] GET ${r}${t}`);const o=t.includes("/departments"),a=localStorage.getItem("token"),n={"Content-Type":"application/json",...a&&{Authorization:`Bearer ${a}`}},i=await fetch(`${r}${t}`,{method:"GET",headers:n});if(!o&&!i.ok){const e=await i.json();throw new Error(e.message||`Erreur lors de la requ\xeate GET ${t}`)}const c=await e(i);return o?{ok:i.ok,status:i.status,data:c,headers:i.headers}:c}catch(r){console.error(`[API] GET ${t} Error:`,r);if(t.includes("/departments"))return console.log("Erreur silencieuse pour les d\xe9partements"),{ok:!1,status:r.status||0,data:{message:r.message||"Erreur lors de la requ\xeate GET"},headers:new Headers};throw r}},post:async(r,o)=>{try{if(!o||"object"!==typeof o)throw console.error("Donn\xe9es invalides pour la requ\xeate POST:",o),new Error("Donn\xe9es invalides pour la requ\xeate POST");const a=s.H$||"http://localhost:5001";console.log(`[API] POST ${a}${r}`);const n=localStorage.getItem("token");if(!n)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const i=JSON.parse(JSON.stringify(o));void 0!==i.hourlyRate&&(console.log("Suppression de hourlyRate des donn\xe9es"),delete i.hourlyRate);const c={};for(const e in i)c[t(e)]=i[e];console.log("Donn\xe9es converties en snake_case pour POST:",c);const l={"Content-Type":"application/json",Authorization:`Bearer ${n}`};console.log("D\xe9tails de la requ\xeate POST:",{endpoint:r,dataSize:JSON.stringify(c).length,headers:{...l,Authorization:"Bearer [MASQU\xc9]"}});const d=new AbortController,u=setTimeout((()=>d.abort()),3e4),p=await fetch(`${a}${r}`,{method:"POST",headers:l,body:JSON.stringify(c),signal:d.signal});if(clearTimeout(u),401===p.status||403===p.status)throw console.error("Erreur d'authentification:",p.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");return e(p)}catch(a){if("AbortError"===a.name)throw console.error("La requ\xeate a \xe9t\xe9 interrompue (timeout):",a),new Error("La requ\xeate a pris trop de temps. Veuillez r\xe9essayer.");if(a.message.includes("NetworkError")||a.message.includes("Failed to fetch"))throw console.error("Erreur r\xe9seau lors de la requ\xeate POST:",a),new Error("Probl\xe8me de connexion au serveur, veuillez v\xe9rifier votre connexion internet");throw console.error("Erreur lors de la requ\xeate POST:",a),a}},put:async(r,o)=>{try{const a=s.H$||"http://localhost:5001";console.log(`[API] PUT ${a}${r}`,o);const n=localStorage.getItem("token");if(!n)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const i=JSON.parse(JSON.stringify(o));console.log("Donn\xe9es nettoy\xe9es:",i),void 0!==i.hourlyRate&&(console.log("Suppression de hourlyRate des donn\xe9es"),delete i.hourlyRate);const c={};for(const e in i)c[t(e)]=i[e];console.log("Donn\xe9es converties en snake_case:",c);const l=await fetch(`${a}${r}`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify(c)});if(401===l.status||403===l.status)throw console.error("Erreur d'authentification:",l.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const d=await e(l);return console.log(`[API] PUT ${r} Response:`,d),d}catch(a){return console.error(`[API] PUT ${r} Error:`,a),{ok:!1,status:a.status||0,data:{message:a.message||"Erreur lors de la requ\xeate PUT"},headers:new Headers}}},delete:async t=>{try{const r=s.H$||"http://localhost:5004";console.log(`[API] DELETE ${r}${t}`);const o=localStorage.getItem("token");if(!o)throw console.error("Token d'authentification manquant"),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const a=await fetch(`${r}${t}`,{method:"DELETE",headers:{"Content-Type":"application/json",Authorization:`Bearer ${o}`}});if(401===a.status||403===a.status)throw console.error("Erreur d'authentification:",a.status),new Error("Veuillez vous connecter pour acc\xe9der \xe0 cette page.");const n=await e(a);return console.log(`[API] DELETE ${t} Response:`,n),n}catch(r){return console.error(`[API] DELETE ${t} Error:`,r),{ok:!1,status:r.status||0,data:{message:r.message||"Erreur lors de la requ\xeate DELETE"},headers:new Headers}}}}}),[e])}},7013:(e,t,r)=>{r.d(t,{A:()=>u});var o=r(5043),a=r(3768),s=r(5200),n=r(4583),i=r(5016),c=r(4634),l=r(2693),d=r(579);const u=()=>{const[e,t]=(0,o.useState)([]),[r,u]=(0,o.useState)(!0),[p,m]=(0,o.useState)(null),y=(0,c.A)(),{user:h}=(0,i.A)(),{activities:g,socket:v,requestActivitiesUpdate:f,fallbackMode:x}=(0,l.A)(),$=(0,o.useCallback)((async function(){try{u(!0);const e=await y.get(n.Sn.ACTIVITIES.BASE);if(!e||!Array.isArray(e)&&!e.data)throw new Error("Erreur lors du chargement des activit\xe9s: format de r\xe9ponse invalide");{const r=Array.isArray(e)?e:Array.isArray(e.data)?e.data:[];t(r),m(null)}}catch(e){console.error("Erreur lors du chargement des activit\xe9s:",e),m("Erreur lors du chargement des activit\xe9s"),a.oR.error("Erreur lors du chargement des activit\xe9s"),t([])}finally{u(!1)}}),[y]),b=(0,o.useCallback)((async e=>{try{const o=await y.post(n.Sn.ACTIVITIES.BASE,e);if(o.ok)return t((e=>[...e,o.data])),a.oR.success("Activit\xe9 cr\xe9\xe9e avec succ\xe8s"),{success:!0,activity:o.data};var r;throw new Error((null===(r=o.data)||void 0===r?void 0:r.message)||"Erreur lors de la cr\xe9ation de l'activit\xe9")}catch(o){return console.error("Erreur lors de la cr\xe9ation de l'activit\xe9:",o),a.oR.error("Erreur lors de la cr\xe9ation de l'activit\xe9"),{success:!1,error:o.message}}}),[y]),j=(0,o.useCallback)((async(e,r)=>{try{const s=await y.put(`${n.Sn.ACTIVITIES.BASE}/${e}`,r);if(s.ok)return t((t=>t.map((t=>t.id===e?{...t,...s.data}:t)))),a.oR.success("Activit\xe9 mise \xe0 jour avec succ\xe8s"),{success:!0,activity:s.data};var o;throw new Error((null===(o=s.data)||void 0===o?void 0:o.message)||"Erreur lors de la mise \xe0 jour de l'activit\xe9")}catch(s){return console.error("Erreur lors de la mise \xe0 jour de l'activit\xe9:",s),a.oR.error("Erreur lors de la mise \xe0 jour de l'activit\xe9"),{success:!1,error:s.message}}}),[y]),w=(0,o.useCallback)((async e=>{try{const o=await y.delete(`${n.Sn.ACTIVITIES.BASE}/${e}`);if(o.ok)return t((t=>t.filter((t=>t.id!==e)))),a.oR.success("Activit\xe9 supprim\xe9e avec succ\xe8s"),{success:!0};var r;throw new Error((null===(r=o.data)||void 0===r?void 0:r.message)||"Erreur lors de la suppression de l'activit\xe9")}catch(o){return console.error("Erreur lors de la suppression de l'activit\xe9:",o),a.oR.error("Erreur lors de la suppression de l'activit\xe9"),{success:!1,error:o.message}}}),[y]),A=(0,o.useCallback)((e=>{switch(e){case"paid":return"pay\xe9";case"unpaid":return"non pay\xe9";case"sick":return"maladie";case"other":return"autre";default:return e||"non sp\xe9cifi\xe9"}}),[]),E=(0,o.useCallback)((e=>{switch(e){case"approved":return"approuv\xe9";case"rejected":return"rejet\xe9";case"pending":return"en attente";default:return e||"non sp\xe9cifi\xe9"}}),[]),T=(0,o.useCallback)(((e,t)=>{if(!e||!t)return"";const r=new Date(e),o=new Date(t);return`du ${r.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})} au ${o.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}`}),[]),k=(0,o.useCallback)((e=>{if(!e)return"";if(e.description)return e.description;const{type:t,entity_type:r,entity_id:o,user_id:a,details:s,user:n}=e,i=n&&n.name?n.name:"Un utilisateur";let c=`${i} ${{create:"a cr\xe9\xe9",update:"a modifi\xe9",delete:"a supprim\xe9",approve:"a approuv\xe9",reject:"a rejet\xe9",vacation_status_update:"a mis \xe0 jour le statut de"}[t]||t} ${{employee:"un employ\xe9",schedule:"un planning",vacation:"une demande de cong\xe9",shift:"un horaire",user:"un utilisateur"}[r]||r}`;if(s){let e;try{e="string"===typeof s?JSON.parse(s):s}catch(l){e=s}if("vacation"===r){if("create"===t&&e.employee_name&&e.start_date&&e.end_date){const t=e.employee_name;return`${i} a cr\xe9\xe9 une demande de cong\xe9 ${A(e.type)} pour ${t} ${T(e.start_date,e.end_date)}`}if("vacation_status_update"===t&&e.new_status){const t=e.new_status,r=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,a=e.start_date&&e.end_date?T(e.start_date,e.end_date):"",s=e.vacation_type?A(e.vacation_type):"";return`${i} a ${E(t)} la demande de cong\xe9${s?" "+s:""} de ${r}${a?" "+a:""}`}if("update"===t){const t=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,r=e.start_date&&e.end_date?T(e.start_date,e.end_date):"",a=e.vacation_type?A(e.vacation_type):"";return`${i} a modifi\xe9 la demande de cong\xe9${a?" "+a:""} de ${t}${r?" "+r:""}`}if("delete"===t){const t=e.employee_name||`Employ\xe9 #${e.employee_id||o}`,r=e.start_date&&e.end_date?T(e.start_date,e.end_date):"",a=e.vacation_type?A(e.vacation_type):"";return`${i} a supprim\xe9 la demande de cong\xe9${a?" "+a:""} de ${t}${r?" "+r:""}`}}if("employee"===r&&e.action&&("Ajout d'heures"===e.action||"Soustraction d'heures"===e.action)){const t=e.employeeName||`Employ\xe9 #${o}`,r=e.hours||"?";return`${i} a ${"Ajout d'heures"===e.action?"ajout\xe9":"soustrait"} ${r}h au solde d'heures de ${t}`}"string"===typeof e?c+=` : ${e}`:"object"===typeof e&&e.employeeName&&"employee"===r&&(c+=` : ${e.employeeName}`)}return c}),[T,A,E]),_=(0,o.useCallback)((e=>{if(!e)return"";const t=new Date(e),r=new Date-t,o=Math.floor(r/1e3),a=Math.floor(o/60),s=Math.floor(a/60),n=Math.floor(s/24);return o<60?"\xe0 l'instant":a<60?`il y a ${a} minute${a>1?"s":""}`:s<24?`il y a ${s} heure${s>1?"s":""}`:n<7?`il y a ${n} jour${n>1?"s":""}`:t.toLocaleDateString("fr-FR",{day:"2-digit",month:"2-digit",year:"numeric"})}),[]),S=(0,o.useCallback)((e=>{switch(e){case"create":return(0,d.jsx)(s.GGD,{});case"update":return(0,d.jsx)(s.SG1,{});case"delete":return(0,d.jsx)(s.IXo,{});case"approve":return(0,d.jsx)(s.YrT,{});case"reject":return(0,d.jsx)(s.yGN,{});default:return null}}),[]);return(0,o.useEffect)((()=>{g&&Array.isArray(g)&&g.length>0&&(console.log("Nouvelles activit\xe9s re\xe7ues via WebSocket:",g),t((e=>{const t=Array.isArray(e)?e:[],r=new Map;return g.forEach((e=>{r.set(e.id,e)})),t.forEach((e=>{r.has(e.id)||r.set(e.id,e)})),Array.from(r.values()).sort(((e,t)=>new Date(t.timestamp)-new Date(e.timestamp)))})),u(!1))}),[g]),(0,o.useEffect)((()=>{$();const e=setInterval((()=>{$()}),12e4);return()=>clearInterval(e)}),[$]),(0,o.useEffect)((()=>{v&&!x?(console.log("WebSocket connect\xe9, on va rafra\xeechir les activit\xe9s"),f()):x&&(console.log("Mode de secours WebSocket actif, utilisation de l'API REST"),$())}),[v,f,x,$]),(0,o.useEffect)((()=>{x&&(console.log("Passage en mode de secours, r\xe9cup\xe9ration des activit\xe9s via API REST"),$())}),[x,$]),{activities:e,loading:r,error:p,fetchActivities:$,createActivity:b,updateActivity:j,deleteActivity:w,getActivityIcon:S,formatActivityDescription:k,formatActivityDate:_,formatVacationDates:T,translateVacationType:A,translateVacationStatus:E}}}}]);
//# sourceMappingURL=968.470178d8.chunk.js.map