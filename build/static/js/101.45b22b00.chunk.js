"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[101],{4505:(e,r,s)=>{s.d(r,{uR:()=>n,uX:()=>t,wv:()=>a});var o=s(4227);const n={login:async(e,r)=>{console.log("\ud83d\udd10 Tentative de connexion avec:",{email:e,password:"***"});try{const s=await(0,o.AT)(o.Sn.LOGIN,"POST",{email:e,password:r});return s.error?(console.error("\u274c Erreur de connexion:",s.error),{success:!1,message:s.error}):s.token?(console.log("\u2705 Connexion r\xe9ussie, token re\xe7u"),localStorage.setItem("token",s.token),localStorage.setItem("user",JSON.stringify({id:s.id,email:s.email,role:s.role,first_name:s.first_name,last_name:s.last_name})),{success:!0,user:s}):(console.error("\u274c Connexion \xe9chou\xe9e: pas de token re\xe7u"),{success:!1,message:"Erreur d'authentification"})}catch(s){return console.error("\u274c Erreur lors de la connexion:",s),{success:!1,message:s.message||"Erreur de connexion"}}},register:async e=>{try{const r=await(0,o.AT)(o.Sn.REGISTER,"POST",{...e,first_name:e.first_name,last_name:e.last_name});return r.error?{success:!1,message:r.error}:{success:!0,user:r}}catch(r){return{success:!1,message:r.message||"Erreur d'inscription"}}},logout:()=>(localStorage.removeItem("token"),localStorage.removeItem("user"),{success:!0}),getCurrentUser:()=>{const e=localStorage.getItem("user");if(!e)return null;try{return JSON.parse(e)}catch(r){return console.error("Erreur lors de la r\xe9cup\xe9ration de l'utilisateur:",r),null}}},t={getAll:async()=>{try{const e=await(0,o.AT)(o.Sn.WEEKLY_SCHEDULES,"GET");return e.error?{success:!1,message:e.error}:{success:!0,schedules:e}}catch(e){return{success:!1,message:e.message||"Erreur lors de la r\xe9cup\xe9ration des plannings"}}},getByWeek:async e=>{try{const r=await(0,o.AT)(`${o.Sn.WEEKLY_SCHEDULES}?weekStart=${e}`,"GET");return r.error?{success:!1,message:r.error}:{success:!0,schedules:r}}catch(r){return{success:!1,message:r.message||"Erreur lors de la r\xe9cup\xe9ration des plannings pour cette semaine"}}},getByEmployee:async e=>{try{const r=await(0,o.AT)(`${o.Sn.EMPLOYEES.SCHEDULES(e)}`,"GET");return r.error?{success:!1,message:r.error}:{success:!0,schedules:r}}catch(r){return{success:!1,message:r.message||"Erreur lors de la r\xe9cup\xe9ration des plannings de l'employ\xe9"}}},getByEmployeeAndWeek:async(e,r)=>{try{const s=await(0,o.AT)(`${o.Sn.EMPLOYEES.SCHEDULES(e)}?weekStart=${r}`,"GET");return s.error?{success:!1,message:s.error}:{success:!0,schedule:s}}catch(s){return{success:!1,message:s.message||"Erreur lors de la r\xe9cup\xe9ration du planning"}}},create:async e=>{try{const r=await(0,o.AT)(o.Sn.WEEKLY_SCHEDULES,"POST",e);return r.error?{success:!1,message:r.error}:{success:!0,schedule:r}}catch(r){return{success:!1,message:r.message||"Erreur lors de la cr\xe9ation du planning"}}},update:async(e,r)=>{try{const s=await(0,o.AT)(`${o.Sn.WEEKLY_SCHEDULES}/${e}`,"PUT",r);return s.error?{success:!1,message:s.error}:{success:!0,schedule:s}}catch(s){return{success:!1,message:s.message||"Erreur lors de la mise \xe0 jour du planning"}}},delete:async e=>{try{const r=await(0,o.AT)(`${o.Sn.WEEKLY_SCHEDULES}/${e}`,"DELETE");return r.error?{success:!1,message:r.error}:{success:!0}}catch(r){return{success:!1,message:r.message||"Erreur lors de la suppression du planning"}}}},a={getByEmployee:async e=>{try{const r=await(0,o.AT)(o.Sn.HOUR_BALANCE.BY_EMPLOYEE(e),"GET");if(r&&r.error)return{success:!1,message:r.error};if(r&&"undefined"!==typeof r.balance)return{success:!0,balance:r.balance};if(r&&"object"===typeof r){if("undefined"!==typeof r.hour_balance)return{success:!0,balance:r.hour_balance};if(1===Object.keys(r).length&&"number"===typeof Object.values(r)[0])return{success:!0,balance:Object.values(r)[0]}}return console.warn(`Avertissement: Format de r\xe9ponse inattendu pour le solde d'heures de l'employ\xe9 ${e}:`,r),{success:!0,balance:0}}catch(r){return console.warn("Avertissement lors de la r\xe9cup\xe9ration du solde d'heures:",r),{success:!1,message:r.message||"Erreur lors de la r\xe9cup\xe9ration du solde d'heures"}}},updateBalance:async(e,r)=>{try{const s=await(0,o.AT)(o.Sn.HOUR_BALANCE.BY_EMPLOYEE(e),"PUT",r);return s&&s.error?{success:!1,message:s.error}:{success:!0,balance:s.balance||s.hour_balance||("number"===typeof s?s:0)}}catch(s){return console.error("Erreur lors de la mise \xe0 jour du solde d'heures:",s),{success:!1,message:s.message||"Erreur lors de la mise \xe0 jour du solde d'heures"}}}}},7101:(e,r,s)=>{s.r(r),s.d(r,{default:()=>A});var o=s(3750),n=s.n(o),t=s(5043),a=s(3216),l=s(5475),i=s(5464),c=s(4185),u=s(7961),d=s(5016),m=s(4505),p=s(579);const h=i.i7`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`,g=i.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,y=i.Ay.div`
  width: 100%;
  max-width: 400px;
  padding: 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  animation: ${h} 0.5s ease-out;
