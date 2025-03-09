"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[395],{2395:(e,t,n)=>{n.r(t),n.d(t,{default:()=>I});var r=n(3750),i=n.n(r),o=n(5043),s=n(5475),a=n(3216),l=n(1529),c=n(4185),d=n(4450),m=n(8132),p=n(1724),h=n(7961),u=n(5016),g=n(579);const x=l.i7`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,y=l.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,f=l.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: ${e=>{let{theme:t}=e;return`${t.spacing.xl} ${t.spacing.md}`}};
`,v=(0,l.Ay)(m.Ay)`
  width: 100%;
  max-width: 450px;
  animation: ${x} 0.5s ease-out;
`,$=l.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.xl}};
`,j=l.Ay.div`
  width: 120px;
  height: 120px;
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.md}};
  animation: ${y} 2s infinite ease-in-out;
`,w=l.Ay.form`
  width: 100%;
`,A=l.Ay.h2`
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.xl}};
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.lg}};
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  text-align: center;
`,b=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${e=>{let{theme:t}=e;return t.spacing.md}};
  margin-top: ${e=>{let{theme:t}=e;return t.spacing.xl}};
`,z=(0,l.Ay)(s.N_)`
  text-align: right;
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.sm}};
  color: ${e=>{let{theme:t}=e;return t.colors.primary}};
  text-decoration: none;
  margin-top: ${e=>{let{theme:t}=e;return t.spacing.xs}};

  &:hover {
    text-decoration: underline;
  }
`,S=l.Ay.div`
  text-align: center;
  margin-top: ${e=>{let{theme:t}=e;return t.spacing.lg}};
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.sm}};
  color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};

  a {
    color: ${e=>{let{theme:t}=e;return t.colors.primary}};
    text-decoration: none;
    font-weight: ${e=>{let{theme:t}=e;return t.typography.fontWeights.medium}};

    &:hover {
      text-decoration: underline;
    }
  }
`,E=l.Ay.div`
  display: flex;
  align-items: center;
  margin: ${e=>{let{theme:t}=e;return`${t.spacing.lg} 0`}};

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: ${e=>{let{theme:t}=e;return t.colors.border}};
  }

  span {
    padding: ${e=>{let{theme:t}=e;return`0 ${t.spacing.md}`}};
    color: ${e=>{let{theme:t}=e;return t.colors.text.secondary}};
    font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.sm}};
  }
`,k=l.Ay.div`
  display: flex;
  gap: ${e=>{let{theme:t}=e;return t.spacing.md}};
  justify-content: center;
`,C=(0,l.Ay)(d.A)`
  flex: 1;
`,I=()=>{const[e,t]=(0,o.useState)(""),[n,r]=(0,o.useState)(""),[l,m]=(0,o.useState)({}),[x,y]=(0,o.useState)(!1),[I,L]=(0,o.useState)(!1),{login:_,loginError:q}=(0,u.A)(),{showNotification:M}=(0,h.hN)(),N=(0,a.Zp)();(0,o.useEffect)((()=>{q&&M({type:"error",title:"Erreur de connexion",message:q})}),[q]),(0,o.useEffect)((()=>{"session_expired"===new URLSearchParams(window.location.search).get("error")&&M("Votre session a expir\xe9. Veuillez vous reconnecter.","warning")}),[M]);return(0,g.jsx)(f,{children:(0,g.jsxs)(v,{variant:"elevated",padding:"2rem",children:[(0,g.jsxs)($,{children:[(0,g.jsx)(j,{children:(0,g.jsx)(i(),{animationData:c,loop:!0})}),(0,g.jsx)("h1",{children:"SmartPlanning AI"}),(0,g.jsx)("p",{children:"Planifiez intelligemment avec l'IA"})]}),(0,g.jsxs)(w,{onSubmit:async t=>{if(t.preventDefault(),(()=>{const t={};return e?/\S+@\S+\.\S+/.test(e)||(t.email="L'email est invalide"):t.email="L'email est requis",n||(t.password="Le mot de passe est requis"),m(t),0===Object.keys(t).length})()){y(!0);try{console.log("Tentative de connexion avec:",{email:e,password:"***"});const t=await _(e,n);console.log("R\xe9sultat de la connexion:",t),t?(M({type:"success",title:"Connexion r\xe9ussie",message:"Bienvenue sur SmartPlanning AI !"}),N("/dashboard")):M({type:"error",title:"\xc9chec de connexion",message:q||"Identifiants incorrects. Veuillez r\xe9essayer."})}catch(r){console.error("Erreur lors de la connexion:",r),M({type:"error",title:"Erreur de connexion",message:r.message||"Une erreur est survenue lors de la connexion."})}finally{y(!1)}}},children:[(0,g.jsx)(A,{children:"Connexion"}),(0,g.jsx)(p.ZQ,{label:"Email",id:"email",type:"email",placeholder:"Entrez votre email",value:e,onChange:e=>t(e.target.value),error:l.email,required:!0}),(0,g.jsx)(p.ZQ,{label:"Mot de passe",id:"password",type:"password",placeholder:"Entrez votre mot de passe",value:n,onChange:e=>r(e.target.value),error:l.password,required:!0}),(0,g.jsx)(z,{to:"/forgot-password",children:"Mot de passe oubli\xe9 ?"}),(0,g.jsx)(b,{children:(0,g.jsx)(d.A,{type:"submit",fullWidth:!0,size:"lg",loading:x,disabled:x,children:"Se connecter"})}),(0,g.jsx)(E,{children:(0,g.jsx)("span",{children:"Ou"})}),(0,g.jsxs)(k,{children:[(0,g.jsx)(C,{variant:"outline",onClick:()=>{M({type:"info",title:"Information",message:"La connexion avec Google n'est pas encore disponible."})},children:"Google"}),(0,g.jsx)(C,{variant:"outline",onClick:()=>{M({type:"info",title:"Information",message:"La connexion avec Microsoft n'est pas encore disponible."})},children:"Microsoft"})]}),(0,g.jsxs)(S,{children:["Vous n'avez pas de compte ? ",(0,g.jsx)(s.N_,{to:"/register",children:"S'inscrire"})]})]})]})})}}}]);
//# sourceMappingURL=395.1a798372.chunk.js.map