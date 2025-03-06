"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[618],{1618:(e,r,s)=>{s.r(r),s.d(r,{default:()=>z});var o=s(3750),t=s.n(o),n=s(5043),a=s(3216),i=s(5475),l=s(5464),m=s(4185),d=s(7961),c=s(5016),p=s(4227);const h=async e=>{try{const r=await(0,p.AT)(p.Sn.REGISTER,"POST",{...e,first_name:e.first_name,last_name:e.last_name});return r.error?{success:!1,message:r.error}:{success:!0,user:r}}catch(r){return{success:!1,message:r.message||"Erreur d'inscription"}}};var u=s(579);const x=l.i7`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,f=l.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,g=l.Ay.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  animation: ${x} 0.5s ease-out;
`,j=l.Ay.div`
  text-align: center;
  margin-bottom: 2rem;
`,y=l.Ay.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: ${e=>{let{theme:r}=e;return r.spacing.md}};
  animation: ${f} 2s infinite ease-in-out;
`,w=l.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,b=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,v=l.Ay.label`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,_=l.Ay.input`
  padding: 0.75rem;
  border: 1px solid
    ${e=>{let{theme:r,error:s}=e;return s?r.colors.error:r.colors.border}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r,error:s}=e;return s?r.colors.error:r.colors.primary}};
    box-shadow: 0 0 0 2px
      ${e=>{let{theme:r,error:s}=e;return s?`${r.colors.error}33`:`${r.colors.primary}33`}};
  }
`,$=l.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.875rem;
`,C=l.Ay.button`
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
`,P=l.Ay.div`
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
`,z=()=>{const[e,r]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:"",profileImage:null}),[s,o]=(0,n.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:""}),[l,p]=(0,n.useState)(!1),[x,f]=(0,n.useState)(null),z=(0,n.useRef)(null),{register:A}=(0,c.A)(),{showNotification:S}=(0,d.hN)(),k=(0,a.Zp)(),F=e=>{const{name:s,value:o}=e.target;r((e=>({...e,[s]:o})))};return(0,u.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"calc(100vh - 200px)"},children:(0,u.jsxs)(g,{children:[(0,u.jsxs)(j,{children:[(0,u.jsx)(y,{children:(0,u.jsx)(t(),{animationData:m,loop:!0})}),(0,u.jsx)("h1",{children:"Cr\xe9er un compte"}),(0,u.jsx)("p",{children:"Rejoignez SmartPlanning AI d\xe8s aujourd'hui"})]}),(0,u.jsxs)(w,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e.email?/\S+@\S+\.\S+/.test(e.email)||(r.email="L'email n'est pas valide"):r.email="L'email est requis",e.password?e.password.length<6&&(r.password="Le mot de passe doit contenir au moins 6 caract\xe8res"):r.password="Le mot de passe est requis",e.confirmPassword?e.password!==e.confirmPassword&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",e.first_name||(r.first_name="Le pr\xe9nom est requis"),e.last_name||(r.last_name="Le nom est requis"),o(r),0===Object.keys(r).length})()){p(!0);try{const{confirmPassword:r,...s}=e,o=await h(s);o.success?(S({type:"success",message:"Inscription r\xe9ussie ! Vous pouvez maintenant vous connecter."}),k("/login")):S({type:"error",message:o.message||"Erreur lors de l'inscription"})}catch(s){console.error("Erreur lors de l'inscription:",s),S({type:"error",message:"Une erreur est survenue lors de l'inscription"})}finally{p(!1)}}},children:[(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"first_name",children:"Pr\xe9nom *"}),(0,u.jsx)(_,{id:"first_name",name:"first_name",type:"text",value:e.first_name,onChange:F,placeholder:"Entrez votre pr\xe9nom",error:!!s.first_name}),s.first_name&&(0,u.jsx)($,{children:s.first_name})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"last_name",children:"Nom *"}),(0,u.jsx)(_,{id:"last_name",name:"last_name",type:"text",value:e.last_name,onChange:F,placeholder:"Entrez votre nom",error:!!s.last_name}),s.last_name&&(0,u.jsx)($,{children:s.last_name})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"email",children:"Email *"}),(0,u.jsx)(_,{id:"email",name:"email",type:"email",value:e.email,onChange:F,placeholder:"Entrez votre email",error:!!s.email}),s.email&&(0,u.jsx)($,{children:s.email})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"password",children:"Mot de passe *"}),(0,u.jsx)(_,{id:"password",name:"password",type:"password",value:e.password,onChange:F,placeholder:"Entrez votre mot de passe",error:!!s.password}),s.password&&(0,u.jsx)($,{children:s.password})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe *"}),(0,u.jsx)(_,{id:"confirmPassword",name:"confirmPassword",type:"password",value:e.confirmPassword,onChange:F,placeholder:"Confirmez votre mot de passe",error:!!s.confirmPassword}),s.confirmPassword&&(0,u.jsx)($,{children:s.confirmPassword})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"jobTitle",children:"Fonction"}),(0,u.jsx)(_,{id:"jobTitle",name:"jobTitle",type:"text",value:e.jobTitle,onChange:F,placeholder:"Votre fonction (optionnel)"})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"company",children:"Entreprise"}),(0,u.jsx)(_,{id:"company",name:"company",type:"text",value:e.company,onChange:F,placeholder:"Votre entreprise (optionnel)"})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,u.jsx)(_,{id:"phone",name:"phone",type:"text",value:e.phone,onChange:F,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone (optionnel)"})]}),(0,u.jsxs)(b,{children:[(0,u.jsx)(v,{children:"Photo de profil (optionnel)"}),(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.5rem"},children:[x&&(0,u.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",overflow:"hidden",border:"1px solid #ddd"},children:(0,u.jsx)("img",{src:x,alt:"Aper\xe7u",style:{width:"100%",height:"100%",objectFit:"cover"}})}),(0,u.jsx)(C,{type:"button",onClick:()=>{z.current.click()},style:{backgroundColor:"#f0f0f0",color:"#333",padding:"0.5rem 1rem"},children:"Choisir une image"}),(0,u.jsx)("input",{type:"file",ref:z,onChange:e=>{const s=e.target.files[0];if(s){if(s.size>5242880)return void S({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=new FileReader;e.onloadend=()=>{f(e.result);const s=e.result.split(",")[1];s.length>2097152?S({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):r((e=>({...e,profileImage:s})))},e.readAsDataURL(s)}},accept:"image/*",style:{display:"none"}})]})]}),(0,u.jsx)("div",{style:{fontSize:"0.8rem",color:"#666",marginBottom:"1rem"},children:"* Champs obligatoires"}),(0,u.jsx)(C,{type:"submit",disabled:l,children:l?"Inscription en cours...":"S'inscrire"})]}),(0,u.jsxs)(P,{children:["Vous avez d\xe9j\xe0 un compte ? ",(0,u.jsx)(i.N_,{to:"/login",children:"Se connecter"})]})]})})}}}]);
//# sourceMappingURL=618.94856047.chunk.js.map