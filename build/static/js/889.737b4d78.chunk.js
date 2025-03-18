"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[889],{9889:(e,r,t)=>{t.r(r),t.d(r,{default:()=>b});var o=t(3750),n=t.n(o),i=t(5043),s=t(3216),a=t(1529),l=t(4185),c=t(5016),u=t(7961),d=t(579);const m=a.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: 2rem;
  text-align: center;
`,p=a.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  padding: 2rem;
  max-width: 500px;
  width: 100%;
`,h=a.Ay.h1`
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 1rem;
  font-size: 1.8rem;
`,x=a.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-bottom: 2rem;
  font-size: 1.1rem;
  line-height: 1.5;
`,g=a.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  margin-bottom: 1rem;
  font-weight: 500;
`,v=a.Ay.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?r.colors.primary:"error"===t?r.colors.error:"transparent"}};
  color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t||"error"===t?"white":r.colors.text.primary}};
  border: ${e=>{let{theme:r,variant:t}=e;return"outline"===t?`1px solid ${r.colors.border}`:"none"}};
  margin-top: 1rem;
  width: 100%;

  &:hover {
    background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?`${r.colors.primary}dd`:"error"===t?`${r.colors.error}dd`:`${r.colors.border}33`}};
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,y=a.Ay.div`
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
`,b=()=>{const{token:e}=(0,s.g)(),r=(0,s.Zp)(),{confirmAccountDeletion:t}=(0,c.A)(),{showNotification:o}=(0,u.hN)(),[a,b]=(0,i.useState)(!0),[f,j]=(0,i.useState)(null),[$,w]=(0,i.useState)(!1);(0,i.useEffect)((()=>{(async()=>{if(!e)return j("Lien de confirmation invalide."),void b(!1);try{const r=await t(e);r.success?(w(!0),o({type:"success",title:"Compte supprim\xe9",message:"Votre compte a \xe9t\xe9 supprim\xe9 avec succ\xe8s."})):j(r.message||"\xc9chec de la suppression du compte.")}catch(f){j("Une erreur est survenue lors de la suppression du compte.")}finally{b(!1)}})()}),[e,t,o]);const k=()=>{r("/")},A=()=>{r("/register")};return(0,d.jsx)(m,{children:(0,d.jsx)(p,{children:a?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(y,{children:(0,d.jsx)(n(),{animationData:l,loop:!0})}),(0,d.jsx)(h,{children:"Traitement en cours"}),(0,d.jsx)(x,{children:"Veuillez patienter pendant que nous traitons votre demande..."})]}):f?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(h,{children:"\xc9chec de la suppression"}),(0,d.jsx)(g,{children:f}),(0,d.jsx)(x,{children:"Le lien de confirmation est peut-\xeatre expir\xe9 ou invalide. Veuillez r\xe9essayer ou contacter notre support si le probl\xe8me persiste."}),(0,d.jsx)(v,{variant:"outline",onClick:k,children:"Retour \xe0 l'accueil"})]}):$?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(h,{children:"Compte supprim\xe9 avec succ\xe8s"}),(0,d.jsx)(x,{children:"Votre compte a \xe9t\xe9 supprim\xe9 d\xe9finitivement. Nous esp\xe9rons vous revoir bient\xf4t !"}),(0,d.jsx)(v,{variant:"primary",onClick:A,children:"Cr\xe9er un nouveau compte"}),(0,d.jsx)(v,{variant:"outline",onClick:k,style:{marginTop:"0.5rem"},children:"Retour \xe0 l'accueil"})]}):void 0})})}}}]);
//# sourceMappingURL=889.737b4d78.chunk.js.map