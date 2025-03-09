"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[764],{1764:(e,r,t)=>{t.r(r),t.d(r,{default:()=>v});var n=t(1529),i=t(579);const s=n.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,o=n.Ay.div`
  margin-bottom: 2rem;
`,l=n.Ay.h1`
  font-size: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,c=n.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1.1rem;
`,d=n.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`,a=n.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,h=n.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,m=n.Ay.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.background}66`}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
`,x=n.Ay.div`
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.875rem;
`,u=n.Ay.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
  text-align: center;
`,p=n.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-align: center;
`,j=n.Ay.div`
  height: 8px;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.border}`}};
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;

  &::after {
    content: "";
    display: block;
    height: 100%;
    width: ${e=>{let{value:r}=e;return`${r}%`}};
    background-color: ${e=>{let{theme:r,color:t}=e;return t||r.colors.primary}};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`,y=n.Ay.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`,g=n.Ay.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,f=n.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,b=n.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,v=()=>{const e={total:24,active:22,onVacation:2,departments:[{name:"Marketing",count:6},{name:"D\xe9veloppement",count:8},{name:"Design",count:4},{name:"RH",count:3},{name:"Finance",count:3}]},r=156,t=32,n=28,v=87;return(0,i.jsxs)(s,{children:[(0,i.jsxs)(o,{children:[(0,i.jsx)(l,{children:"Statistiques"}),(0,i.jsx)(c,{children:"Consultez les statistiques et les analyses de votre organisation."})]}),(0,i.jsxs)(d,{children:[(0,i.jsxs)(a,{children:[(0,i.jsx)(h,{children:"Employ\xe9s"}),(0,i.jsx)(m,{children:(0,i.jsxs)(x,{children:[(0,i.jsx)(u,{children:e.total}),(0,i.jsx)(p,{children:"Employ\xe9s au total"})]})}),(0,i.jsxs)(y,{children:[(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"Actifs"}),(0,i.jsx)(b,{children:e.active})]}),(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"En cong\xe9"}),(0,i.jsx)(b,{children:e.onVacation})]}),(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"Taux de pr\xe9sence"}),(0,i.jsxs)(b,{children:[Math.round(e.active/e.total*100),"%"]})]})]})]}),(0,i.jsxs)(a,{children:[(0,i.jsx)(h,{children:"R\xe9partition par d\xe9partement"}),(0,i.jsx)(m,{children:(0,i.jsx)(x,{children:"Graphique de r\xe9partition par d\xe9partement"})}),(0,i.jsx)(y,{children:e.departments.map(((e,r)=>(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:e.name}),(0,i.jsx)(b,{children:e.count})]},r)))})]}),(0,i.jsxs)(a,{children:[(0,i.jsx)(h,{children:"Planning"}),(0,i.jsx)(m,{children:(0,i.jsxs)(x,{children:[(0,i.jsx)(u,{color:"#8338ec",children:r}),(0,i.jsx)(p,{children:"\xc9v\xe9nements planifi\xe9s"})]})}),(0,i.jsxs)(y,{children:[(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"Cette semaine"}),(0,i.jsx)(b,{children:t})]}),(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"Semaine prochaine"}),(0,i.jsx)(b,{children:n})]}),(0,i.jsxs)(g,{children:[(0,i.jsx)(f,{children:"Taux de compl\xe9tion"}),(0,i.jsxs)(b,{children:[v,"%"]})]})]}),(0,i.jsx)(j,{value:v,color:"#8338ec"})]})]})]})}}}]);
//# sourceMappingURL=764.78911e11.chunk.js.map