"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[883],{1425:(e,r,t)=>{t.d(r,{A:()=>x});var o=t(5043),n=t(1529),i=t(579);const s=n.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,l=n.i7`
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,c=n.Ay.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: ${s} 0.2s ease-out;
`,a=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.large}};
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: ${e=>{let{size:r}=e;return(e=>{switch(e){case"small":return"400px";case"large":return"900px";case"xlarge":return"1200px";default:return"600px"}})(r)}};
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  animation: ${l} 0.3s ease-out;
`,d=n.Ay.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
`,u=n.Ay.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.semibold}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,m=n.Ay.button`
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  transition: color 0.2s ease;

  &:hover {
    color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  }

  svg {
    width: 20px;
    height: 20px;
  }
`,h=n.Ay.div`
  padding: 1.5rem;
`,p=()=>(0,i.jsxs)("svg",{width:"24",height:"24",viewBox:"0 0 24 24",fill:"none",xmlns:"http://www.w3.org/2000/svg",children:[(0,i.jsx)("path",{d:"M18 6L6 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,i.jsx)("path",{d:"M6 6L18 18",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}),x=e=>{let{isOpen:r=!0,title:t,children:n,onClose:s,size:l="medium"}=e;if(o.useEffect((()=>{if(!1===r)return;const e=e=>{"Escape"===e.key&&s()};return document.addEventListener("keydown",e),()=>document.removeEventListener("keydown",e)}),[s,r]),!1===r)return null;return(0,i.jsx)(c,{onClick:s,children:(0,i.jsxs)(a,{onClick:e=>{e.stopPropagation()},size:l,children:[(0,i.jsxs)(d,{children:[(0,i.jsx)(u,{children:t}),(0,i.jsx)(m,{onClick:s,"aria-label":"Fermer",children:(0,i.jsx)(p,{})})]}),(0,i.jsx)(h,{children:n})]})})}},1883:(e,r,t)=>{t.r(r),t.d(r,{default:()=>X});var o=t(9662),n=t(579);const i=(0,o.A)((0,n.jsx)("path",{d:"M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6"}),"Settings");var s=t(6946),l=t(4794),c=t(5043),a=t(4117),d=t(1529),u=t(3058),m=t(5016),h=t(1425),p=t(7961);const x=d.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`,g=d.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-weight: 500;
  font-size: 1.1rem;
  text-align: center;
`,f=d.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-bottom: 1rem;
  text-align: center;
`,y=d.Ay.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,v=d.Ay.input`
  padding: 0.75rem;
  border: 1px solid
    ${e=>{let{theme:r,error:t}=e;return t?r.colors.error:r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  width: 100%;
  font-size: 1rem;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r,error:t}=e;return t?r.colors.error:r.colors.primary}};
    box-shadow: 0 0 0 2px
      ${e=>{let{theme:r,error:t}=e;return t?`${r.colors.error}33`:`${r.colors.primary}33`}};
  }
`,j=d.Ay.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
`,b=d.Ay.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${e=>{let{fullWidth:r}=e;return r?"100%":"auto"}};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,A=(0,d.Ay)(b)`
  background-color: transparent;
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};

  &:hover:not(:disabled) {
    background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  }
`,w=(0,d.Ay)(b)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.error}};
  border: none;
  color: white;

  &:hover:not(:disabled) {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.error}dd`}};
  }
