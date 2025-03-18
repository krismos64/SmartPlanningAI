"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[101],{7101:(e,r,o)=>{o.r(r),o.d(r,{default:()=>F});var t=o(3750),s=o.n(t),n=o(5043),i=o(3216),a=o(5475),l=o(1529),d=o(4185),c=o(7961),m=o(5016),p=o(4505),h=o(579);const u=l.i7`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,x=l.i7`
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
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  animation: ${u} 0.5s ease-out;
`,g=l.Ay.div`
  text-align: center;
  margin-bottom: 2rem;
`,j=l.Ay.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: ${e=>{let{theme:r}=e;return r.spacing.md}};
  animation: ${x} 2s infinite ease-in-out;
`,y=l.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,w=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,b=l.Ay.label`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,v=l.Ay.input`
  padding: 0.75rem;
  border: 1px solid
    ${e=>{let{theme:r,error:o}=e;return o?r.colors.error:r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r,error:o}=e;return o?r.colors.error:r.colors.primary}};
    box-shadow: 0 0 0 2px
      ${e=>{let{theme:r,error:o}=e;return o?`${r.colors.error}33`:`${r.colors.primary}33`}};
  }
`,C=l.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.875rem;
`,_=l.Ay.button`
  padding: 0.75rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  color: white;
  border: none;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return`${r.colors.primary}dd`}};
  }

  &:disabled {
    background-color: ${e=>{let{theme:r}=e;return r.colors.text.disabled}};
    cursor: not-allowed;
  }
`,$=l.Ay.div`
  margin-top: 1rem;
  text-align: center;
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};

  a {
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`,z=l.Ay.div`
  text-align: center;
  margin: 20px 0;

  span {
    padding: 0 10px;
    background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  }
`,F=()=>{const[e,r]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:"",profileImage:null}),[o,t]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:""}),[l,u]=(0,n.useState)(!1),[x,F]=(0,n.useState)(null),P=(0,n.useRef)(null),{register:k,loginWithGoogle:A}=(0,m.A)(),{showNotification:S}=(0,c.hN)(),L=(0,i.Zp)(),I=e=>{const{name:o,value:t}=e.target;r((e=>({...e,[o]:t})))};return(0,h.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"calc(100vh - 200px)"},children:(0,h.jsxs)(f,{children:[(0,h.jsxs)(g,{children:[(0,h.jsx)(j,{children:(0,h.jsx)(s(),{animationData:d,loop:!0})}),(0,h.jsx)("h1",{children:"Cr\xe9er un compte"}),(0,h.jsx)("p",{children:"Rejoignez SmartPlanning AI d\xe8s aujourd'hui"})]}),(0,h.jsxs)(y,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e.email?/\S+@\S+\.\S+/.test(e.email)||(r.email="L'email n'est pas valide"):r.email="L'email est requis",e.password?e.password.length<6&&(r.password="Le mot de passe doit contenir au moins 6 caract\xe8res"):r.password="Le mot de passe est requis",e.confirmPassword?e.password!==e.confirmPassword&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",e.first_name||(r.first_name="Le pr\xe9nom est requis"),e.last_name||(r.last_name="Le nom est requis"),t(r),0===Object.keys(r).length})()){u(!0);try{const{confirmPassword:r,...o}=e,t=await p.uR.register(o);t.success?(S({type:"success",message:"Inscription r\xe9ussie ! Vous pouvez maintenant vous connecter."}),L("/login")):S({type:"error",message:t.message||"Erreur lors de l'inscription"})}catch(o){console.error("Erreur lors de l'inscription:",o),S({type:"error",message:"Une erreur est survenue lors de l'inscription"})}finally{u(!1)}}},children:[(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"first_name",children:"Pr\xe9nom *"}),(0,h.jsx)(v,{id:"first_name",name:"first_name",type:"text",value:e.first_name,onChange:I,placeholder:"Entrez votre pr\xe9nom",error:!!o.first_name}),o.first_name&&(0,h.jsx)(C,{children:o.first_name})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"last_name",children:"Nom *"}),(0,h.jsx)(v,{id:"last_name",name:"last_name",type:"text",value:e.last_name,onChange:I,placeholder:"Entrez votre nom",error:!!o.last_name}),o.last_name&&(0,h.jsx)(C,{children:o.last_name})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"email",children:"Email *"}),(0,h.jsx)(v,{id:"email",name:"email",type:"email",value:e.email,onChange:I,placeholder:"Entrez votre email",error:!!o.email}),o.email&&(0,h.jsx)(C,{children:o.email})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"password",children:"Mot de passe *"}),(0,h.jsx)(v,{id:"password",name:"password",type:"password",value:e.password,onChange:I,placeholder:"Entrez votre mot de passe",error:!!o.password}),o.password&&(0,h.jsx)(C,{children:o.password})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe *"}),(0,h.jsx)(v,{id:"confirmPassword",name:"confirmPassword",type:"password",value:e.confirmPassword,onChange:I,placeholder:"Confirmez votre mot de passe",error:!!o.confirmPassword}),o.confirmPassword&&(0,h.jsx)(C,{children:o.confirmPassword})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"jobTitle",children:"Fonction"}),(0,h.jsx)(v,{id:"jobTitle",name:"jobTitle",type:"text",value:e.jobTitle,onChange:I,placeholder:"Votre fonction (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"company",children:"Entreprise"}),(0,h.jsx)(v,{id:"company",name:"company",type:"text",value:e.company,onChange:I,placeholder:"Votre entreprise (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,h.jsx)(v,{id:"phone",name:"phone",type:"text",value:e.phone,onChange:I,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{children:"Photo de profil (optionnel)"}),(0,h.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.5rem"},children:[x&&(0,h.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",overflow:"hidden",border:"1px solid #ddd"},children:(0,h.jsx)("img",{src:x,alt:"Aper\xe7u",style:{width:"100%",height:"100%",objectFit:"cover"}})}),(0,h.jsx)(_,{type:"button",onClick:()=>{P.current.click()},style:{backgroundColor:"#f0f0f0",color:"#333",padding:"0.5rem 1rem"},children:"Choisir une image"}),(0,h.jsx)("input",{type:"file",ref:P,onChange:e=>{const o=e.target.files[0];if(o){if(o.size>5242880)return void S({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=new FileReader;e.onloadend=()=>{F(e.result);const o=e.result.split(",")[1];o.length>2097152?S({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):r((e=>({...e,profileImage:o})))},e.readAsDataURL(o)}},accept:"image/*",style:{display:"none"}})]})]}),(0,h.jsx)("div",{style:{fontSize:"0.8rem",color:"#666",marginBottom:"1rem"},children:"* Champs obligatoires"}),(0,h.jsx)(_,{type:"submit",disabled:l,children:l?"Inscription en cours...":"S'inscrire"})]}),(0,h.jsx)(z,{style:{margin:"20px 0"},children:(0,h.jsx)("span",{children:"Ou"})}),(0,h.jsxs)(_,{type:"button",onClick:async()=>{S({type:"info",title:"Fonctionnalit\xe9 en d\xe9veloppement",message:"L'inscription avec Google sera bient\xf4t disponible. Veuillez utiliser la m\xe9thode d'inscription standard pour le moment."})},style:{backgroundColor:"#fff",color:"#333",border:"1px solid #ddd",display:"flex",alignItems:"center",justifyContent:"center",gap:"8px",padding:"10px",width:"100%",marginBottom:"20px",opacity:"0.7",cursor:"default"},children:[(0,h.jsxs)("svg",{width:"18",height:"18",xmlns:"http://www.w3.org/2000/svg",viewBox:"0 0 48 48",children:[(0,h.jsx)("path",{fill:"#FFC107",d:"M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"}),(0,h.jsx)("path",{fill:"#FF3D00",d:"M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"}),(0,h.jsx)("path",{fill:"#4CAF50",d:"M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"}),(0,h.jsx)("path",{fill:"#1976D2",d:"M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"})]}),"S'inscrire avec Google (Bient\xf4t disponible)"]}),(0,h.jsxs)($,{children:["Vous avez d\xe9j\xe0 un compte ? ",(0,h.jsx)(a.N_,{to:"/login",children:"Se connecter"})]})]})})}}}]);
//# sourceMappingURL=101.aa6b5f02.chunk.js.map