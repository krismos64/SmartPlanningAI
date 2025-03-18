"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[395],{2395:(e,t,n)=>{n.r(t),n.d(t,{default:()=>V});var r=n(3750),i=n.n(r),s=n(5043),l=n(5475),o=n(3216),a=n(1529),c=n(4185),d=n(4450),m=n(8132),p=n(1724),h=n(7961),u=n(5016),g=n(579);const x=a.i7`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,y=a.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,f=a.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  padding: ${e=>{let{theme:t}=e;return`${t.spacing.xl} ${t.spacing.md}`}};
`,v=(0,a.Ay)(m.Ay)`
  width: 100%;
  max-width: 450px;
  animation: ${x} 0.5s ease-out;
`,j=a.Ay.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.xl}};
`,$=a.Ay.div`
  width: 120px;
  height: 120px;
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.md}};
  animation: ${y} 2s infinite ease-in-out;
`,w=a.Ay.form`
  width: 100%;
`,z=a.Ay.h2`
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.xl}};
  margin-bottom: ${e=>{let{theme:t}=e;return t.spacing.lg}};
  color: ${e=>{let{theme:t}=e;return t.colors.text.primary}};
  text-align: center;
`,A=a.Ay.div`
  display: flex;
  flex-direction: column;
  gap: ${e=>{let{theme:t}=e;return t.spacing.md}};
  margin-top: ${e=>{let{theme:t}=e;return t.spacing.xl}};
`,C=(0,a.Ay)(l.N_)`
  text-align: right;
  font-size: ${e=>{let{theme:t}=e;return t.typography.sizes.sm}};
  color: ${e=>{let{theme:t}=e;return t.colors.primary}};
  text-decoration: none;
  margin-top: ${e=>{let{theme:t}=e;return t.spacing.xs}};

  &:hover {
    text-decoration: underline;
  }
`,b=a.Ay.div`
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
`,S=a.Ay.div`
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
`,E=a.Ay.div`
  display: flex;
  gap: ${e=>{let{theme:t}=e;return t.spacing.md}};
  justify-content: center;
`,k=(0,a.Ay)(d.A)`
  flex: 1;
`,V=()=>{const[e,t]=(0,s.useState)(""),[n,r]=(0,s.useState)(""),[a,m]=(0,s.useState)({}),[x,y]=(0,s.useState)(!1),[V,F]=(0,s.useState)(!1),{login:M,loginWithGoogle:I,loginError:L}=(0,u.A)(),{showNotification:_}=(0,h.hN)(),q=(0,o.Zp)();(0,s.useEffect)((()=>{L&&_({type:"error",title:"Erreur de connexion",message:L})}),[L]),(0,s.useEffect)((()=>{"session_expired"===new URLSearchParams(window.location.search).get("error")&&_("Votre session a expir\xe9. Veuillez vous reconnecter.","warning")}),[_]);return(0,g.jsx)(f,{children:(0,g.jsxs)(v,{variant:"elevated",padding:"2rem",children:[(0,g.jsxs)(j,{children:[(0,g.jsx)($,{children:(0,g.jsx)(i(),{animationData:c,loop:!0})}),(0,g.jsx)("h1",{children:"SmartPlanning AI"}),(0,g.jsx)("p",{children:"Planifiez intelligemment avec l'IA"})]}),(0,g.jsxs)(w,{onSubmit:async t=>{if(t.preventDefault(),(()=>{const t={};return e?/\S+@\S+\.\S+/.test(e)||(t.email="L'email est invalide"):t.email="L'email est requis",n||(t.password="Le mot de passe est requis"),m(t),0===Object.keys(t).length})()){y(!0);try{console.log("Tentative de connexion avec:",{email:e,password:"***"});const t=await M(e,n);console.log("R\xe9sultat de la connexion:",t),t?(_({type:"success",title:"Connexion r\xe9ussie",message:"Bienvenue sur SmartPlanning AI !"}),q("/dashboard")):_({type:"error",title:"\xc9chec de connexion",message:L||"Identifiants incorrects. Veuillez r\xe9essayer."})}catch(r){console.error("Erreur lors de la connexion:",r),_({type:"error",title:"Erreur de connexion",message:r.message||"Une erreur est survenue lors de la connexion."})}finally{y(!1)}}},children:[(0,g.jsx)(z,{children:"Connexion"}),(0,g.jsx)(p.ZQ,{label:"Email",id:"email",type:"email",placeholder:"Entrez votre email",value:e,onChange:e=>t(e.target.value),error:a.email,required:!0}),(0,g.jsx)(p.ZQ,{label:"Mot de passe",id:"password",type:"password",placeholder:"Entrez votre mot de passe",value:n,onChange:e=>r(e.target.value),error:a.password,required:!0}),(0,g.jsx)(C,{to:"/forgot-password",children:"Mot de passe oubli\xe9 ?"}),(0,g.jsx)(A,{children:(0,g.jsx)(d.A,{type:"submit",fullWidth:!0,size:"lg",loading:x,disabled:x,children:"Se connecter"})}),(0,g.jsx)(S,{children:(0,g.jsx)("span",{children:"Ou"})}),(0,g.jsx)(E,{children:(0,g.jsxs)(k,{variant:"outline",onClick:async()=>{_({type:"info",title:"Fonctionnalit\xe9 en d\xe9veloppement",message:"La connexion avec Google sera bient\xf4t disponible. Veuillez utiliser la m\xe9thode de connexion standard pour le moment."})},fullWidth:!0,style:{display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",opacity:"0.7",cursor:"default"},children:[(0,g.jsxs)("svg",{width:"18",height:"18",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 48 48",children:[(0,g.jsx)("path",{fill:"#FFC107",d:"M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"}),(0,g.jsx)("path",{fill:"#FF3D00",d:"M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"}),(0,g.jsx)("path",{fill:"#4CAF50",d:"M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"}),(0,g.jsx)("path",{fill:"#1976D2",d:"M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"})]}),"Google (Bient\xf4t disponible)"]})}),(0,g.jsxs)(b,{children:["Vous n'avez pas de compte ? ",(0,g.jsx)(l.N_,{to:"/register",children:"S'inscrire"})]})]})]})})}}}]);
//# sourceMappingURL=395.f1417582.chunk.js.map