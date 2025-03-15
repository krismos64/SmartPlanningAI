"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[101],{7101:(e,r,o)=>{o.r(r),o.d(r,{default:()=>P});var s=o(3750),t=o.n(s),n=o(5043),i=o(3216),a=o(5475),l=o(1529),d=o(4185),m=o(7961),c=o(5016),p=o(4505),h=o(579);const u=l.i7`
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
`,_=l.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.875rem;
`,$=l.Ay.button`
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
`,C=l.Ay.div`
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
`,P=()=>{const[e,r]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:"",profileImage:null}),[o,s]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:""}),[l,u]=(0,n.useState)(!1),[x,P]=(0,n.useState)(null),z=(0,n.useRef)(null),{register:A}=(0,c.A)(),{showNotification:k}=(0,m.hN)(),F=(0,i.Zp)(),S=e=>{const{name:o,value:s}=e.target;r((e=>({...e,[o]:s})))};return(0,h.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"calc(100vh - 200px)"},children:(0,h.jsxs)(f,{children:[(0,h.jsxs)(g,{children:[(0,h.jsx)(j,{children:(0,h.jsx)(t(),{animationData:d,loop:!0})}),(0,h.jsx)("h1",{children:"Cr\xe9er un compte"}),(0,h.jsx)("p",{children:"Rejoignez SmartPlanning AI d\xe8s aujourd'hui"})]}),(0,h.jsxs)(y,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e.email?/\S+@\S+\.\S+/.test(e.email)||(r.email="L'email n'est pas valide"):r.email="L'email est requis",e.password?e.password.length<6&&(r.password="Le mot de passe doit contenir au moins 6 caract\xe8res"):r.password="Le mot de passe est requis",e.confirmPassword?e.password!==e.confirmPassword&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",e.first_name||(r.first_name="Le pr\xe9nom est requis"),e.last_name||(r.last_name="Le nom est requis"),s(r),0===Object.keys(r).length})()){u(!0);try{const{confirmPassword:r,...o}=e,s=await p.uR.register(o);s.success?(k({type:"success",message:"Inscription r\xe9ussie ! Vous pouvez maintenant vous connecter."}),F("/login")):k({type:"error",message:s.message||"Erreur lors de l'inscription"})}catch(o){console.error("Erreur lors de l'inscription:",o),k({type:"error",message:"Une erreur est survenue lors de l'inscription"})}finally{u(!1)}}},children:[(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"first_name",children:"Pr\xe9nom *"}),(0,h.jsx)(v,{id:"first_name",name:"first_name",type:"text",value:e.first_name,onChange:S,placeholder:"Entrez votre pr\xe9nom",error:!!o.first_name}),o.first_name&&(0,h.jsx)(_,{children:o.first_name})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"last_name",children:"Nom *"}),(0,h.jsx)(v,{id:"last_name",name:"last_name",type:"text",value:e.last_name,onChange:S,placeholder:"Entrez votre nom",error:!!o.last_name}),o.last_name&&(0,h.jsx)(_,{children:o.last_name})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"email",children:"Email *"}),(0,h.jsx)(v,{id:"email",name:"email",type:"email",value:e.email,onChange:S,placeholder:"Entrez votre email",error:!!o.email}),o.email&&(0,h.jsx)(_,{children:o.email})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"password",children:"Mot de passe *"}),(0,h.jsx)(v,{id:"password",name:"password",type:"password",value:e.password,onChange:S,placeholder:"Entrez votre mot de passe",error:!!o.password}),o.password&&(0,h.jsx)(_,{children:o.password})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe *"}),(0,h.jsx)(v,{id:"confirmPassword",name:"confirmPassword",type:"password",value:e.confirmPassword,onChange:S,placeholder:"Confirmez votre mot de passe",error:!!o.confirmPassword}),o.confirmPassword&&(0,h.jsx)(_,{children:o.confirmPassword})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"jobTitle",children:"Fonction"}),(0,h.jsx)(v,{id:"jobTitle",name:"jobTitle",type:"text",value:e.jobTitle,onChange:S,placeholder:"Votre fonction (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"company",children:"Entreprise"}),(0,h.jsx)(v,{id:"company",name:"company",type:"text",value:e.company,onChange:S,placeholder:"Votre entreprise (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,h.jsx)(v,{id:"phone",name:"phone",type:"text",value:e.phone,onChange:S,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone (optionnel)"})]}),(0,h.jsxs)(w,{children:[(0,h.jsx)(b,{children:"Photo de profil (optionnel)"}),(0,h.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.5rem"},children:[x&&(0,h.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",overflow:"hidden",border:"1px solid #ddd"},children:(0,h.jsx)("img",{src:x,alt:"Aper\xe7u",style:{width:"100%",height:"100%",objectFit:"cover"}})}),(0,h.jsx)($,{type:"button",onClick:()=>{z.current.click()},style:{backgroundColor:"#f0f0f0",color:"#333",padding:"0.5rem 1rem"},children:"Choisir une image"}),(0,h.jsx)("input",{type:"file",ref:z,onChange:e=>{const o=e.target.files[0];if(o){if(o.size>5242880)return void k({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=new FileReader;e.onloadend=()=>{P(e.result);const o=e.result.split(",")[1];o.length>2097152?k({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):r((e=>({...e,profileImage:o})))},e.readAsDataURL(o)}},accept:"image/*",style:{display:"none"}})]})]}),(0,h.jsx)("div",{style:{fontSize:"0.8rem",color:"#666",marginBottom:"1rem"},children:"* Champs obligatoires"}),(0,h.jsx)($,{type:"submit",disabled:l,children:l?"Inscription en cours...":"S'inscrire"})]}),(0,h.jsxs)(C,{children:["Vous avez d\xe9j\xe0 un compte ? ",(0,h.jsx)(a.N_,{to:"/login",children:"Se connecter"})]})]})})}}}]);
//# sourceMappingURL=101.f8f2452d.chunk.js.map