`,f=i.Ay.div`
  text-align: center;
  margin-bottom: 2rem;
`,x=i.Ay.div`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: ${e=>{let{theme:r}=e;return r.spacing.md}};
  animation: ${g} 2s infinite ease-in-out;
`,E=i.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,j=i.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,w=i.Ay.label`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,b=i.Ay.input`
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
`,S=i.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.875rem;
`,v=i.Ay.button`
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
`,_=i.Ay.div`
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
`,A=()=>{const[e,r]=(0,t.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:"",profileImage:null}),[s,o]=(0,t.useState)({email:"",password:"",confirmPassword:"",first_name:"",last_name:"",company:"",phone:"",jobTitle:""}),[i,h]=(0,t.useState)(!1),[g,A]=(0,t.useState)(null),T=(0,t.useRef)(null),{register:C}=(0,d.A)(),{showNotification:$}=(0,u.hN)(),L=(0,a.Zp)(),P=e=>{const{name:s,value:o}=e.target;r((e=>({...e,[s]:o})))};return(0,p.jsx)("div",{style:{display:"flex",justifyContent:"center",alignItems:"center",minHeight:"calc(100vh - 200px)"},children:(0,p.jsxs)(y,{children:[(0,p.jsxs)(f,{children:[(0,p.jsx)(x,{children:(0,p.jsx)(n(),{animationData:c,loop:!0})}),(0,p.jsx)("h1",{children:"Cr\xe9er un compte"}),(0,p.jsx)("p",{children:"Rejoignez SmartPlanning AI d\xe8s aujourd'hui"})]}),(0,p.jsxs)(E,{onSubmit:async r=>{if(r.preventDefault(),(()=>{const r={};return e.email?/\S+@\S+\.\S+/.test(e.email)||(r.email="L'email n'est pas valide"):r.email="L'email est requis",e.password?e.password.length<6&&(r.password="Le mot de passe doit contenir au moins 6 caract\xe8res"):r.password="Le mot de passe est requis",e.confirmPassword?e.password!==e.confirmPassword&&(r.confirmPassword="Les mots de passe ne correspondent pas"):r.confirmPassword="La confirmation du mot de passe est requise",e.first_name||(r.first_name="Le pr\xe9nom est requis"),e.last_name||(r.last_name="Le nom est requis"),o(r),0===Object.keys(r).length})()){h(!0);try{const{confirmPassword:r,...s}=e,o=await m.uR.register(s);o.success?($({type:"success",message:"Inscription r\xe9ussie ! Vous pouvez maintenant vous connecter."}),L("/login")):$({type:"error",message:o.message||"Erreur lors de l'inscription"})}catch(s){console.error("Erreur lors de l'inscription:",s),$({type:"error",message:"Une erreur est survenue lors de l'inscription"})}finally{h(!1)}}},children:[(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"first_name",children:"Pr\xe9nom *"}),(0,p.jsx)(b,{id:"first_name",name:"first_name",type:"text",value:e.first_name,onChange:P,placeholder:"Entrez votre pr\xe9nom",error:!!s.first_name}),s.first_name&&(0,p.jsx)(S,{children:s.first_name})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"last_name",children:"Nom *"}),(0,p.jsx)(b,{id:"last_name",name:"last_name",type:"text",value:e.last_name,onChange:P,placeholder:"Entrez votre nom",error:!!s.last_name}),s.last_name&&(0,p.jsx)(S,{children:s.last_name})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"email",children:"Email *"}),(0,p.jsx)(b,{id:"email",name:"email",type:"email",value:e.email,onChange:P,placeholder:"Entrez votre email",error:!!s.email}),s.email&&(0,p.jsx)(S,{children:s.email})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"password",children:"Mot de passe *"}),(0,p.jsx)(b,{id:"password",name:"password",type:"password",value:e.password,onChange:P,placeholder:"Entrez votre mot de passe",error:!!s.password}),s.password&&(0,p.jsx)(S,{children:s.password})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"confirmPassword",children:"Confirmer le mot de passe *"}),(0,p.jsx)(b,{id:"confirmPassword",name:"confirmPassword",type:"password",value:e.confirmPassword,onChange:P,placeholder:"Confirmez votre mot de passe",error:!!s.confirmPassword}),s.confirmPassword&&(0,p.jsx)(S,{children:s.confirmPassword})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"jobTitle",children:"Fonction"}),(0,p.jsx)(b,{id:"jobTitle",name:"jobTitle",type:"text",value:e.jobTitle,onChange:P,placeholder:"Votre fonction (optionnel)"})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"company",children:"Entreprise"}),(0,p.jsx)(b,{id:"company",name:"company",type:"text",value:e.company,onChange:P,placeholder:"Votre entreprise (optionnel)"})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,p.jsx)(b,{id:"phone",name:"phone",type:"text",value:e.phone,onChange:P,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone (optionnel)"})]}),(0,p.jsxs)(j,{children:[(0,p.jsx)(w,{children:"Photo de profil (optionnel)"}),(0,p.jsxs)("div",{style:{display:"flex",alignItems:"center",gap:"1rem",marginTop:"0.5rem"},children:[g&&(0,p.jsx)("div",{style:{width:"60px",height:"60px",borderRadius:"50%",overflow:"hidden",border:"1px solid #ddd"},children:(0,p.jsx)("img",{src:g,alt:"Aper\xe7u",style:{width:"100%",height:"100%",objectFit:"cover"}})}),(0,p.jsx)(v,{type:"button",onClick:()=>{T.current.click()},style:{backgroundColor:"#f0f0f0",color:"#333",padding:"0.5rem 1rem"},children:"Choisir une image"}),(0,p.jsx)("input",{type:"file",ref:T,onChange:e=>{const s=e.target.files[0];if(s){if(s.size>5242880)return void $({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=new FileReader;e.onloadend=()=>{A(e.result);const s=e.result.split(",")[1];s.length>2097152?$({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):r((e=>({...e,profileImage:s})))},e.readAsDataURL(s)}},accept:"image/*",style:{display:"none"}})]})]}),(0,p.jsx)("div",{style:{fontSize:"0.8rem",color:"#666",marginBottom:"1rem"},children:"* Champs obligatoires"}),(0,p.jsx)(v,{type:"submit",disabled:i,children:i?"Inscription en cours...":"S'inscrire"})]}),(0,p.jsxs)(_,{children:["Vous avez d\xe9j\xe0 un compte ? ",(0,p.jsx)(l.N_,{to:"/login",children:"Se connecter"})]})]})})}}}]);
//# sourceMappingURL=101.45b22b00.chunk.js.map