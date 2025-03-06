"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[202],{2202:(e,r,t)=>{t.r(r),t.d(r,{default:()=>y});var o=t(5464),i=t(3681),n=t(579);const s=o.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,l=o.Ay.div`
  margin-bottom: 2rem;
`,d=o.Ay.h1`
  font-size: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,c=o.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1.1rem;
`,a=o.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
`,h=o.Ay.div`
  margin-bottom: 2rem;

  &:last-child {
    margin-bottom: 0;
  }
`,m=o.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};
`,p=o.Ay.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,u=o.Ay.div`
  display: flex;
  flex-direction: column;
`,x=o.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.25rem;
`,j=o.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,b=o.Ay.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;
  }

  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: ${e=>{let{theme:r}=e;return r.colors.border}};
    transition: 0.4s;
    border-radius: 34px;

    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: 0.4s;
      border-radius: 50%;
    }
  }

  input:checked + span {
    background-color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }

  input:checked + span:before {
    transform: translateX(26px);
  }
`,g=o.Ay.button`
  padding: 0.5rem 1rem;
  background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?r.colors.primary:"danger"===t?r.colors.error:"transparent"}};
  color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t||"danger"===t?"white":r.colors.text.primary}};
  border: ${e=>{let{theme:r,variant:t}=e;return"outline"===t?`1px solid ${r.colors.border}`:"none"}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${e=>{let{theme:r,variant:t}=e;return"primary"===t?`${r.colors.primary}dd`:"danger"===t?`${r.colors.error}dd`:`${r.colors.border}33`}};
  }
`,y=()=>{const{isDarkMode:e,toggleTheme:r}=(0,i.D)();return(0,n.jsxs)(s,{children:[(0,n.jsxs)(l,{children:[(0,n.jsx)(d,{children:"Param\xe8tres"}),(0,n.jsx)(c,{children:"G\xe9rez les param\xe8tres de votre application SmartPlanning AI."})]}),(0,n.jsxs)(a,{children:[(0,n.jsxs)(h,{children:[(0,n.jsx)(m,{children:"Apparence"}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Mode sombre"}),(0,n.jsx)(j,{children:"Basculer entre le mode clair et le mode sombre."})]}),(0,n.jsxs)(b,{children:[(0,n.jsx)("input",{type:"checkbox",checked:e,onChange:r}),(0,n.jsx)("span",{})]})]})]}),(0,n.jsxs)(h,{children:[(0,n.jsx)(m,{children:"Notifications"}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Notifications par email"}),(0,n.jsx)(j,{children:"Recevoir des notifications par email pour les \xe9v\xe9nements importants."})]}),(0,n.jsxs)(b,{children:[(0,n.jsx)("input",{type:"checkbox",defaultChecked:!0}),(0,n.jsx)("span",{})]})]}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Notifications push"}),(0,n.jsx)(j,{children:"Recevoir des notifications push dans le navigateur."})]}),(0,n.jsxs)(b,{children:[(0,n.jsx)("input",{type:"checkbox",defaultChecked:!0}),(0,n.jsx)("span",{})]})]})]}),(0,n.jsxs)(h,{children:[(0,n.jsx)(m,{children:"S\xe9curit\xe9"}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Authentification \xe0 deux facteurs"}),(0,n.jsx)(j,{children:"Ajouter une couche de s\xe9curit\xe9 suppl\xe9mentaire \xe0 votre compte."})]}),(0,n.jsx)(g,{variant:"primary",children:"Activer"})]}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Changer le mot de passe"}),(0,n.jsx)(j,{children:"Mettre \xe0 jour votre mot de passe actuel."})]}),(0,n.jsx)(g,{variant:"outline",children:"Modifier"})]})]}),(0,n.jsxs)(h,{children:[(0,n.jsx)(m,{children:"Compte"}),(0,n.jsxs)(p,{children:[(0,n.jsxs)(u,{children:[(0,n.jsx)(x,{children:"Supprimer le compte"}),(0,n.jsx)(j,{children:"Supprimer d\xe9finitivement votre compte et toutes vos donn\xe9es."})]}),(0,n.jsx)(g,{variant:"danger",children:"Supprimer"})]})]})]})]})}}}]);
//# sourceMappingURL=202.e7b2c28c.chunk.js.map