`,k=d.Ay.label`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`,$=e=>{let{isOpen:r,onClose:t}=e;const[o,i]=(0,c.useState)(1),[s,l]=(0,c.useState)(""),[a,d]=(0,c.useState)({understand:!1,cannotRevert:!1}),[u,b]=(0,c.useState)(!1),{requestAccountDeletion:$}=(0,m.A)(),{showNotification:S}=(0,p.hN)(),C=e=>{const{name:r,checked:t}=e.target;d((e=>({...e,[r]:t})))},z=()=>{i((e=>e+1))},R=()=>{i(1),l(""),d({understand:!1,cannotRevert:!1}),b(!1),t()},D=async()=>{b(!0);try{const e=await $();e.success?(S({type:"success",title:"Demande envoy\xe9e",message:"Un email de confirmation a \xe9t\xe9 envoy\xe9 \xe0 votre adresse email. Veuillez suivre les instructions pour finaliser la suppression de votre compte."}),R()):S({type:"error",title:"Erreur",message:e.message||"Une erreur est survenue lors de la demande de suppression."})}catch(e){S({type:"error",title:"Erreur",message:"Une erreur inattendue est survenue. Veuillez r\xe9essayer plus tard."})}finally{b(!1)}},M="supprimer mon compte"===s.toLowerCase(),N=Object.values(a).every((e=>!0===e));return(0,n.jsx)(h.A,{isOpen:r,onClose:R,title:"Supprimer votre compte",size:"small",children:(0,n.jsx)(x,{children:(()=>{switch(o){case 1:return(0,n.jsxs)(y,{children:[(0,n.jsx)(g,{children:"Attention : Cette action est irr\xe9versible !"}),(0,n.jsx)(f,{children:"La suppression de votre compte entra\xeenera la perte permanente de :"}),(0,n.jsxs)("ul",{children:[(0,n.jsx)("li",{children:"Toutes vos donn\xe9es personnelles"}),(0,n.jsx)("li",{children:"Vos plannings et historique"}),(0,n.jsx)("li",{children:"Vos pr\xe9f\xe9rences et param\xe8tres"}),(0,n.jsx)("li",{children:"Votre acc\xe8s \xe0 l'application"})]}),(0,n.jsxs)(k,{children:[(0,n.jsx)("input",{type:"checkbox",name:"understand",checked:a.understand,onChange:C}),"Je comprends que mes donn\xe9es seront d\xe9finitivement supprim\xe9es"]}),(0,n.jsxs)(k,{children:[(0,n.jsx)("input",{type:"checkbox",name:"cannotRevert",checked:a.cannotRevert,onChange:C}),"Je comprends que cette action ne peut pas \xeatre annul\xe9e"]}),(0,n.jsxs)(j,{children:[(0,n.jsx)(A,{onClick:R,children:"Annuler"}),(0,n.jsx)(w,{onClick:z,disabled:!N,children:"Continuer"})]})]});case 2:return(0,n.jsxs)(y,{children:[(0,n.jsx)(g,{children:"Confirmation finale"}),(0,n.jsx)(f,{children:'Pour confirmer la suppression de votre compte, veuillez saisir "supprimer mon compte" ci-dessous.'}),(0,n.jsx)("div",{children:(0,n.jsx)(v,{type:"text",value:s,onChange:e=>l(e.target.value),placeholder:"supprimer mon compte",error:s&&!M})}),(0,n.jsx)(f,{children:"Un email contenant un lien de confirmation vous sera envoy\xe9. Vous devrez cliquer sur ce lien pour finaliser la suppression de votre compte."}),(0,n.jsxs)(j,{children:[(0,n.jsx)(A,{onClick:R,children:"Annuler"}),(0,n.jsx)(w,{onClick:D,disabled:!M||u,children:u?"Traitement en cours...":"Supprimer mon compte"})]})]});default:return null}})()})})};var S=t(3681);const C=(0,d.Ay)(s.A)((e=>{let{theme:r}=e;const{theme:t}=(0,S.D)(),o="dark"===t;return{display:"flex",alignItems:"center",justifyContent:"center",width:"80px",height:"80px",borderRadius:"50%",background:o?`linear-gradient(135deg, ${(0,l.X4)("#F43F5E",.2)}, ${(0,l.X4)("#E11D48",.4)})`:`linear-gradient(135deg, ${(0,l.X4)("#F43F5E",.1)}, ${(0,l.X4)("#E11D48",.3)})`,boxShadow:o?`0 4px 20px ${(0,l.X4)("#000",.25)}`:`0 4px 15px ${(0,l.X4)("#000",.08)}`,color:o?"#FDA4AF":"#E11D48",flexShrink:0,transition:"all 0.3s ease","& .MuiSvgIcon-root":{fontSize:40}}})),z=d.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,R=(d.Ay.div`
  margin-bottom: 2rem;
`,d.Ay.h1`
  font-size: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`),D=d.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1.1rem;
`,M=d.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,N=d.Ay.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`,E=d.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
`,I=d.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,P=d.Ay.div`
  display: flex;
  flex-direction: column;
`,L=d.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,B=d.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,F=d.Ay.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${e=>{let{theme:r}=e;return r.colors.border}};
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`,V=d.Ay.button`
  padding: 0.5rem 1rem;
  background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?r.colors.primary:"danger"===t?r.colors.error:"transparent"}};
  color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t||"danger"===t?"white":r.colors.text.primary}};
  border: ${e=>{let{theme:r,variant:t}=e;return"outline"===t?`1px solid ${r.colors.border}`:"none"}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?`${r.colors.primary}dd`:"danger"===t?`${r.colors.error}dd`:`${r.colors.border}33`}};
  }
`,T=d.Ay.div`
  display: flex;
  align-items: center;
