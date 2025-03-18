"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[775],{290:(e,r,t)=>{t.d(r,{A:()=>l});var n=t(5043),o=t(3768),s=t(4583),i=t(4634);const l=()=>{const[e,r]=(0,n.useState)([]),[t,l]=(0,n.useState)(!0),[a,c]=(0,n.useState)(null),d=(0,i.A)(),u=(0,n.useRef)(!0),m=(0,n.useRef)(!1);(0,n.useEffect)((()=>(u.current=!0,m.current=!1,()=>{u.current=!1,m.current=!1})),[]);const h=(0,n.useCallback)((async()=>{if(!m.current&&u.current){m.current=!0,l(!0);try{if(!localStorage.getItem("token"))return c("Vous devez \xeatre connect\xe9 pour acc\xe9der \xe0 ces donn\xe9es"),l(!1),void(m.current=!1);const e=await d.get(s.Sn.VACATIONS);u.current&&(r(e||[]),c(null))}catch(a){console.error("Erreur lors du chargement des cong\xe9s:",a),u.current&&c("Erreur lors du chargement des cong\xe9s. Veuillez r\xe9essayer plus tard.")}finally{u.current&&l(!1),m.current=!1}}}),[d]),p=(0,n.useCallback)((()=>h()),[h]);(0,n.useEffect)((()=>(u.current&&h(),()=>{})),[h]);const x=(0,n.useCallback)((async e=>{if(!u.current)return{success:!1};try{l(!0);const t={...e,status:e.status||"pending"},n=await d.post(s.Sn.VACATIONS,t);return u.current&&(r((e=>[...e,n])),o.oR.success("Demande de cong\xe9 cr\xe9\xe9e avec succ\xe8s"),u.current&&await h()),{success:!0,data:n}}catch(a){var t,n;const r=(null===(t=a.response)||void 0===t||null===(n=t.data)||void 0===n?void 0:n.message)||a.message||"Erreur lors de la cr\xe9ation de la demande de cong\xe9";return u.current&&(o.oR.error(r),c(r)),{success:!1,error:r}}finally{u.current&&l(!1)}}),[d,h]),g=(0,n.useCallback)((async(e,t)=>{if(!u.current)return{success:!1};try{l(!0);const n=await d.put(`${s.Sn.VACATIONS}/${e}`,t);return u.current&&(r((r=>r.map((r=>r.id===e?{...r,...n}:r)))),o.oR.success("Demande de cong\xe9 mise \xe0 jour avec succ\xe8s")),{success:!0,data:n}}catch(a){var n,i;const r=(null===(n=a.response)||void 0===n||null===(i=n.data)||void 0===i?void 0:i.message)||a.message||"Erreur lors de la mise \xe0 jour de la demande de cong\xe9";return u.current&&(o.oR.error(r),c(r)),{success:!1,error:r}}finally{u.current&&l(!1)}}),[d]),f=(0,n.useCallback)((async e=>{if(!u.current)return{success:!1};try{return l(!0),await d.delete(`${s.Sn.VACATIONS}/${e}`),u.current&&(r((r=>r.filter((r=>r.id!==e)))),o.oR.success("Demande de cong\xe9 supprim\xe9e avec succ\xe8s")),{success:!0}}catch(a){var t,n;const r=(null===(t=a.response)||void 0===t||null===(n=t.data)||void 0===n?void 0:n.message)||a.message||"Erreur lors de la suppression de la demande de cong\xe9";return u.current&&(o.oR.error(r),c(r)),{success:!1,error:r}}finally{u.current&&l(!1)}}),[d]),y=(0,n.useCallback)((async function(e,t){let n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:"";if(!u.current)return{success:!1};try{l(!0);const i=await d.put(`${s.Sn.VACATIONS}/${e}/status`,{status:t,comment:n});if(u.current){r((r=>r.map((r=>r.id===e?{...r,...i}:r))));const n="approved"===t?"approuv\xe9e":"rejected"===t?"rejet\xe9e":"mise \xe0 jour";o.oR.success(`Demande de cong\xe9 ${n} avec succ\xe8s`)}return{success:!0,data:i}}catch(a){var i,m;const r=(null===(i=a.response)||void 0===i||null===(m=i.data)||void 0===m?void 0:m.message)||a.message||"Erreur lors de la mise \xe0 jour du statut de la demande de cong\xe9";return u.current&&(o.oR.error(r),c(r)),{success:!1,error:r}}finally{u.current&&l(!1)}}),[d]),v=(0,n.useCallback)((r=>e.filter((e=>e.status===r))),[e]);return{vacations:e,loading:t,error:a,createVacation:x,updateVacation:g,deleteVacation:f,updateVacationStatus:y,getVacationsByStatus:v,refreshVacations:p}}},6803:(e,r,t)=>{t.d(r,{A:()=>n});const n=t(7598).A},6946:(e,r,t)=>{t.d(r,{A:()=>y});var n=t(8168),o=t(8587),s=t(5043),i=t(8387),l=t(7518),a=t(8812),c=t(8698),d=t(5527),u=t(579);const m=["className","component"];var h=t(9386),p=t(8279),x=t(3375);const g=(0,p.A)(),f=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const{themeId:r,defaultTheme:t,defaultClassName:h="MuiBox-root",generateClassName:p}=e,x=(0,l.Ay)("div",{shouldForwardProp:e=>"theme"!==e&&"sx"!==e&&"as"!==e})(a.A);return s.forwardRef((function(e,s){const l=(0,d.A)(t),a=(0,c.A)(e),{className:g,component:f="div"}=a,y=(0,o.A)(a,m);return(0,u.jsx)(x,(0,n.A)({as:f,ref:s,className:(0,i.A)(g,p?p(h):h),theme:r&&l[r]||l},y))}))}({themeId:x.A,defaultTheme:g,defaultClassName:"MuiBox-root",generateClassName:h.A.generate}),y=f},8387:(e,r,t)=>{function n(e){var r,t,o="";if("string"==typeof e||"number"==typeof e)o+=e;else if("object"==typeof e)if(Array.isArray(e)){var s=e.length;for(r=0;r<s;r++)e[r]&&(t=n(e[r]))&&(o&&(o+=" "),o+=t)}else for(t in e)e[t]&&(o&&(o+=" "),o+=t);return o}t.d(r,{A:()=>o});const o=function(){for(var e,r,t=0,o="",s=arguments.length;t<s;t++)(e=arguments[t])&&(r=n(e))&&(o&&(o+=" "),o+=r);return o}},8698:(e,r,t)=>{t.d(r,{A:()=>c});var n=t(8168),o=t(8587),s=t(9172),i=t(7758);const l=["sx"],a=e=>{var r,t;const n={systemProps:{},otherProps:{}},o=null!=(r=null==e||null==(t=e.theme)?void 0:t.unstable_sxConfig)?r:i.A;return Object.keys(e).forEach((r=>{o[r]?n.systemProps[r]=e[r]:n.otherProps[r]=e[r]})),n};function c(e){const{sx:r}=e,t=(0,o.A)(e,l),{systemProps:i,otherProps:c}=a(t);let d;return d=Array.isArray(r)?[i,...r]:"function"===typeof r?function(){const e=r(...arguments);return(0,s.Q)(e)?(0,n.A)({},i,e):i}:(0,n.A)({},i,r),(0,n.A)({},c,{sx:d})}},9662:(e,r,t)=>{t.d(r,{A:()=>v});var n=t(8168),o=t(5043),s=t(8587),i=t(8795),l=t(8610),a=t(6803),c=t(2876),d=t(4535),u=t(2532),m=t(2372);function h(e){return(0,m.Ay)("MuiSvgIcon",e)}(0,u.A)("MuiSvgIcon",["root","colorPrimary","colorSecondary","colorAction","colorError","colorDisabled","fontSizeInherit","fontSizeSmall","fontSizeMedium","fontSizeLarge"]);var p=t(579);const x=["children","className","color","component","fontSize","htmlColor","inheritViewBox","titleAccess","viewBox"],g=(0,d.Ay)("svg",{name:"MuiSvgIcon",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,"inherit"!==t.color&&r[`color${(0,a.A)(t.color)}`],r[`fontSize${(0,a.A)(t.fontSize)}`]]}})((e=>{let{theme:r,ownerState:t}=e;var n,o,s,i,l,a,c,d,u,m,h,p,x,g,f,y,v;return{userSelect:"none",width:"1em",height:"1em",display:"inline-block",fill:"currentColor",flexShrink:0,transition:null==(n=r.transitions)||null==(o=n.create)?void 0:o.call(n,"fill",{duration:null==(s=r.transitions)||null==(i=s.duration)?void 0:i.shorter}),fontSize:{inherit:"inherit",small:(null==(l=r.typography)||null==(a=l.pxToRem)?void 0:a.call(l,20))||"1.25rem",medium:(null==(c=r.typography)||null==(d=c.pxToRem)?void 0:d.call(c,24))||"1.5rem",large:(null==(u=r.typography)||null==(m=u.pxToRem)?void 0:m.call(u,35))||"2.1875rem"}[t.fontSize],color:null!=(h=null==(p=(r.vars||r).palette)||null==(x=p[t.color])?void 0:x.main)?h:{action:null==(g=(r.vars||r).palette)||null==(f=g.action)?void 0:f.active,disabled:null==(y=(r.vars||r).palette)||null==(v=y.action)?void 0:v.disabled,inherit:void 0}[t.color]}})),f=o.forwardRef((function(e,r){const t=(0,c.A)({props:e,name:"MuiSvgIcon"}),{children:o,className:d,color:u="inherit",component:m="svg",fontSize:f="medium",htmlColor:y,inheritViewBox:v=!1,titleAccess:j,viewBox:A="0 0 24 24"}=t,b=(0,s.A)(t,x),$=(0,n.A)({},t,{color:u,component:m,fontSize:f,instanceFontSize:e.fontSize,inheritViewBox:v,viewBox:A}),w={};v||(w.viewBox=A);const S=(e=>{const{color:r,fontSize:t,classes:n}=e,o={root:["root","inherit"!==r&&`color${(0,a.A)(r)}`,`fontSize${(0,a.A)(t)}`]};return(0,l.A)(o,h,n)})($);return(0,p.jsxs)(g,(0,n.A)({as:m,className:(0,i.A)(S.root,d),focusable:"false",color:y,"aria-hidden":!j||void 0,role:j?"img":void 0,ref:r},w,b,{ownerState:$,children:[o,j?(0,p.jsx)("title",{children:j}):null]}))}));f.muiName="SvgIcon";const y=f;function v(e,r){function t(t,o){return(0,p.jsx)(y,(0,n.A)({"data-testid":`${r}Icon`,ref:o},t,{children:e}))}return t.muiName=y.muiName,o.memo(o.forwardRef(t))}},9775:(e,r,t)=>{t.r(r),t.d(r,{default:()=>W});var n=t(9662),o=t(579);const s=(0,n.A)((0,o.jsx)("path",{d:"M4 9h4v11H4zm12 4h4v7h-4zm-6-9h4v16h-4z"}),"BarChart");var i=t(6946),l=t(4794),a=t(6226),c=t(5043),d=t(5200),u=t(1529),m=t(3681),h=t(2479),p=t(290);const x=(0,u.Ay)(i.A)((e=>{let{theme:r}=e;const{theme:t}=(0,m.D)(),n="dark"===t;return{display:"flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",borderRadius:"50%",background:n?`linear-gradient(135deg, ${(0,l.X4)("#10B981",.2)}, ${(0,l.X4)("#059669",.4)})`:`linear-gradient(135deg, ${(0,l.X4)("#10B981",.1)}, ${(0,l.X4)("#059669",.3)})`,boxShadow:n?`0 4px 20px ${(0,l.X4)("#000",.25)}`:`0 4px 15px ${(0,l.X4)("#000",.08)}`,color:n?"#6EE7B7":"#059669",flexShrink:0,transition:"all 0.3s ease","& .MuiSvgIcon-root":{fontSize:40}}})),g=u.Ay.div`
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,f=(u.Ay.div`
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`,u.Ay.div`
  display: flex;
  flex-direction: column;
`,u.Ay.h1`
  font-size: 1.75rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 0.5rem 0;
`),y=u.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1rem;
  margin: 0;
