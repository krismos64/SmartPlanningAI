"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[142],{1821:(e,r,o)=>{o.d(r,{J:()=>n});var t=o(6981);function n(e,r,o){return(0,t.f)(e,7*r,o)}},3031:(e,r,o)=>{o.d(r,{P:()=>n});var t=o(2316);function n(e,r){return(0,t.a)(e,r?.in).getDay()}},6465:(e,r,o)=>{o.d(r,{r:()=>s});var t=o(1844),n=o(1176);function s(e,r,o){const[s,a]=(0,t.x)(o?.in,e,r);return+(0,n.o)(s)===+(0,n.o)(a)}},6981:(e,r,o)=>{o.d(r,{f:()=>s});var t=o(2440),n=o(2316);function s(e,r,o){const s=(0,n.a)(e,o?.in);return isNaN(r)?(0,t.w)(o?.in||e,NaN):r?(s.setDate(s.getDate()+r),s):s}},7101:(e,r,o)=>{o.r(r),o.d(r,{default:()=>P});var t=o(3750),n=o.n(t),s=o(5043),a=o(3216),i=o(5475),l=o(1529),d=o(4185),m=o(7961),c=o(5016),p=o(4505),u=o(579);const h=l.i7`
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
`,x=l.Ay.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  animation: ${h} 0.5s ease-out;
`,g=l.Ay.div`
  text-align: center;
  margin-bottom: 2rem;
`,j=l.Ay.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: ${e=>{let{theme:r}=e;return r.spacing.md}};
  animation: ${f} 2s infinite ease-in-out;
