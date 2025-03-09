"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[859],{2352:(e,r,o)=>{o.d(r,{OY:()=>i,RB:()=>l,Vk:()=>a,np:()=>d,qG:()=>n});var t=o(1529);const n=t.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,i=(t.i7`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`,t.i7`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,t.i7`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,t.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`),l=(t.i7`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,t.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,t.i7`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`,t.i7`
  0% {
    box-shadow: 0 4px 6px rgba(58, 134, 255, 0.25);
  }
  100% {
    box-shadow: 0 6px 8px rgba(58, 134, 255, 0.35);
  }
`,t.i7`
  0% {
    transform: rotate(0deg);
  }
  10% {
    transform: rotate(10deg);
  }
  20% {
    transform: rotate(-10deg);
  }
  30% {
    transform: rotate(6deg);
  }
  40% {
    transform: rotate(-6deg);
  }
  50% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(0deg);
  }
`,t.i7`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`,"\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n  &:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);\n  }\n"),a="\n  transition: all 0.2s ease;\n  &:hover {\n    transform: translateY(-2px);\n  }\n  &:active {\n    transform: translateY(1px);\n  }\n",d="\n  transition: border-color 0.2s ease, box-shadow 0.2s ease;\n  &:focus {\n    border-color: var(--primary-color);\n    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15);\n  }\n"},4450:(e,r,o)=>{o.d(r,{A:()=>s});var t=o(1529),n=o(2352),i=o(579);const l={primary:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.primary?`${o.colors.primary}dd`:"#3a86ffdd"}};
      box-shadow: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.shadows)||void 0===r?void 0:r.button)||"0 4px 6px rgba(58, 134, 255, 0.25)"}};
    }
  `,secondary:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.secondary)||"#8338ec"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.secondary?`${o.colors.secondary}dd`:"#8338ecdd"}};
      box-shadow: 0 4px 6px rgba(131, 56, 236, 0.25);
    }
  `,accent:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.accent)||"#ff006e"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.accent?`${o.colors.accent}dd`:"#ff006edd"}};
      box-shadow: 0 4px 6px rgba(255, 0, 110, 0.25);
    }
  `,success:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.success)||"#06d6a0"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.success?`${o.colors.success}dd`:"#06d6a0dd"}};
      box-shadow: 0 4px 6px rgba(6, 214, 160, 0.25);
    }
  `,warning:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.warning)||"#ffbe0b"}};
    color: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r||null===(o=r.text)||void 0===o?void 0:o.primary)||"#212529"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.warning?`${o.colors.warning}dd`:"#ffbe0bdd"}};
      box-shadow: 0 4px 6px rgba(255, 190, 11, 0.25);
    }
  `,error:t.AH`
    background-color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.error)||"#ef476f"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.error?`${o.colors.error}dd`:"#ef476fdd"}};
      box-shadow: 0 4px 6px rgba(239, 71, 111, 0.25);
    }
  `,outline:t.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    border: 2px solid ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.primary?`${o.colors.primary}11`:"#3a86ff11"}};
      box-shadow: 0 4px 6px rgba(58, 134, 255, 0.15);
    }
  `,ghost:t.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:o}=e;return null!==o&&void 0!==o&&null!==(r=o.colors)&&void 0!==r&&r.primary?`${o.colors.primary}11`:"#3a86ff11"}};
    }
  `,link:t.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    padding: 0;
    height: auto;
    font-weight: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.fontWeights)||void 0===o?void 0:o.medium)||"500"}};
    &:hover {
      text-decoration: underline;
      transform: none;
    }
    &:active {
      transform: none;
    }
  `},a={xs:t.AH`
    height: 28px;
    padding: 0 ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r.sm)||"0.5rem"}};
    font-size: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.sizes)||void 0===o?void 0:o.xs)||"0.75rem"}};
    border-radius: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.borderRadius)||void 0===r?void 0:r.small)||"4px"}};
  `,sm:t.AH`
    height: 36px;
    padding: 0 ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r.md)||"1rem"}};
    font-size: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.sizes)||void 0===o?void 0:o.sm)||"0.875rem"}};
    border-radius: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.borderRadius)||void 0===r?void 0:r.small)||"4px"}};
  `,md:t.AH`
    height: 44px;
    padding: 0 ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r.lg)||"1.5rem"}};
    font-size: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.sizes)||void 0===o?void 0:o.md)||"1rem"}};
    border-radius: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.borderRadius)||void 0===r?void 0:r.medium)||"8px"}};
  `,lg:t.AH`
    height: 52px;
    padding: 0 ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r.xl)||"2rem"}};
    font-size: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.sizes)||void 0===o?void 0:o.lg)||"1.125rem"}};
    border-radius: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.borderRadius)||void 0===r?void 0:r.medium)||"8px"}};
  `,xl:t.AH`
    height: 60px;
    padding: 0 ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r["2xl"])||"3rem"}};
    font-size: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.sizes)||void 0===o?void 0:o.xl)||"1.25rem"}};
    border-radius: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.borderRadius)||void 0===r?void 0:r.large)||"12px"}};
  `},d=t.Ay.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.spacing)||void 0===r?void 0:r.sm)||"0.5rem"}};
  border: none;
  outline: none;
  cursor: pointer;
  font-family: ${e=>{var r;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r?void 0:r.fontFamily)||"'Inter', 'Roboto', sans-serif"}};
  font-weight: ${e=>{var r,o;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r||null===(o=r.fontWeights)||void 0===o?void 0:o.medium)||"500"}};
  white-space: nowrap;
  ${n.Vk}

  // Appliquer la variante
  ${e=>{let{$variant:r}=e;return l[r]||l.primary}}
  
  // Appliquer la taille
  ${e=>{let{$size:r}=e;return a[r]||a.md}}
  
  // Style pour le bouton désactivé
  ${e=>{let{disabled:r}=e;return r&&t.AH`
      opacity: 0.6;
      cursor: not-allowed;
      &:hover {
        transform: none;
        box-shadow: none;
      }
    `}}
    
  // Style pour le bouton pleine largeur
  ${e=>{let{$fullWidth:r}=e;return r&&t.AH`
      width: 100%;
    `}}
    
  // Style pour le bouton avec icône seulement
  ${e=>{let{$iconOnly:r,$size:o}=e;return r&&t.AH`
      width: ${"xs"===o?"28px":"sm"===o?"36px":"md"===o?"44px":"lg"===o?"52px":"60px"};
      padding: 0;
      justify-content: center;
    `}}
    
  // Animation de chargement
  ${e=>{let{$loading:r}=e;return r&&t.AH`
      position: relative;
      color: transparent !important;
      pointer-events: none;

      &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        left: 50%;
        margin-top: -10px;
        margin-left: -10px;
        border-radius: 50%;
        border: 2px solid
          ${e=>{let{theme:r,$variant:o}=e;var t;return"ghost"===o||"outline"===o||"link"===o?(null===r||void 0===r||null===(t=r.colors)||void 0===t?void 0:t.primary)||"#3a86ff":"rgba(255, 255, 255, 0.5)"}};
        border-top-color: ${e=>{let{theme:r,$variant:o}=e;var t;return"ghost"===o||"outline"===o||"link"===o?(null===r||void 0===r||null===(t=r.colors)||void 0===t?void 0:t.primary)||"#3a86ff":"white"}};
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}}
`,s=e=>{let{children:r,variant:o="primary",size:t="md",disabled:n=!1,fullWidth:l=!1,iconOnly:a=!1,loading:s=!1,leftIcon:c,rightIcon:m,...u}=e;return(0,i.jsxs)(d,{$variant:o,$size:t,disabled:n||s,$fullWidth:l,$iconOnly:a,$loading:s,...u,children:[c&&!s&&c,r,m&&!s&&m]})}},4859:(e,r,o)=>{o.r(r),o.d(r,{default:()=>P});var t=o(1529),n=o(5475),i=o(3750),l=o.n(i),a=o(3681),d=o(4450),s=o(5845),c=o(4185),m=o(579);const u=t.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,p=t.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,h=t.Ay.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  animation: ${u} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
`,v=t.Ay.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${e=>{let{theme:r}=e;return r.spacing.lg}} ${e=>{let{theme:r}=e;return r.spacing.xl}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.small}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    padding: ${e=>{let{theme:r}=e;return r.spacing.md}};
    flex-direction: column;
    gap: ${e=>{let{theme:r}=e;return r.spacing.md}};
  }