`,v=u.Ay.button`
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
`,j=(0,u.Ay)(a.P.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`,A=(0,u.Ay)(a.P.div)`
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
`,b=u.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`,$=u.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,w=u.Ay.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return`${r}22`}};
  color: ${e=>{let{color:r}=e;return r}};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
`,S=u.Ay.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.background}66`}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
  position: relative;
`,z=u.Ay.div`
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.875rem;
`,k=u.Ay.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  text-align: center;
`,C=u.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-align: center;
`,E=u.Ay.div`
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
`,B=u.Ay.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`,T=u.Ay.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,R=u.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,F=u.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.text.primary}};
`,V=u.Ay.span`
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${e=>{let{color:r}=e;return r}};
  margin-right: 0.5rem;
`,I=u.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
`,N=u.Ay.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`,D=u.Ay.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,M=u.Ay.div`
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
`,P=u.Ay.div`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  min-width: 40px;
  text-align: right;
`,X=u.Ay.div`
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
`,_=u.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`,O=u.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`,Z=u.Ay.div`
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
`,q=u.Ay.div`
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
`,H=u.Ay.div`
  font-size: 2rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.text.primary}};
`,Y=u.Ay.div`
  font-size: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-top: 0.5rem;
`,L={hidden:{opacity:0,y:20},visible:{opacity:1,y:0,transition:{duration:.5}}},Q={hidden:{opacity:0},visible:{opacity:1,transition:{staggerChildren:.1}}},W=()=>{const[e,r]=(0,c.useState)({employees:{total:0,active:0,onVacation:0,departments:[]},vacations:{total:0,pending:0,approved:0,rejected:0,byType:{vacation:0,sick:0,personal:0,other:0}}}),[t,n]=(0,c.useState)(!1),{employees:l,loading:a,refresh:u}=(0,h.A)(),{vacations:m,loading:W,refreshVacations:G}=(0,p.A)();(0,c.useEffect)((()=>{if(!a&&!W&&l&&m){const e=l.length,t=new Date;t.setHours(0,0,0,0);const n=m.filter((e=>{const r=new Date(e.start_date),n=new Date(e.end_date);return r.setHours(0,0,0,0),n.setHours(23,59,59,999),"approved"===e.status&&t>=r&&t<=n})).map((e=>e.employee_id)),o=[...new Set(n)].length,s=e-o,i=[],a=m.length,c=m.filter((e=>"pending"===e.status)).length,d=m.filter((e=>"approved"===e.status)).length,u=m.filter((e=>"rejected"===e.status)).length,h=m.filter((e=>"paid"===e.type)).length,p=m.filter((e=>"unpaid"===e.type)).length,x=m.filter((e=>"sick"===e.type)).length,g=m.filter((e=>"other"===e.type)).length,f={};m.forEach((e=>{const r=new Date(e.start_date),t=r.getMonth(),n=r.getFullYear(),o=`${n}-${t}`;f[o]||(f[o]={month:t,year:n,count:0,approved:0,pending:0,rejected:0}),f[o].count++,"approved"===e.status?f[o].approved++:"pending"===e.status?f[o].pending++:"rejected"===e.status&&f[o].rejected++})),r({employees:{total:e,active:s,onVacation:o,departments:i},vacations:{total:a,pending:c,approved:d,rejected:u,byType:{vacation:h,sick:x,personal:p,other:g}}})}}),[l,m,a,W]);const J=r=>0===e.vacations.total?0:Math.round(e.vacations.byType[r]/e.vacations.total*100),K=()=>0===e.employees.total?0:Math.round(e.employees.active/e.employees.total*100),U=()=>{const r=e.vacations.approved+e.vacations.rejected;return 0===r?0:Math.round(e.vacations.approved/r*100)};return(0,o.jsxs)(g,{children:[(0,o.jsx)(i.A,{component:"div",sx:{mb:4,display:"flex",flexDirection:"column"},children:(0,o.jsxs)(i.A,{component:"div",sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:[(0,o.jsxs)(i.A,{component:"div",sx:{display:"flex",alignItems:"center"},children:[(0,o.jsx)(x,{children:(0,o.jsx)(s,{})}),(0,o.jsxs)(i.A,{component:"div",sx:{ml:2},children:[(0,o.jsx)(f,{children:"Statistiques"}),(0,o.jsx)(y,{children:"Consultez les statistiques et les analyses de votre organisation"})]})]}),(0,o.jsxs)(v,{onClick:()=>{n(!0),Promise.all([u(),G()]).then((()=>{setTimeout((()=>n(!1)),1e3)})).catch((()=>{n(!1)}))},disabled:a||W||t,children:[(0,o.jsx)(d.jTZ,{size:16}),"Actualiser"]})]})}),a||W||t?(0,o.jsxs)(X,{children:[(0,o.jsx)(d.jTZ,{size:24}),(0,o.jsx)("div",{children:"Chargement des statistiques..."})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)(_,{children:[(0,o.jsx)(d.vQY,{size:18,color:"#4F46E5"}),"Vue d'ensemble"]}),(0,o.jsxs)(O,{children:[(0,o.jsxs)(Z,{children:[(0,o.jsx)(q,{color:"#4F46E5",children:(0,o.jsx)(d.cfS,{})}),(0,o.jsx)(H,{children:e.employees.total}),(0,o.jsx)(Y,{children:"Employ\xe9s au total"})]}),(0,o.jsxs)(Z,{children:[(0,o.jsx)(q,{color:"#F59E0B",children:(0,o.jsx)(d.Ohp,{})}),(0,o.jsx)(H,{children:e.vacations.pending}),(0,o.jsx)(Y,{children:"Demandes en attente"})]}),(0,o.jsxs)(Z,{children:[(0,o.jsx)(q,{color:"#10B981",children:(0,o.jsx)(d.A3x,{})}),(0,o.jsx)(H,{children:e.vacations.approved}),(0,o.jsx)(Y,{children:"Demandes approuv\xe9es"})]}),(0,o.jsxs)(Z,{children:[(0,o.jsx)(q,{color:"#EF4444",children:(0,o.jsx)(d.q_G,{})}),(0,o.jsx)(H,{children:e.vacations.rejected}),(0,o.jsx)(Y,{children:"Demandes rejet\xe9es"})]})]}),(0,o.jsxs)(j,{initial:"hidden",animate:"visible",variants:Q,children:[(0,o.jsxs)(A,{variants:L,children:[(0,o.jsxs)(b,{children:[(0,o.jsxs)($,{children:[(0,o.jsx)(d.cfS,{size:18,color:"#4F46E5"}),"Employ\xe9s"]}),(0,o.jsx)(w,{color:"#4F46E5",children:(0,o.jsx)(d.cfS,{})})]}),(0,o.jsx)(S,{children:a?(0,o.jsxs)(X,{children:[(0,o.jsx)(d.jTZ,{size:24}),(0,o.jsx)("div",{children:"Chargement..."})]}):(0,o.jsxs)(z,{children:[(0,o.jsx)(k,{color:"#4F46E5",children:e.employees.total}),(0,o.jsx)(C,{children:"Employ\xe9s au total"})]})}),(0,o.jsxs)(B,{children:[(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#10B981"}),"Actifs"]}),(0,o.jsx)(F,{children:e.employees.active})]}),(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#EC4899"}),"En cong\xe9"]}),(0,o.jsx)(F,{children:e.employees.onVacation})]}),(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#4F46E5"}),"Taux de pr\xe9sence"]}),(0,o.jsxs)(F,{children:[K(),"%"]})]})]}),(0,o.jsx)(E,{value:K(),color:"#4F46E5"})]}),(0,o.jsxs)(A,{variants:L,children:[(0,o.jsxs)(b,{children:[(0,o.jsxs)($,{children:[(0,o.jsx)(d.Wh$,{size:18,color:"#EC4899"}),"Types de cong\xe9s"]}),(0,o.jsx)(w,{color:"#EC4899",children:(0,o.jsx)(d.Wh$,{})})]}),(0,o.jsx)(S,{children:W?(0,o.jsxs)(X,{children:[(0,o.jsx)(d.jTZ,{size:24}),(0,o.jsx)("div",{children:"Chargement..."})]}):(0,o.jsxs)(z,{children:[(0,o.jsx)(k,{color:"#EC4899",children:e.vacations.total}),(0,o.jsx)(C,{children:"Demandes de cong\xe9s"})]})}),(0,o.jsxs)(I,{children:[(0,o.jsxs)(N,{children:[(0,o.jsxs)(D,{children:[(0,o.jsx)(V,{color:"#4F46E5"}),"Cong\xe9s pay\xe9s"]}),(0,o.jsx)(M,{percentage:J("vacation"),color:"#4F46E5"}),(0,o.jsx)(P,{children:e.vacations.byType.vacation})]}),(0,o.jsxs)(N,{children:[(0,o.jsxs)(D,{children:[(0,o.jsx)(V,{color:"#F59E0B"}),"Cong\xe9s maladie"]}),(0,o.jsx)(M,{percentage:J("sick"),color:"#F59E0B"}),(0,o.jsx)(P,{children:e.vacations.byType.sick})]}),(0,o.jsxs)(N,{children:[(0,o.jsxs)(D,{children:[(0,o.jsx)(V,{color:"#10B981"}),"Cong\xe9s non pay\xe9s"]}),(0,o.jsx)(M,{percentage:J("personal"),color:"#10B981"}),(0,o.jsx)(P,{children:e.vacations.byType.personal})]}),(0,o.jsxs)(N,{children:[(0,o.jsxs)(D,{children:[(0,o.jsx)(V,{color:"#8B5CF6"}),"Autres cong\xe9s"]}),(0,o.jsx)(M,{percentage:J("other"),color:"#8B5CF6"}),(0,o.jsx)(P,{children:e.vacations.byType.other})]})]})]}),(0,o.jsxs)(A,{variants:L,children:[(0,o.jsxs)(b,{children:[(0,o.jsxs)($,{children:[(0,o.jsx)(d.eXT,{size:18,color:"#10B981"}),"Statut des demandes"]}),(0,o.jsx)(w,{color:"#10B981",children:(0,o.jsx)(d.eXT,{})})]}),(0,o.jsx)(S,{children:W?(0,o.jsxs)(X,{children:[(0,o.jsx)(d.jTZ,{size:24}),(0,o.jsx)("div",{children:"Chargement..."})]}):(0,o.jsxs)(z,{children:[(0,o.jsxs)(k,{color:"#10B981",children:[U(),"%"]}),(0,o.jsx)(C,{children:"Taux d'approbation"})]})}),(0,o.jsxs)(B,{children:[(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#F59E0B"}),"En attente"]}),(0,o.jsx)(F,{color:"#F59E0B",children:e.vacations.pending})]}),(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#10B981"}),"Approuv\xe9es"]}),(0,o.jsx)(F,{color:"#10B981",children:e.vacations.approved})]}),(0,o.jsxs)(T,{children:[(0,o.jsxs)(R,{children:[(0,o.jsx)(V,{color:"#EF4444"}),"Rejet\xe9es"]}),(0,o.jsx)(F,{color:"#EF4444",children:e.vacations.rejected})]})]}),(0,o.jsx)(E,{value:U(),color:"#10B981"})]})]})]})]})}}}]);
//# sourceMappingURL=775.7090975e.chunk.js.map