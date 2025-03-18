"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[24],{2024:(e,r,o)=>{o.r(r),o.d(r,{default:()=>j});var t=o(5043),s=o(3216),n=o(5475),i=o(1529),a=o(7961),l=o(579);const d=i.Ay.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,c=i.Ay.h1`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  text-align: center;
`,u=i.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
`,m=i.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,h=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,p=i.Ay.label`
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,x=i.Ay.input`
  padding: 0.75rem;
  border: 1px solid
    ${e=>{let{theme:r,error:o}=e;return o?r.colors.error:r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r,error:o}=e;return o?r.colors.error:r.colors.primary}};
    box-shadow: 0 0 0 2px
      ${e=>{let{theme:r,error:o}=e;return o?`${r.colors.error}33`:`${r.colors.primary}33`}};
  }
`,g=i.Ay.span`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`,b=i.Ay.button`
  padding: 0.75rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  color: white;
  border: none;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}dd`}};
  }

  &:disabled {
    background-color: ${e=>{let{theme:r}=e;return r.colors.border}};
    cursor: not-allowed;
  }
`,y=i.Ay.div`
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};

  a {
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`,f=i.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.success}22`}};
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.success}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
  margin-bottom: 1.5rem;

  p {
    color: ${e=>{let{theme:r}=e;return r.colors.success}};
    text-align: center;
    margin: 0;
  }
`,$=i.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.error}22`}};
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.error}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
  margin-bottom: 1.5rem;

  p {
    color: ${e=>{let{theme:r}=e;return r.colors.error}};
    text-align: center;
    margin: 0;
  }
`,j=()=>{const[e,r]=(0,t.useState)(""),[o,i]=(0,t.useState)(""),[j,v]=(0,t.useState)(!1),[w,k]=(0,t.useState)(!1),[A,z]=(0,t.useState)(!0),[R,S]=(0,t.useState)(!1),[V,P]=(0,t.useState)({}),{token:L}=(0,s.g)(),C=(0,s.Zp)(),{showNotification:N}=(0,a.hN)();(0,t.useEffect)((()=>{(async()=>{if(!L)return z(!1),void S(!0);try{setTimeout((()=>{z(!0),S(!0)}),1e3)}catch(e){z(!1),S(!0)}})()}),[L]);return R?A?(0,l.jsxs)(d,{children:[(0,l.jsx)(c,{children:"R\xe9initialisation du mot de passe"}),w?(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(f,{children:(0,l.jsx)("p",{children:"Mot de passe r\xe9initialis\xe9 avec succ\xe8s!"})}),(0,l.jsx)(u,{children:"Votre mot de passe a \xe9t\xe9 r\xe9initialis\xe9. Vous allez \xeatre redirig\xe9 vers la page de connexion."}),(0,l.jsx)(y,{children:(0,l.jsx)(n.N_,{to:"/login",children:"Aller \xe0 la page de connexion"})})]}):(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(u,{children:"Veuillez cr\xe9er un nouveau mot de passe pour votre compte."}),(0,l.jsxs)(m,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e?e.length<8&&(r.password="Le mot de passe doit contenir au moins 8 caract\xe8res"):r.password="Le mot de passe est requis",o?e!==o&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",P(r),0===Object.keys(r).length})()){v(!0);try{setTimeout((()=>{k(!0),v(!1),N({type:"success",title:"Mot de passe r\xe9initialis\xe9",message:"Votre mot de passe a \xe9t\xe9 r\xe9initialis\xe9 avec succ\xe8s. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe."}),setTimeout((()=>{C("/login")}),3e3)}),1500)}catch(t){N({type:"error",title:"Erreur",message:"Une erreur est survenue. Veuillez r\xe9essayer."})}finally{v(!1)}}},children:[(0,l.jsxs)(h,{children:[(0,l.jsx)(p,{htmlFor:"password",children:"Nouveau mot de passe"}),(0,l.jsx)(x,{id:"password",type:"password",value:e,onChange:e=>r(e.target.value),error:!!V.password,required:!0}),V.password&&(0,l.jsx)(g,{children:V.password})]}),(0,l.jsxs)(h,{children:[(0,l.jsx)(p,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe"}),(0,l.jsx)(x,{id:"confirmPassword",type:"password",value:o,onChange:e=>i(e.target.value),error:!!V.confirmPassword,required:!0}),V.confirmPassword&&(0,l.jsx)(g,{children:V.confirmPassword})]}),(0,l.jsx)(b,{type:"submit",disabled:j,children:j?"R\xe9initialisation en cours...":"R\xe9initialiser le mot de passe"})]})]})]}):(0,l.jsxs)(d,{children:[(0,l.jsx)(c,{children:"Lien invalide"}),(0,l.jsx)($,{children:(0,l.jsx)("p",{children:"Le lien de r\xe9initialisation est invalide ou a expir\xe9."})}),(0,l.jsx)(u,{children:"Veuillez demander un nouveau lien de r\xe9initialisation de mot de passe."}),(0,l.jsx)(y,{children:(0,l.jsx)(n.N_,{to:"/forgot-password",children:"Demander un nouveau lien"})})]}):(0,l.jsxs)(d,{children:[(0,l.jsx)(c,{children:"R\xe9initialisation du mot de passe"}),(0,l.jsx)(u,{children:"V\xe9rification du lien de r\xe9initialisation..."})]})}}}]);
//# sourceMappingURL=24.b699a290.chunk.js.map