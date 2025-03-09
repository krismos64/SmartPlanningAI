"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[198],{3198:(e,r,o)=>{o.r(r),o.d(r,{default:()=>M});var t=o(5043),l=o(1529),n=o(7961),i=o(4227),a=o(5016);var s=o(579);const m=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
`,d=l.Ay.div`
  margin-bottom: 2rem;
`,c=l.Ay.h1`
  font-size: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,u=l.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1.1rem;
`,h=l.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,p=l.Ay.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.sm}}) {
    flex-direction: column;
    align-items: flex-start;
  }
`,f=l.Ay.div`
  position: relative;
  width: 100px;
  height: 100px;
`,g=l.Ay.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
  overflow: hidden;
`,x=l.Ay.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`,y=l.Ay.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.small}};

  &:hover {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primaryDark}};
  }
`,j=l.Ay.input`
  display: none;
`,b=l.Ay.div`
  display: flex;
  flex-direction: column;
`,v=l.Ay.h2`
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,_=l.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1rem;
  margin-bottom: 0.5rem;
`,$=l.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.9rem;
`,w=l.Ay.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`,A=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,k=l.Ay.h3`
  font-size: 1.2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
`,z=l.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`,C=l.Ay.label`
  font-size: 0.9rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-weight: 500;
`,T=l.Ay.input`
  padding: 0.75rem 1rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  border: 1px solid
    ${e=>{let{theme:r,error:o}=e;return o?r.colors.error:r.colors.border}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  font-size: 1rem;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }

  &::placeholder {
    color: ${e=>{let{theme:r}=e;return r.colors.text.tertiary}};
  }
`,I=l.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.error}};
  font-size: 0.8rem;
  margin-top: 0.25rem;
`,E=l.Ay.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`,U=l.Ay.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`,F=(0,l.Ay)(U)`
  background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primaryDark}};
  }
`,S=(0,l.Ay)(U)`
  background-color: transparent;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  border: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:hover:not(:disabled) {
    background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  }
