"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[859],{2352:(e,r,t)=>{t.d(r,{OY:()=>n,RB:()=>a,Vk:()=>l,np:()=>s,qG:()=>i});var o=t(1529);const i=o.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,n=(o.i7`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`,o.i7`
  from {
    transform: translateX(30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,o.i7`
  from {
    transform: translateX(-30px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,o.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`),a=(o.i7`
  from {
    transform: translateY(-30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,o.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,o.i7`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`,o.i7`
  0% {
    box-shadow: 0 4px 6px rgba(58, 134, 255, 0.25);
  }
  100% {
    box-shadow: 0 6px 8px rgba(58, 134, 255, 0.35);
  }
`,o.i7`
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
`,o.i7`
  0% {
    width: 0%;
  }
  100% {
    width: 100%;
  }
`,"\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n  &:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);\n  }\n"),l="\n  transition: all 0.2s ease;\n  &:hover {\n    transform: translateY(-2px);\n  }\n  &:active {\n    transform: translateY(1px);\n  }\n",s="\n  transition: border-color 0.2s ease, box-shadow 0.2s ease;\n  &:focus {\n    border-color: var(--primary-color);\n    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15);\n  }\n"},4450:(e,r,t)=>{t.d(r,{A:()=>d});var o=t(1529),i=t(2352),n=t(579);const a={primary:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.primary?`${t.colors.primary}dd`:"#3a86ffdd"}};
      box-shadow: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.shadows)||void 0===r?void 0:r.button)||"0 4px 6px rgba(58, 134, 255, 0.25)"}};
    }
  `,secondary:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.secondary)||"#8338ec"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.secondary?`${t.colors.secondary}dd`:"#8338ecdd"}};
      box-shadow: 0 4px 6px rgba(131, 56, 236, 0.25);
    }
  `,accent:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.accent)||"#ff006e"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.accent?`${t.colors.accent}dd`:"#ff006edd"}};
      box-shadow: 0 4px 6px rgba(255, 0, 110, 0.25);
    }
  `,success:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.success)||"#06d6a0"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.success?`${t.colors.success}dd`:"#06d6a0dd"}};
      box-shadow: 0 4px 6px rgba(6, 214, 160, 0.25);
    }
  `,warning:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.warning)||"#ffbe0b"}};
    color: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.colors)||void 0===r||null===(t=r.text)||void 0===t?void 0:t.primary)||"#212529"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.warning?`${t.colors.warning}dd`:"#ffbe0bdd"}};
      box-shadow: 0 4px 6px rgba(255, 190, 11, 0.25);
    }
  `,error:o.AH`
    background-color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.error)||"#ef476f"}};
    color: white;
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.error?`${t.colors.error}dd`:"#ef476fdd"}};
      box-shadow: 0 4px 6px rgba(239, 71, 111, 0.25);
    }
  `,outline:o.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    border: 2px solid ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.primary?`${t.colors.primary}11`:"#3a86ff11"}};
      box-shadow: 0 4px 6px rgba(58, 134, 255, 0.15);
    }
  `,ghost:o.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    &:hover {
      background-color: ${e=>{var r;let{theme:t}=e;return null!==t&&void 0!==t&&null!==(r=t.colors)&&void 0!==r&&r.primary?`${t.colors.primary}11`:"#3a86ff11"}};
    }
  `,link:o.AH`
    background-color: transparent;
    color: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.colors)||void 0===r?void 0:r.primary)||"#3a86ff"}};
    padding: 0;
    height: auto;
    font-weight: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.fontWeights)||void 0===t?void 0:t.medium)||"500"}};
    &:hover {
      text-decoration: underline;
      transform: none;
    }
    &:active {
      transform: none;
    }
  `},l={xs:o.AH`
    height: 28px;
    padding: 0 ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r.sm)||"0.5rem"}};
    font-size: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.sizes)||void 0===t?void 0:t.xs)||"0.75rem"}};
    border-radius: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.borderRadius)||void 0===r?void 0:r.small)||"4px"}};
  `,sm:o.AH`
    height: 36px;
    padding: 0 ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r.md)||"1rem"}};
    font-size: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.sizes)||void 0===t?void 0:t.sm)||"0.875rem"}};
    border-radius: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.borderRadius)||void 0===r?void 0:r.small)||"4px"}};
  `,md:o.AH`
    height: 44px;
    padding: 0 ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r.lg)||"1.5rem"}};
    font-size: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.sizes)||void 0===t?void 0:t.md)||"1rem"}};
    border-radius: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.borderRadius)||void 0===r?void 0:r.medium)||"8px"}};
  `,lg:o.AH`
    height: 52px;
    padding: 0 ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r.xl)||"2rem"}};
    font-size: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.sizes)||void 0===t?void 0:t.lg)||"1.125rem"}};
    border-radius: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.borderRadius)||void 0===r?void 0:r.medium)||"8px"}};
  `,xl:o.AH`
    height: 60px;
    padding: 0 ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r["2xl"])||"3rem"}};
    font-size: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.sizes)||void 0===t?void 0:t.xl)||"1.25rem"}};
    border-radius: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.borderRadius)||void 0===r?void 0:r.large)||"12px"}};
  `},s=o.Ay.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.spacing)||void 0===r?void 0:r.sm)||"0.5rem"}};
  border: none;
  outline: none;
  cursor: pointer;
  font-family: ${e=>{var r;let{theme:t}=e;return(null===t||void 0===t||null===(r=t.typography)||void 0===r?void 0:r.fontFamily)||"'Inter', 'Roboto', sans-serif"}};
  font-weight: ${e=>{var r,t;let{theme:o}=e;return(null===o||void 0===o||null===(r=o.typography)||void 0===r||null===(t=r.fontWeights)||void 0===t?void 0:t.medium)||"500"}};
  white-space: nowrap;
  ${i.Vk}

  // Appliquer la variante
  ${e=>{let{$variant:r}=e;return a[r]||a.primary}}
  
  // Appliquer la taille
  ${e=>{let{$size:r}=e;return l[r]||l.md}}
  
  // Style pour le bouton désactivé
  ${e=>{let{disabled:r}=e;return r&&o.AH`
      opacity: 0.6;
      cursor: not-allowed;
      &:hover {
        transform: none;
        box-shadow: none;
      }
    `}}
    
  // Style pour le bouton pleine largeur
  ${e=>{let{$fullWidth:r}=e;return r&&o.AH`
      width: 100%;
    `}}
    
  // Style pour le bouton avec icône seulement
  ${e=>{let{$iconOnly:r,$size:t}=e;return r&&o.AH`
      width: ${"xs"===t?"28px":"sm"===t?"36px":"md"===t?"44px":"lg"===t?"52px":"60px"};
      padding: 0;
      justify-content: center;
    `}}
    
  // Animation de chargement
  ${e=>{let{$loading:r}=e;return r&&o.AH`
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
          ${e=>{let{theme:r,$variant:t}=e;var o;return"ghost"===t||"outline"===t||"link"===t?(null===r||void 0===r||null===(o=r.colors)||void 0===o?void 0:o.primary)||"#3a86ff":"rgba(255, 255, 255, 0.5)"}};
        border-top-color: ${e=>{let{theme:r,$variant:t}=e;var o;return"ghost"===t||"outline"===t||"link"===t?(null===r||void 0===r||null===(o=r.colors)||void 0===o?void 0:o.primary)||"#3a86ff":"white"}};
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}}
`,d=e=>{let{children:r,variant:t="primary",size:o="md",disabled:i=!1,fullWidth:a=!1,iconOnly:l=!1,loading:d=!1,leftIcon:c,rightIcon:m,...h}=e;return(0,n.jsxs)(s,{$variant:t,$size:o,disabled:i||d,$fullWidth:a,$iconOnly:l,$loading:d,...h,children:[c&&!d&&c,r,m&&!d&&m]})}},4859:(e,r,t)=>{t.r(r),t.d(r,{default:()=>te});var o=t(3750),i=t.n(o),n=t(5043),a=t(4117),l=t(5475),s=t(1529),d=t(4185),c=t(3058),m=t(3681),h=t(4450),u=t(5845),p=t(579);const x=s.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,g=s.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,f=s.i7`
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,v=s.i7`
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,b=s.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,y=s.i7`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`,$=(s.i7`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`,s.Ay.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
  animation: ${x} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
`),w=s.Ay.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${e=>{let{theme:r}=e;return r.spacing.lg}} ${e=>{let{theme:r}=e;return r.spacing.xl}};
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.small}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: ${e=>{let{theme:r}=e;return r.breakpoints.md}}) {
    padding: ${e=>{let{theme:r}=e;return r.spacing.md}};
    flex-direction: column;
    gap: ${e=>{let{theme:r}=e;return r.spacing.md}};
  }
`,j=s.Ay.div`
  font-size: ${e=>{let{theme:r}=e;return r.typography.sizes["2xl"]}};
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  display: flex;
  align-items: center;
  gap: ${e=>{let{theme:r}=e;return r.spacing.sm}};
`,A=s.Ay.div`
  width: 40px;
  height: 40px;
  animation: ${y} 3s ease-in-out infinite;
`,k=s.Ay.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`,z=s.Ay.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;

  @media (max-width: 992px) {
    flex-direction: column;
    text-align: center;
    padding: 4rem 1rem;
  }
`,P=s.Ay.div`
  flex: 1;
  animation: ${f} 0.7s ease-in-out;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 2;
    margin-top: 2rem;
    animation: ${g} 0.7s ease-in-out;
  }
`,H=s.Ay.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  line-height: 1.2;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100px;
    height: 5px;
    background: linear-gradient(
      90deg,
      ${e=>{let{theme:r}=e;return r.colors.primary}},
      ${e=>{let{theme:r}=e;return r.colors.secondary}}
    );
    border-radius: 5px;
  }

  @media (max-width: 992px) {
    &::after {
      left: 50%;
      transform: translateX(-50%);
    }
  }

  @media (max-width: 768px) {
    font-size: 2.8rem;
  }
`,Y=s.Ay.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  max-width: 600px;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`,N=s.Ay.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
`,X=s.Ay.div`
  flex: 1;
  max-width: 550px;
  animation: ${v} 1s ease-in-out, ${y} 6s ease-in-out infinite;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 1;
    max-width: 400px;
    animation: ${x} 1s ease-in-out, ${y} 6s ease-in-out infinite;
  }
`,R=s.Ay.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    ${e=>{let{theme:r}=e;return r.colors.primary}}20,
    ${e=>{let{theme:r}=e;return r.colors.secondary}}20
  );
  filter: blur(60px);
  z-index: 1;
  animation: ${b} 10s ease-in-out infinite;

  &.top-right {
    top: -100px;
    right: -100px;
  }

  &.bottom-left {
    bottom: -100px;
    left: -100px;
    animation-delay: 2s;
  }
`,C=s.Ay.section`
  padding: 6rem 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`,W=s.Ay.h2`
  font-size: 2.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`,_=s.Ay.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,I=s.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`,O=s.Ay.div`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(
      90deg,
      ${e=>{let{theme:r}=e;return r.colors.primary}},
      ${e=>{let{theme:r}=e;return r.colors.secondary}}
    );
  }