`,X=()=>{const{isDarkMode:e,toggleTheme:r}=(0,S.D)(),[t,o]=(0,c.useState)(!1),{t:l}=(0,a.Bd)();return(0,n.jsxs)(z,{children:[(0,n.jsx)(s.A,{component:"div",sx:{mb:4,display:"flex",flexDirection:"column"},children:(0,n.jsx)(s.A,{component:"div",sx:{display:"flex",alignItems:"center",justifyContent:"space-between",mb:1},children:(0,n.jsxs)(s.A,{component:"div",sx:{display:"flex",alignItems:"center"},children:[(0,n.jsx)(C,{children:(0,n.jsx)(i,{})}),(0,n.jsxs)(s.A,{component:"div",sx:{ml:2},children:[(0,n.jsx)(R,{children:"Param\xe8tres"}),(0,n.jsx)(D,{children:"Configurez vos pr\xe9f\xe9rences et g\xe9rez votre compte"})]})]})})}),(0,n.jsxs)(M,{children:[(0,n.jsxs)(N,{children:[(0,n.jsx)(E,{children:"Pr\xe9f\xe9rences d'affichage"}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("settings.theme")}),(0,n.jsx)(B,{children:l(e?"settings.lightMode":"settings.darkMode")})]}),(0,n.jsxs)(F,{children:[(0,n.jsx)("input",{type:"checkbox",checked:e,onChange:r}),(0,n.jsx)("span",{})]})]}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("settings.language")}),(0,n.jsx)(B,{children:l("language.select")})]}),(0,n.jsx)(T,{children:(0,n.jsx)(u.A,{})})]})]}),(0,n.jsxs)(N,{children:[(0,n.jsx)(E,{children:l("settings.notifications")}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("notifications.email")}),(0,n.jsx)(B,{children:l("notifications.emailDescription")})]}),(0,n.jsxs)(F,{children:[(0,n.jsx)("input",{type:"checkbox",defaultChecked:!0}),(0,n.jsx)("span",{})]})]}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("notifications.push")}),(0,n.jsx)(B,{children:l("notifications.pushDescription")})]}),(0,n.jsxs)(F,{children:[(0,n.jsx)("input",{type:"checkbox",defaultChecked:!0}),(0,n.jsx)("span",{})]})]})]}),(0,n.jsxs)(N,{children:[(0,n.jsx)(E,{children:l("settings.security")}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("security.twoFactor")}),(0,n.jsx)(B,{children:l("security.twoFactorDescription")})]}),(0,n.jsx)(V,{variant:"primary",children:l("security.enable")})]}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("settings.changePassword")}),(0,n.jsx)(B,{children:l("security.passwordDescription")})]}),(0,n.jsx)(V,{variant:"outline",children:l("common.edit")})]})]}),(0,n.jsxs)(N,{children:[(0,n.jsx)(E,{children:l("settings.account")}),(0,n.jsxs)(I,{children:[(0,n.jsxs)(P,{children:[(0,n.jsx)(L,{children:l("settings.deleteAccount")}),(0,n.jsx)(B,{children:l("settings.confirmDeleteAccount")})]}),(0,n.jsx)(V,{variant:"danger",onClick:()=>{o(!0)},children:l("common.delete")})]})]})]}),(0,n.jsx)($,{isOpen:t,onClose:()=>{o(!1)}})]})}},6803:(e,r,t)=>{t.d(r,{A:()=>o});const o=t(7598).A},6946:(e,r,t)=>{t.d(r,{A:()=>y});var o=t(8168),n=t(8587),i=t(5043),s=t(8387),l=t(7518),c=t(8812),a=t(8698),d=t(5527),u=t(579);const m=["className","component"];var h=t(9386),p=t(8279),x=t(3375);const g=(0,p.A)(),f=function(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};const{themeId:r,defaultTheme:t,defaultClassName:h="MuiBox-root",generateClassName:p}=e,x=(0,l.Ay)("div",{shouldForwardProp:e=>"theme"!==e&&"sx"!==e&&"as"!==e})(c.A);return i.forwardRef((function(e,i){const l=(0,d.A)(t),c=(0,a.A)(e),{className:g,component:f="div"}=c,y=(0,n.A)(c,m);return(0,u.jsx)(x,(0,o.A)({as:f,ref:i,className:(0,s.A)(g,p?p(h):h),theme:r&&l[r]||l},y))}))}({themeId:x.A,defaultTheme:g,defaultClassName:"MuiBox-root",generateClassName:h.A.generate}),y=f},8387:(e,r,t)=>{function o(e){var r,t,n="";if("string"==typeof e||"number"==typeof e)n+=e;else if("object"==typeof e)if(Array.isArray(e)){var i=e.length;for(r=0;r<i;r++)e[r]&&(t=o(e[r]))&&(n&&(n+=" "),n+=t)}else for(t in e)e[t]&&(n&&(n+=" "),n+=t);return n}t.d(r,{A:()=>n});const n=function(){for(var e,r,t=0,n="",i=arguments.length;t<i;t++)(e=arguments[t])&&(r=o(e))&&(n&&(n+=" "),n+=r);return n}},8698:(e,r,t)=>{t.d(r,{A:()=>a});var o=t(8168),n=t(8587),i=t(9172),s=t(7758);const l=["sx"],c=e=>{var r,t;const o={systemProps:{},otherProps:{}},n=null!=(r=null==e||null==(t=e.theme)?void 0:t.unstable_sxConfig)?r:s.A;return Object.keys(e).forEach((r=>{n[r]?o.systemProps[r]=e[r]:o.otherProps[r]=e[r]})),o};function a(e){const{sx:r}=e,t=(0,n.A)(e,l),{systemProps:s,otherProps:a}=c(t);let d;return d=Array.isArray(r)?[s,...r]:"function"===typeof r?function(){const e=r(...arguments);return(0,i.Q)(e)?(0,o.A)({},s,e):s}:(0,o.A)({},s,r),(0,o.A)({},a,{sx:d})}},9662:(e,r,t)=>{t.d(r,{A:()=>v});var o=t(8168),n=t(5043),i=t(8587),s=t(8795),l=t(8610),c=t(6803),a=t(2876),d=t(4535),u=t(2532),m=t(2372);function h(e){return(0,m.Ay)("MuiSvgIcon",e)}(0,u.A)("MuiSvgIcon",["root","colorPrimary","colorSecondary","colorAction","colorError","colorDisabled","fontSizeInherit","fontSizeSmall","fontSizeMedium","fontSizeLarge"]);var p=t(579);const x=["children","className","color","component","fontSize","htmlColor","inheritViewBox","titleAccess","viewBox"],g=(0,d.Ay)("svg",{name:"MuiSvgIcon",slot:"Root",overridesResolver:(e,r)=>{const{ownerState:t}=e;return[r.root,"inherit"!==t.color&&r[`color${(0,c.A)(t.color)}`],r[`fontSize${(0,c.A)(t.fontSize)}`]]}})((e=>{let{theme:r,ownerState:t}=e;var o,n,i,s,l,c,a,d,u,m,h,p,x,g,f,y,v;return{userSelect:"none",width:"1em",height:"1em",display:"inline-block",fill:"currentColor",flexShrink:0,transition:null==(o=r.transitions)||null==(n=o.create)?void 0:n.call(o,"fill",{duration:null==(i=r.transitions)||null==(s=i.duration)?void 0:s.shorter}),fontSize:{inherit:"inherit",small:(null==(l=r.typography)||null==(c=l.pxToRem)?void 0:c.call(l,20))||"1.25rem",medium:(null==(a=r.typography)||null==(d=a.pxToRem)?void 0:d.call(a,24))||"1.5rem",large:(null==(u=r.typography)||null==(m=u.pxToRem)?void 0:m.call(u,35))||"2.1875rem"}[t.fontSize],color:null!=(h=null==(p=(r.vars||r).palette)||null==(x=p[t.color])?void 0:x.main)?h:{action:null==(g=(r.vars||r).palette)||null==(f=g.action)?void 0:f.active,disabled:null==(y=(r.vars||r).palette)||null==(v=y.action)?void 0:v.disabled,inherit:void 0}[t.color]}})),f=n.forwardRef((function(e,r){const t=(0,a.A)({props:e,name:"MuiSvgIcon"}),{children:n,className:d,color:u="inherit",component:m="svg",fontSize:f="medium",htmlColor:y,inheritViewBox:v=!1,titleAccess:j,viewBox:b="0 0 24 24"}=t,A=(0,i.A)(t,x),w=(0,o.A)({},t,{color:u,component:m,fontSize:f,instanceFontSize:e.fontSize,inheritViewBox:v,viewBox:b}),k={};v||(k.viewBox=b);const $=(e=>{const{color:r,fontSize:t,classes:o}=e,n={root:["root","inherit"!==r&&`color${(0,c.A)(r)}`,`fontSize${(0,c.A)(t)}`]};return(0,l.A)(n,h,o)})(w);return(0,p.jsxs)(g,(0,o.A)({as:m,className:(0,s.A)($.root,d),focusable:"false",color:y,"aria-hidden":!j||void 0,role:j?"img":void 0,ref:r},k,A,{ownerState:w,children:[n,j?(0,p.jsx)("title",{children:j}):null]}))}));f.muiName="SvgIcon";const y=f;function v(e,r){function t(t,n){return(0,p.jsx)(y,(0,o.A)({"data-testid":`${r}Icon`,ref:n},t,{children:e}))}return t.muiName=y.muiName,n.memo(n.forwardRef(t))}}}]);
//# sourceMappingURL=883.b6aa59ed.chunk.js.map