`,M=()=>{const{user:e,updateUser:r}=(0,a.A)(),{showNotification:o}=(0,n.hN)(),l=(0,t.useRef)(null),[U,M]=(0,t.useState)(!1),[N,R]=(0,t.useState)(!1),[P,V]=(0,t.useState)(null),[L,D]=(0,t.useState)(null),{first_name:B,last_name:G,fullName:H,initials:q}=(e=>{const r=(0,t.useMemo)((()=>(null===e||void 0===e?void 0:e.first_name)||""),[e]),o=(0,t.useMemo)((()=>(null===e||void 0===e?void 0:e.last_name)||""),[e]),l=(0,t.useMemo)((()=>r&&o?`${r} ${o}`:(null===e||void 0===e?void 0:e.email)||"Utilisateur inconnu"),[r,o,e]),n=(0,t.useMemo)((()=>{var t,l;return r&&o?`${r[0]}${o[0]}`.toUpperCase():(null===e||void 0===e||null===(t=e.email)||void 0===t||null===(l=t[0])||void 0===l?void 0:l.toUpperCase())||"U"}),[r,o,e]);return{first_name:r,last_name:o,fullName:l,initials:n}})(e),[J,O]=(0,t.useState)({first_name:(null===e||void 0===e?void 0:e.first_name)||"",last_name:(null===e||void 0===e?void 0:e.last_name)||"",email:(null===e||void 0===e?void 0:e.email)||"",company:(null===e||void 0===e?void 0:e.company)||"",phone:(null===e||void 0===e?void 0:e.phone)||"",jobTitle:(null===e||void 0===e?void 0:e.jobTitle)||""}),[K,Q]=(0,t.useState)({}),[W,X]=(0,t.useState)(!1);(0,t.useEffect)((()=>{e&&O({first_name:e.first_name||"",last_name:e.last_name||"",email:e.email||"",company:e.company||"",phone:e.phone||"",jobTitle:e.jobTitle||""})}),[e]);const Y=e=>{const{name:r,value:o}=e.target;O((e=>({...e,[r]:o})))};return(0,s.jsxs)(m,{children:[(0,s.jsxs)(d,{children:[(0,s.jsx)(c,{children:"Mon profil"}),(0,s.jsx)(u,{children:"G\xe9rez vos informations personnelles."})]}),(0,s.jsxs)(h,{children:[(0,s.jsxs)(p,{children:[(0,s.jsxs)(f,{children:[(0,s.jsx)(g,{children:L?(0,s.jsx)(x,{src:L,alt:"Photo de profil"}):null!==e&&void 0!==e&&e.profileImage?(0,s.jsx)(x,{src:`data:image/jpeg;base64,${e.profileImage}`,alt:"Photo de profil"}):q}),N&&(0,s.jsxs)(s.Fragment,{children:[(0,s.jsx)(y,{onClick:()=>{l.current.click()},title:"Changer la photo de profil",children:(0,s.jsx)("i",{className:"fas fa-camera"})}),(0,s.jsx)(j,{type:"file",ref:l,onChange:e=>{const r=e.target.files[0];if(r){if(r.size>5242880)return void o({type:"error",title:"Fichier trop volumineux",message:"La taille de l'image ne doit pas d\xe9passer 5MB"});const e=function(e){let r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:800,o=arguments.length>2&&void 0!==arguments[2]?arguments[2]:800,t=arguments.length>3&&void 0!==arguments[3]?arguments[3]:.7;return new Promise((l=>{const n=new FileReader;n.readAsDataURL(e),n.onload=e=>{const n=new Image;n.src=e.target.result,n.onload=()=>{const e=document.createElement("canvas");let i=n.width,a=n.height;i>a?i>r&&(a=Math.round(a*r/i),i=r):a>o&&(i=Math.round(i*o/a),a=o),e.width=i,e.height=a;e.getContext("2d").drawImage(n,0,0,i,a);const s=e.toDataURL("image/jpeg",t);l(s)}}}))};e(r).then((e=>{D(e);const r=e.split(",")[1];r.length>2097152?o({type:"error",title:"Image trop volumineuse",message:"Veuillez choisir une image de plus petite taille ou de qualit\xe9 inf\xe9rieure"}):V(r)}))}},accept:"image/*"})]})]}),(0,s.jsxs)(b,{children:[(0,s.jsx)(v,{children:H}),(0,s.jsx)(_,{children:(()=>{if(!e)return"Utilisateur";switch(e.role){case"admin":return"Administrateur";case"manager":return"Gestionnaire";case"employee":return"Employ\xe9";default:return"Utilisateur"}})()}),(0,s.jsx)($,{children:null===e||void 0===e?void 0:e.email})]})]}),N?(0,s.jsxs)(w,{onSubmit:async e=>{e.preventDefault(),X(!0);try{const t=localStorage.getItem("token"),l={...J,...P?{profileImage:P}:{}};if(console.log("Envoi des donn\xe9es de profil:",{...l,profileImageLength:l.profileImage?l.profileImage.length:0}),console.log("URL de l'API:",`${i.H$}/api/auth/profile`),l.profileImage&&l.profileImage.length>1048576)return o({type:"warning",title:"Image trop volumineuse",message:"La photo de profil semble poser probl\xe8me pour \xeatre sauvegard\xe9e. Essayez avec une image plus petite."}),void X(!1);const n=await fetch(`${i.H$}/api/auth/profile`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify(l),credentials:"include"});if(console.log("R\xe9ponse re\xe7ue:",n.status,n.statusText),!n.ok){let r="Erreur lors de la mise \xe0 jour du profil";try{r=(await n.json()).message||r}catch(e){}throw new Error(r)}const a=await n.json();r(a),O({first_name:a.first_name||"",last_name:a.last_name||"",email:a.email||"",company:a.company||"",phone:a.phone||"",jobTitle:a.jobTitle||""}),D(null),o({type:"success",title:"Profil mis \xe0 jour",message:"Vos informations ont \xe9t\xe9 mises \xe0 jour avec succ\xe8s"})}catch(t){console.error("Erreur lors de la mise \xe0 jour du profil:",t),o({type:"error",title:"Erreur",message:t.message||"Une erreur est survenue lors de la mise \xe0 jour du profil"}),(t.message.includes("fetch")||t.message.includes("network"))&&o({type:"warning",title:"Probl\xe8me avec l'image",message:"La photo de profil semble poser probl\xe8me pour \xeatre sauvegard\xe9e. Essayez avec une image plus petite."})}finally{X(!1)}},children:[(0,s.jsxs)(A,{children:[(0,s.jsx)(k,{children:"Informations personnelles"}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"first_name",children:"Pr\xe9nom"}),(0,s.jsx)(T,{id:"first_name",name:"first_name",value:J.first_name,onChange:Y,placeholder:"Votre pr\xe9nom",error:K.first_name}),K.first_name&&(0,s.jsx)(I,{children:K.first_name})]}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"last_name",children:"Nom"}),(0,s.jsx)(T,{id:"last_name",name:"last_name",value:J.last_name,onChange:Y,placeholder:"Votre nom",error:K.last_name}),K.last_name&&(0,s.jsx)(I,{children:K.last_name})]}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"email",children:"Email"}),(0,s.jsx)(T,{id:"email",name:"email",type:"email",value:J.email,onChange:Y,placeholder:"Votre email",error:K.email}),K.email&&(0,s.jsx)(I,{children:K.email})]}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"jobTitle",children:"Fonction"}),(0,s.jsx)(T,{id:"jobTitle",name:"jobTitle",value:J.jobTitle,onChange:Y,placeholder:"Votre fonction"})]})]}),(0,s.jsxs)(A,{children:[(0,s.jsx)(k,{children:"Coordonn\xe9es"}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"phone",children:"T\xe9l\xe9phone"}),(0,s.jsx)(T,{id:"phone",name:"phone",value:J.phone,onChange:Y,placeholder:"Votre num\xe9ro de t\xe9l\xe9phone"})]}),(0,s.jsxs)(z,{children:[(0,s.jsx)(C,{htmlFor:"company",children:"Entreprise"}),(0,s.jsx)(T,{id:"company",name:"company",value:J.company,onChange:Y,placeholder:"Votre entreprise"})]})]}),(0,s.jsxs)(E,{children:[(0,s.jsx)(S,{type:"button",onClick:()=>{e&&O({first_name:e.first_name||"",last_name:e.last_name||"",first_name:e.firstName||"",last_name:e.lastName||"",email:e.email||"",phone:e.phone||"",company:e.company||"",jobTitle:e.jobTitle||""}),D(null),Q({}),R(!1)},children:"Annuler"}),(0,s.jsx)(F,{type:"submit",disabled:W,children:W?"Enregistrement...":"Enregistrer les modifications"})]})]}):(0,s.jsx)(E,{children:(0,s.jsx)(F,{onClick:()=>R(!0),children:"Modifier mon profil"})})]})]})}}}]);
//# sourceMappingURL=198.e14f8d94.chunk.js.map