`,S=s.Ay.div`
  font-size: 3rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  margin-bottom: 1.5rem;
  animation: ${y} 3s ease-in-out infinite;
  display: inline-block;
`,D=s.Ay.h3`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,q=s.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  line-height: 1.7;
  font-size: 1.05rem;
`,E=s.Ay.section`
  padding: 6rem 2rem;
  background: linear-gradient(
    135deg,
    ${e=>{let{theme:r}=e;return r.colors.primary}}15,
    ${e=>{let{theme:r}=e;return r.colors.secondary}}15
  );
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`,V=s.Ay.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`,B=s.Ay.div`
  margin-top: 3rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  position: relative;
  aspect-ratio: 16/9;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  animation: ${b} 4s ease-in-out infinite;

  &::before {
    content: "Vidéo de démonstration";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
    z-index: 1;
  }

  &::after {
    content: "▶";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
    background-color: ${e=>{let{theme:r}=e;return r.colors.surface}}CC;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
    cursor: pointer;
    transition: transform 0.3s ease;
    z-index: 2;
  }

  &:hover::after {
    transform: translate(-50%, -50%) scale(1.1);
  }
`,T=s.Ay.section`
  padding: 6rem 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  position: relative;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`,F=s.Ay.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;

  &.visible {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
`,G=s.Ay.div`
  font-size: 2.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.medium}};
  flex-shrink: 0;
