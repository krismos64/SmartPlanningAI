"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[764],{1764:(e,r,n)=>{n.r(r),n.d(r,{default:()=>v});var t=n(5464),s=n(579);const i=t.Ay.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`,l=t.Ay.div`
  margin-bottom: 2rem;
`,o=t.Ay.h1`
  font-size: 2rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,c=t.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 1.1rem;
`,d=t.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
`,a=t.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.medium}};
  padding: 1.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  display: flex;
  flex-direction: column;
  gap: 1rem;
`,h=t.Ay.h2`
  font-size: 1.25rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  margin-bottom: 0.5rem;
`,x=t.Ay.div`
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${e=>{let{theme:r}=e;return`${r.colors.background}66`}};
  border-radius: ${e=>{let{theme:r}=e;return r.borderRadius.small}};
  padding: 1rem;
`,m=t.Ay.div`
  text-align: center;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.875rem;
`,j=t.Ay.div`
  font-size: 2.5rem;
  font-weight: 600;
  color: ${e=>{let{theme:r,color:n}=e;return n||r.colors.primary}};
  text-align: center;
`,u=t.Ay.div`
  font-size: 0.875rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-align: center;
`,p=t.Ay.div`
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
    background-color: ${e=>{let{theme:r,color:n}=e;return n||r.colors.primary}};
    border-radius: 4px;
    transition: width 1s ease-in-out;
  }
`,g=t.Ay.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`,y=t.Ay.li`
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid ${e=>{let{theme:r}=e;return r.colors.border}};

  &:last-child {
    border-bottom: none;
  }
`,f=t.Ay.div`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,b=t.Ay.div`
  font-weight: 500;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,v=()=>{const e={total:24,active:22,onVacation:2,departments:[{name:"Marketing",count:6},{name:"D\xe9veloppement",count:8},{name:"Design",count:4},{name:"RH",count:3},{name:"Finance",count:3}]},r=156,n=32,t=28,v=87,$=8,A=15,k=3,w=120;return(0,s.jsxs)(i,{children:[(0,s.jsxs)(l,{children:[(0,s.jsx)(o,{children:"Statistiques"}),(0,s.jsx)(c,{children:"Consultez les statistiques et les analyses de votre organisation."})]}),(0,s.jsxs)(d,{children:[(0,s.jsxs)(a,{children:[(0,s.jsx)(h,{children:"Employ\xe9s"}),(0,s.jsx)(x,{children:(0,s.jsxs)(m,{children:[(0,s.jsx)(j,{children:e.total}),(0,s.jsx)(u,{children:"Employ\xe9s au total"})]})}),(0,s.jsxs)(g,{children:[(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Actifs"}),(0,s.jsx)(b,{children:e.active})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"En cong\xe9"}),(0,s.jsx)(b,{children:e.onVacation})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Taux de pr\xe9sence"}),(0,s.jsxs)(b,{children:[Math.round(e.active/e.total*100),"%"]})]})]})]}),(0,s.jsxs)(a,{children:[(0,s.jsx)(h,{children:"R\xe9partition par d\xe9partement"}),(0,s.jsx)(x,{children:(0,s.jsx)(m,{children:"Graphique de r\xe9partition par d\xe9partement"})}),(0,s.jsx)(g,{children:e.departments.map(((e,r)=>(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:e.name}),(0,s.jsx)(b,{children:e.count})]},r)))})]}),(0,s.jsxs)(a,{children:[(0,s.jsx)(h,{children:"Planning"}),(0,s.jsx)(x,{children:(0,s.jsxs)(m,{children:[(0,s.jsx)(j,{color:"#8338ec",children:r}),(0,s.jsx)(u,{children:"\xc9v\xe9nements planifi\xe9s"})]})}),(0,s.jsxs)(g,{children:[(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Cette semaine"}),(0,s.jsx)(b,{children:n})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Semaine prochaine"}),(0,s.jsx)(b,{children:t})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Taux de compl\xe9tion"}),(0,s.jsxs)(b,{children:[v,"%"]})]})]}),(0,s.jsx)(p,{value:v,color:"#8338ec"})]}),(0,s.jsxs)(a,{children:[(0,s.jsx)(h,{children:"Cong\xe9s"}),(0,s.jsx)(x,{children:(0,s.jsxs)(m,{children:[(0,s.jsx)(j,{color:"#ff006e",children:w}),(0,s.jsx)(u,{children:"Jours de cong\xe9s pris"})]})}),(0,s.jsxs)(g,{children:[(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"En attente"}),(0,s.jsx)(b,{children:$})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Approuv\xe9s"}),(0,s.jsx)(b,{children:A})]}),(0,s.jsxs)(y,{children:[(0,s.jsx)(f,{children:"Refus\xe9s"}),(0,s.jsx)(b,{children:k})]})]})]})]})]})}}}]);
//# sourceMappingURL=764.cb14c7a5.chunk.js.map