`,x=t.Ay.div`
  font-size: ${e=>{let{theme:r}=e;return r.typography.sizes["2xl"]}};
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  display: flex;
  align-items: center;
  gap: ${e=>{let{theme:r}=e;return r.spacing.sm}};
`,g=t.Ay.div`
  width: 40px;
  height: 40px;
`,f=t.Ay.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`,y=t.Ay.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    padding: 2rem 1rem;
  }
`,b=t.Ay.div`
  flex: 1;
  animation: ${p} 0.7s ease-in-out;

  @media (max-width: 992px) {
    order: 2;
    margin-top: 2rem;
  }
`,$=t.Ay.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${e=>{let{theme:r}=e;return r.primary}};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`,w=t.Ay.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${e=>{let{theme:r}=e;return r.textSecondary}};
  max-width: 600px;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`,A=t.Ay.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
`,j=t.Ay.div`
  flex: 1;
  max-width: 500px;
  animation: ${u} 1s ease-in-out;

  @media (max-width: 992px) {
    order: 1;
    max-width: 400px;
  }
`,k=t.Ay.section`
  padding: 4rem 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.backgroundAlt}};

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`,z=t.Ay.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: ${e=>{let{theme:r}=e;return r.primary}};

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`,H=t.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`,S=t.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.cardBackground}};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`,Y=t.Ay.div`
  font-size: 2.5rem;
  color: ${e=>{let{theme:r}=e;return r.primary}};
  margin-bottom: 1.5rem;
