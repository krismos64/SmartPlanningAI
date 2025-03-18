"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[462],{6462:(e,r,t)=>{t.r(r),t.d(r,{default:()=>y});var o=t(5043),s=t(5475),l=t(1529),i=t(7961),n=t(579);const a=l.Ay.div`
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,c=l.Ay.h1`
  font-size: 1.75rem;
  margin-bottom: 1.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  text-align: center;
`,d=l.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
`,m=l.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,u=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,h=l.Ay.label`
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,p=l.Ay.input`
  padding: 0.75rem;
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
    box-shadow: 0 0 0 2px ${e=>{let{theme:r}=e;return`${r.colors.primary}33`}};
  }
`,g=l.Ay.button`
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
`,x=l.Ay.div`
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
`,b=l.Ay.div`
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
`,y=()=>{const[e,r]=(0,o.useState)(""),[t,l]=(0,o.useState)(!1),[y,v]=(0,o.useState)(!1),{showNotification:$}=(0,i.hN)();return(0,n.jsxs)(a,{children:[(0,n.jsx)(c,{children:"Mot de passe oubli\xe9"}),y?(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(b,{children:(0,n.jsx)("p",{children:"Email envoy\xe9 avec succ\xe8s!"})}),(0,n.jsx)(d,{children:"Si votre adresse email est associ\xe9e \xe0 un compte, vous recevrez un lien pour r\xe9initialiser votre mot de passe. V\xe9rifiez \xe9galement votre dossier de spam."})]}):(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(d,{children:"Entrez votre adresse email et nous vous enverrons un lien pour r\xe9initialiser votre mot de passe."}),(0,n.jsxs)(m,{onSubmit:async r=>{if(r.preventDefault(),e){l(!0);try{setTimeout((()=>{v(!0),l(!1),$({type:"success",title:"Email envoy\xe9",message:"Si votre adresse email est associ\xe9e \xe0 un compte, vous recevrez un lien pour r\xe9initialiser votre mot de passe."})}),1500)}catch(t){$({type:"error",title:"Erreur",message:"Une erreur est survenue. Veuillez r\xe9essayer."})}finally{l(!1)}}else $({type:"error",title:"Champ requis",message:"Veuillez saisir votre adresse email."})},children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(h,{htmlFor:"email",children:"Adresse email"}),(0,n.jsx)(p,{id:"email",type:"email",value:e,onChange:e=>r(e.target.value),placeholder:"votre@email.com",required:!0})]}),(0,n.jsx)(g,{type:"submit",disabled:t||!e,children:t?"Envoi en cours...":"Envoyer le lien de r\xe9initialisation"})]})]}),(0,n.jsx)(x,{children:(0,n.jsx)(s.N_,{to:"/login",children:"Retour \xe0 la page de connexion"})})]})}}}]);
//# sourceMappingURL=462.38fc6a5d.chunk.js.map