`,y=l.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,w=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,v=l.Ay.label`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,b=l.Ay.input`
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
`,P=()=>{const[e,r]=(0,s.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:"",profileImage:null}),[o,t]=(0,s.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:""}),[l,h]=(0,s.useState)(!1),[f,P]=(0,s.useState)(null),k=(0,s.useRef)(null),{register:S}=(0,c.A)(),{showNotification:z}=(0,m.hN)(),A=(0,a.Zp)(),F=e=>{const{name:o,value:t}=e.target;r((e=>({...e,[o]:t})))};return(0,u.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"calc(100vh - 200px)"},children:(0,u.jsxs)(x,{children:[(0,u.jsxs)(g,{children:[(0,u.jsx)(j,{children:(0,u.jsx)(n(),{animationData:d,loop:!0})}),(0,u.jsx)("h1",{children:"Cr\xe9er un compte"}),(0,u.jsx)("p",{children:"Rejoignez SmartPlanning AI d\xe8s aujourd'hui"})]}),(0,u.jsxs)(y,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e.email?/\S+@\S+\.\S+/.test(e.email)||(r.email="L'email n'est pas valide"):r.email="L'email est requis",e.password?e.password.length<6&&(r.password="Le mot de passe doit contenir au moins 6 caract\xe8res"):r.password="Le mot de passe est requis",e.confirmPassword?e.password!==e.confirmPassword&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",e.first_name||(r.first_name="Le pr\xe9nom est requis"),e.last_name||(r.last_name="Le nom est requis"),t(r),0===Object.keys(r).length})()){h(!0);try{const{confirmPassword:r,...o}=e,t=await p.uR.register(o);t.success?(z({type:"success",message:"Inscription r\xe9ussie ! Vous pouvez maintenant vous connecter."}),A("/login")):z({type:"error",message:t.message||"Erreur lors de l'inscription"})}catch(o){console.error("Erreur lors de l'inscription:",o),z({type:"error",message:"Une erreur est survenue lors de l'inscription"})}finally{h(!1)}}},children:[(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"first_name",children:"Pr\xe9nom *"}),(0,u.jsx)(b,{id:"first_name",name:"first_name",type:"text",value:e.first_name,onChange:F,placeholder:"Entrez votre pr\xe9nom",error:!!o.first_name}),o.first_name&&(0,u.jsx)(_,{children:o.first_name})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"last_name",children:"Nom *"}),(0,u.jsx)(b,{id:"last_name",name:"last_name",type:"text",value:e.last_name,onChange:F,placeholder:"Entrez votre nom",error:!!o.last_name}),o.last_name&&(0,u.jsx)(_,{children:o.last_name})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"email",children:"Email *"}),(0,u.jsx)(b,{id:"email",name:"email",type:"email",value:e.email,onChange:F,placeholder:"Entrez votre email",error:!!o.email}),o.email&&(0,u.jsx)(_,{children:o.email})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"password",children:"Mot de passe *"}),(0,u.jsx)(b,{id:"password",name:"password",type:"password",value:e.password,onChange:F,placeholder:"Entrez votre mot de passe",error:!!o.password}),o.password&&(0,u.jsx)(_,{children:o.password})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe *"}),(0,u.jsx)(b,{id:"confirmPassword",name:"confirmPassword",type:"password",value:e.confirmPassword,onChange:F,placeholder:"Confirmez votre mot de passe",error:!!o.confirmPassword}),o.confirmPassword&&(0,u.jsx)(_,{children:o.confirmPassword})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"jobTitle",children:"Fonction"}),(0,u.jsx)(b,{id:"jobTitle",name:"jobTitle",type:"text",value:e.jobTitle,onChange:F,placeholder:"Votre fonction (optionnel)"})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"company",children:"Entreprise"}),(0,u.jsx)(b,{id:"company",name:"company",type:"text",value:e.company,onChange:F,placeholder:"Votre entreprise (optionnel)"})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,u.jsx)(b,{id:"phone",name:"phone",type:"text",value:e.phone,onChange:F,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone (optionnel)"})]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(v,{children:"Photo de profil (optionnel)"}),(0,u.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.5rem"},children:[f&&(0,u.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",overflow:"hidden",border:"1px solid #ddd"},children:(0,u.jsx)("img",{src:f,alt:"Aper\xe7u",style:{width:"100%",height:"100%",objectFit:"cover"}})}),(0,u.jsx)($,{type:"button",onClick:()=>{k.current.click()},style:{backgroundColor:"#f0f0f0",color:"#333",padding:"0.5rem 1rem"},children:"Choisir une image"}),(0,u.jsx)("input",{type:"file",ref:k,onChange:e=>{const o=e.target.files[0];if(o){if(o.size>5242880)return void z({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=new FileReader;e.onloadend=()=>{P(e.result);const o=e.result.split(",")[1];o.length>2097152?z({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):r((e=>({...e,profileImage:o})))},e.readAsDataURL(o)}},accept:"image/*",style:{display:"none"}})]})]}),(0,u.jsx)("div",{style:{fontSize:"0.8rem",color:"#666",marginBottom:"1rem"},children:"* Champs obligatoires"}),(0,u.jsx)($,{type:"submit",disabled:l,children:l?"Inscription en cours...":"S'inscrire"})]}),(0,u.jsxs)(C,{children:["Vous avez d\xe9j\xe0 un compte ? ",(0,u.jsx)(i.N_,{to:"/login",children:"Se connecter"})]})]})})}},7358:(e,r,o)=>{o.d(r,{Y:()=>n});var t=o(2316);function n(e,r){return+(0,t.a)(e)<+(0,t.a)(r)}},7735:(e,r,o)=>{o.d(r,{d:()=>n});var t=o(2316);function n(e,r){return+(0,t.a)(e)>+(0,t.a)(r)}},8605:(e,r,o)=>{o.d(r,{$:()=>s});var t=o(849),n=o(2316);function s(e,r){const o=(0,t.q)(),s=r?.weekStartsOn??r?.locale?.options?.weekStartsOn??o.weekStartsOn??o.locale?.options?.weekStartsOn??0,a=(0,n.a)(e,r?.in),i=a.getDay(),l=6+(i<s?-7:0)-(i-s);return a.setDate(a.getDate()+l),a.setHours(23,59,59,999),a}}}]);
//# sourceMappingURL=142.b2a7039e.chunk.js.map