`,C=t.Ay.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${e=>{let{theme:r}=e;return r.text}};
`,I=t.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.textSecondary}};
  line-height: 1.6;
`,R=t.Ay.footer`
  background-color: ${e=>{let{theme:r}=e;return r.cardBackground}};
  padding: 2rem;
  text-align: center;
  margin-top: auto;
`,q=t.Ay.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`,N=t.Ay.a`
  color: ${e=>{let{theme:r}=e;return r.textSecondary}};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${e=>{let{theme:r}=e;return r.primary}};
  }
`,O=t.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.textSecondary}};
  font-size: 0.9rem;
`,P=()=>{const{isDarkMode:e,toggleTheme:r}=(0,a.D)();return(0,m.jsxs)(h,{children:[(0,m.jsxs)(v,{children:[(0,m.jsxs)(x,{children:[(0,m.jsx)(g,{children:(0,m.jsx)(l(),{animationData:c,loop:!0})}),"SmartPlanning AI"]}),(0,m.jsxs)(f,{children:[(0,m.jsx)(s.o,{onChange:r,checked:e}),(0,m.jsx)(n.N_,{to:"/login",children:(0,m.jsx)(d.A,{variant:"ghost",children:"Se connecter"})}),(0,m.jsx)(n.N_,{to:"/register",children:(0,m.jsx)(d.A,{children:"S'inscrire"})})]})]}),(0,m.jsxs)(y,{children:[(0,m.jsxs)(b,{children:[(0,m.jsx)($,{children:"Planifiez intelligemment avec l'IA"}),(0,m.jsx)(w,{children:"Optimisez la gestion de vos plannings d'entreprise gr\xe2ce \xe0 notre solution aliment\xe9e par l'intelligence artificielle. Gagnez du temps, r\xe9duisez les erreurs et am\xe9liorez la productivit\xe9."}),(0,m.jsxs)(A,{children:[(0,m.jsx)(n.N_,{to:"/register",children:(0,m.jsx)(d.A,{size:"large",children:"Commencer gratuitement"})}),(0,m.jsx)(n.N_,{to:"/login",children:(0,m.jsx)(d.A,{variant:"outlined",size:"large",children:"Voir une d\xe9mo"})})]})]}),(0,m.jsx)(j,{children:(0,m.jsx)(l(),{animationData:c,loop:!0})})]}),(0,m.jsxs)(k,{children:[(0,m.jsx)(z,{children:"Pourquoi choisir SmartPlanning AI ?"}),(0,m.jsxs)(H,{children:[(0,m.jsxs)(S,{children:[(0,m.jsx)(Y,{children:"\ud83d\udd04"}),(0,m.jsx)(C,{children:"Automatisation intelligente"}),(0,m.jsx)(I,{children:"Notre IA analyse vos besoins et automatise la cr\xe9ation de plannings optimis\xe9s pour votre entreprise."})]}),(0,m.jsxs)(S,{children:[(0,m.jsx)(Y,{children:"\ud83d\udcca"}),(0,m.jsx)(C,{children:"Analyses d\xe9taill\xe9es"}),(0,m.jsx)(I,{children:"Obtenez des insights pr\xe9cieux sur l'utilisation du temps et l'efficacit\xe9 de vos \xe9quipes."})]}),(0,m.jsxs)(S,{children:[(0,m.jsx)(Y,{children:"\ud83d\udd14"}),(0,m.jsx)(C,{children:"Notifications en temps r\xe9el"}),(0,m.jsx)(I,{children:"Restez inform\xe9 des changements de planning et des \xe9v\xe9nements importants gr\xe2ce \xe0 nos alertes personnalisables."})]}),(0,m.jsxs)(S,{children:[(0,m.jsx)(Y,{children:"\ud83d\udd12"}),(0,m.jsx)(C,{children:"S\xe9curit\xe9 renforc\xe9e"}),(0,m.jsx)(I,{children:"Vos donn\xe9es sont prot\xe9g\xe9es par des protocoles de s\xe9curit\xe9 avanc\xe9s et conformes aux r\xe9glementations."})]})]})]}),(0,m.jsxs)(R,{children:[(0,m.jsxs)(q,{children:[(0,m.jsx)(N,{href:"#",children:"Conditions d'utilisation"}),(0,m.jsx)(N,{href:"#",children:"Politique de confidentialit\xe9"}),(0,m.jsx)(N,{href:"#",children:"Contact"})]}),(0,m.jsxs)(O,{children:["\xa9 ",(new Date).getFullYear()," SmartPlanning AI. Tous droits r\xe9serv\xe9s."]})]})]})}},5845:(e,r,o)=>{o.d(r,{o:()=>c});var t=o(1529),n=o(579);const i=t.Ay.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
`,l=t.Ay.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4361ee;
  }

  &:checked + span:before {
    transform: translateX(30px);
  }
`,a=t.Ay.span`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.4s;
  border-radius: 34px;

  &:before {
    position: absolute;
    content: "";
    height: 22px;
    width: 22px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    transition: 0.4s;
    border-radius: 50%;
  }
`,d=t.Ay.span`
  position: absolute;
  left: 8px;
  top: 6px;
  color: #f9d71c;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,s=t.Ay.span`
  position: absolute;
  right: 8px;
  top: 6px;
  color: #f8f9fa;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,c=e=>{let{onChange:r,checked:o}=e;return(0,n.jsxs)(i,{children:[(0,n.jsx)(l,{type:"checkbox",onChange:r,checked:o}),(0,n.jsx)(a,{}),(0,n.jsx)(d,{children:"\u2600\ufe0f"}),(0,n.jsx)(s,{children:"\ud83c\udf19"})]})}}}]);
//# sourceMappingURL=859.f6420659.chunk.js.map