`,M=s.Ay.div`
  flex: 1;
`,J=s.Ay.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,K=s.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  line-height: 1.7;
  font-size: 1.1rem;
`,L=s.Ay.section`
  padding: 5rem 2rem;
  background: linear-gradient(
    135deg,
    ${e=>{let{theme:r}=e;return r.colors.primary}},
    ${e=>{let{theme:r}=e;return r.colors.secondary}}
  );
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`,Q=s.Ay.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`,U=s.Ay.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`,Z=(0,s.Ay)(h.A)`
  background-color: white;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`,ee=s.Ay.div`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);

  &.small {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    animation: ${y} 6s ease-in-out infinite;
  }

  &.medium {
    width: 150px;
    height: 150px;
    bottom: 30%;
    right: 10%;
    animation: ${y} 8s ease-in-out infinite;
  }

  &.large {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: 30%;
    animation: ${y} 10s ease-in-out infinite;
  }
`,re=s.Ay.div`
  margin-right: 1rem;
`,te=()=>{const{isDarkMode:e,toggleTheme:r}=(0,m.D)(),[t,o]=(0,n.useState)([]),s=(0,n.useRef)(null),{t:x}=(0,a.Bd)();return(0,n.useEffect)((()=>{const e=new IntersectionObserver((e=>{e.forEach((e=>{if(e.isIntersecting){Array.from(e.target.children).forEach(((e,r)=>{setTimeout((()=>{o((e=>[...e,r]))}),200*r)}))}}))}),{threshold:.1});return s.current&&e.observe(s.current),()=>{s.current&&e.unobserve(s.current)}}),[]),(0,p.jsxs)($,{children:[(0,p.jsxs)(w,{children:[(0,p.jsxs)(j,{children:[(0,p.jsx)(A,{children:(0,p.jsx)(i(),{animationData:d,loop:!0})}),"SmartPlanning AI"]}),(0,p.jsxs)(k,{children:[(0,p.jsx)(re,{children:(0,p.jsx)(c.A,{isNavbar:!0})}),(0,p.jsx)(u.o,{onChange:r,checked:e}),(0,p.jsx)(l.N_,{to:"/login",children:(0,p.jsx)(h.A,{variant:"ghost",children:x("auth.login")})}),(0,p.jsx)(l.N_,{to:"/register",children:(0,p.jsx)(h.A,{children:x("auth.register")})})]})]}),(0,p.jsxs)(z,{children:[(0,p.jsx)(R,{className:"top-right"}),(0,p.jsx)(R,{className:"bottom-left"}),(0,p.jsxs)(P,{children:[(0,p.jsx)(H,{children:x("landingPage.hero.title")}),(0,p.jsx)(Y,{children:x("landingPage.hero.subtitle")}),(0,p.jsxs)(N,{children:[(0,p.jsx)(l.N_,{to:"/register",children:(0,p.jsx)(h.A,{size:"large",children:x("landingPage.hero.cta.start")})}),(0,p.jsx)(l.N_,{to:"/login",children:(0,p.jsx)(h.A,{variant:"outlined",size:"large",children:x("landingPage.hero.cta.demo")})})]})]}),(0,p.jsx)(X,{children:(0,p.jsx)(i(),{animationData:d,loop:!0})})]}),(0,p.jsxs)(C,{children:[(0,p.jsx)(W,{children:x("landingPage.features.title")}),(0,p.jsx)(_,{children:x("landingPage.features.subtitle")}),(0,p.jsxs)(I,{children:[(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83e\udde0"}),(0,p.jsx)(D,{children:x("landingPage.features.items.ai.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.ai.description")})]}),(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83d\udcb0"}),(0,p.jsx)(D,{children:x("landingPage.features.items.cost.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.cost.description")})]}),(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83d\udcf1"}),(0,p.jsx)(D,{children:x("landingPage.features.items.mobile.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.mobile.description")})]}),(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83d\udcc4"}),(0,p.jsx)(D,{children:x("landingPage.features.items.pdf.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.pdf.description")})]}),(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83d\udd12"}),(0,p.jsx)(D,{children:x("landingPage.features.items.security.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.security.description")})]}),(0,p.jsxs)(O,{children:[(0,p.jsx)(S,{children:"\ud83d\udcca"}),(0,p.jsx)(D,{children:x("landingPage.features.items.analytics.title")}),(0,p.jsx)(q,{children:x("landingPage.features.items.analytics.description")})]})]})]}),(0,p.jsx)(E,{children:(0,p.jsxs)(V,{children:[(0,p.jsx)(W,{children:x("landingPage.demo.title")}),(0,p.jsx)(_,{children:x("landingPage.demo.subtitle")}),(0,p.jsx)(B,{})]})}),(0,p.jsxs)(T,{children:[(0,p.jsx)(W,{children:x("landingPage.benefits.title")}),(0,p.jsx)(_,{children:x("landingPage.benefits.subtitle")}),(0,p.jsxs)("div",{ref:s,style:{maxWidth:"900px",margin:"0 auto"},children:[(0,p.jsxs)(F,{className:t.includes(0)?"visible":"",children:[(0,p.jsx)(G,{children:"\u23f1\ufe0f"}),(0,p.jsxs)(M,{children:[(0,p.jsx)(J,{children:x("landingPage.benefits.items.time.title")}),(0,p.jsx)(K,{children:x("landingPage.benefits.items.time.description")})]})]}),(0,p.jsxs)(F,{className:t.includes(1)?"visible":"",children:[(0,p.jsx)(G,{children:"\ud83d\udcbc"}),(0,p.jsxs)(M,{children:[(0,p.jsx)(J,{children:x("landingPage.benefits.items.cost.title")}),(0,p.jsx)(K,{children:x("landingPage.benefits.items.cost.description")})]})]}),(0,p.jsxs)(F,{className:t.includes(2)?"visible":"",children:[(0,p.jsx)(G,{children:"\ud83d\udd04"}),(0,p.jsxs)(M,{children:[(0,p.jsx)(J,{children:x("landingPage.benefits.items.flexibility.title")}),(0,p.jsx)(K,{children:x("landingPage.benefits.items.flexibility.description")})]})]}),(0,p.jsxs)(F,{className:t.includes(3)?"visible":"",children:[(0,p.jsx)(G,{children:"\ud83d\udcca"}),(0,p.jsxs)(M,{children:[(0,p.jsx)(J,{children:x("landingPage.benefits.items.data.title")}),(0,p.jsx)(K,{children:x("landingPage.benefits.items.data.description")})]})]})]})]}),(0,p.jsxs)(L,{children:[(0,p.jsx)(ee,{className:"small"}),(0,p.jsx)(ee,{className:"medium"}),(0,p.jsx)(ee,{className:"large"}),(0,p.jsx)(Q,{children:x("landingPage.cta.title")}),(0,p.jsx)(U,{children:x("landingPage.cta.subtitle")}),(0,p.jsx)(l.N_,{to:"/register",children:(0,p.jsx)(Z,{size:"large",children:x("landingPage.cta.button")})})]})]})}},5845:(e,r,t)=>{t.d(r,{o:()=>c});var o=t(1529),i=t(579);const n=o.Ay.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
`,a=o.Ay.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4361ee;
  }

  &:checked + span:before {
    transform: translateX(30px);
  }
`,l=o.Ay.span`
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
`,s=o.Ay.span`
  position: absolute;
  left: 8px;
  top: 6px;
  color: #f9d71c;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,d=o.Ay.span`
  position: absolute;
  right: 8px;
  top: 6px;
  color: #f8f9fa;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,c=e=>{let{onChange:r,checked:t}=e;return(0,i.jsxs)(n,{children:[(0,i.jsx)(a,{type:"checkbox",onChange:r,checked:t}),(0,i.jsx)(l,{}),(0,i.jsx)(s,{children:"\u2600\ufe0f"}),(0,i.jsx)(d,{children:"\ud83c\udf19"})]})}}}]);
//# sourceMappingURL=859.728f5857.chunk.js.map