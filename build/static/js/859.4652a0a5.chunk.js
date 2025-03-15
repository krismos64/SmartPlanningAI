"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[859],{2352:(e,r,t)=>{t.d(r,{OY:()=>n,RB:()=>a,Vk:()=>s,np:()=>l,qG:()=>i});var o=t(1529);const i=o.i7`
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
`,"\n  transition: transform 0.3s ease, box-shadow 0.3s ease;\n  &:hover {\n    transform: translateY(-5px);\n    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);\n  }\n"),s="\n  transition: all 0.2s ease;\n  &:hover {\n    transform: translateY(-2px);\n  }\n  &:active {\n    transform: translateY(1px);\n  }\n",l="\n  transition: border-color 0.2s ease, box-shadow 0.2s ease;\n  &:focus {\n    border-color: var(--primary-color);\n    box-shadow: 0 0 0 3px rgba(58, 134, 255, 0.15);\n  }\n"},4450:(e,r,t)=>{t.d(r,{A:()=>d});var o=t(1529),i=t(2352),n=t(579);const a={primary:o.AH`
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
  `},s={xs:o.AH`
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
  `},l=o.Ay.button`
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
  ${e=>{let{$size:r}=e;return s[r]||s.md}}
  
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
`,d=e=>{let{children:r,variant:t="primary",size:o="md",disabled:i=!1,fullWidth:a=!1,iconOnly:s=!1,loading:d=!1,leftIcon:c,rightIcon:m,...u}=e;return(0,n.jsxs)(l,{$variant:t,$size:o,disabled:i||d,$fullWidth:a,$iconOnly:s,$loading:d,...u,children:[c&&!d&&c,r,m&&!d&&m]})}},4859:(e,r,t)=>{t.r(r),t.d(r,{default:()=>oe});var o=t(3750),i=t.n(o),n=t(5043),a=t(5475),s=t(1529),l=t(4185),d=t(3681),c=t(4450),m=t(5845),u=t(579);const p=s.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,h=s.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,x=s.i7`
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,g=s.i7`
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`,v=s.i7`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,f=s.i7`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`,y=(s.i7`
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
  animation: ${p} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
  overflow-x: hidden;
`),b=s.Ay.header`
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
`,$=s.Ay.div`
  font-size: ${e=>{let{theme:r}=e;return r.typography.sizes["2xl"]}};
  font-weight: ${e=>{let{theme:r}=e;return r.typography.fontWeights.bold}};
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  display: flex;
  align-items: center;
  gap: ${e=>{let{theme:r}=e;return r.spacing.sm}};
`,j=s.Ay.div`
  width: 40px;
  height: 40px;
  animation: ${f} 3s ease-in-out infinite;
`,w=s.Ay.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`,A=s.Ay.section`
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
`,z=s.Ay.div`
  flex: 1;
  animation: ${x} 0.7s ease-in-out;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 2;
    margin-top: 2rem;
    animation: ${h} 0.7s ease-in-out;
  }
`,k=s.Ay.h1`
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
`,H=s.Ay.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  max-width: 600px;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`,Y=s.Ay.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
`,q=s.Ay.div`
  flex: 1;
  max-width: 550px;
  animation: ${g} 1s ease-in-out, ${f} 6s ease-in-out infinite;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 1;
    max-width: 400px;
    animation: ${p} 1s ease-in-out, ${f} 6s ease-in-out infinite;
  }
`,N=s.Ay.div`
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
  animation: ${v} 10s ease-in-out infinite;

  &.top-right {
    top: -100px;
    right: -100px;
  }

  &.bottom-left {
    bottom: -100px;
    left: -100px;
    animation-delay: 2s;
  }
`,R=s.Ay.section`
  padding: 6rem 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`,S=s.Ay.h2`
  font-size: 2.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`,C=s.Ay.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
`,P=s.Ay.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`,D=s.Ay.div`
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
`,I=s.Ay.div`
  font-size: 3rem;
  color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  margin-bottom: 1.5rem;
  animation: ${f} 3s ease-in-out infinite;
  display: inline-block;
`,X=s.Ay.h3`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,O=s.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  line-height: 1.7;
  font-size: 1.05rem;
`,W=s.Ay.section`
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
`,_=s.Ay.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`,V=s.Ay.div`
  margin-top: 3rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${e=>{let{theme:r}=e;return r.shadows.large}};
  position: relative;
  aspect-ratio: 16/9;
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  animation: ${v} 4s ease-in-out infinite;

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
`,F=s.Ay.section`
  padding: 6rem 2rem;
  background-color: ${e=>{let{theme:r}=e;return r.colors.background}};
  position: relative;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`,G=s.Ay.div`
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
`,E=s.Ay.div`
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
`,T=s.Ay.div`
  flex: 1;
`,M=s.Ay.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${e=>{let{theme:r}=e;return r.colors.text.primary}};
`,U=s.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  line-height: 1.7;
  font-size: 1.1rem;
`,B=s.Ay.section`
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
`,J=s.Ay.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`,K=s.Ay.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`,L=(0,s.Ay)(c.A)`
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
`,Q=s.Ay.div`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);

  &.small {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    animation: ${f} 6s ease-in-out infinite;
  }

  &.medium {
    width: 150px;
    height: 150px;
    bottom: 30%;
    right: 10%;
    animation: ${f} 8s ease-in-out infinite;
  }

  &.large {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: 30%;
    animation: ${f} 10s ease-in-out infinite;
  }
`,Z=s.Ay.footer`
  background-color: ${e=>{let{theme:r}=e;return r.colors.surface}};
  padding: 2rem;
  text-align: center;
  margin-top: auto;
`,ee=s.Ay.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`,re=s.Ay.a`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${e=>{let{theme:r}=e;return r.colors.primary}};
  }
`,te=s.Ay.p`
  color: ${e=>{let{theme:r}=e;return r.colors.text.secondary}};
  font-size: 0.9rem;
`,oe=()=>{const{isDarkMode:e,toggleTheme:r}=(0,d.D)(),[t,o]=(0,n.useState)([]),s=(0,n.useRef)(null);return(0,n.useEffect)((()=>{const e=new IntersectionObserver((e=>{e.forEach((e=>{if(e.isIntersecting){Array.from(e.target.children).forEach(((e,r)=>{setTimeout((()=>{o((e=>[...e,r]))}),200*r)}))}}))}),{threshold:.1});return s.current&&e.observe(s.current),()=>{s.current&&e.unobserve(s.current)}}),[]),(0,u.jsxs)(y,{children:[(0,u.jsxs)(b,{children:[(0,u.jsxs)($,{children:[(0,u.jsx)(j,{children:(0,u.jsx)(i(),{animationData:l,loop:!0})}),"SmartPlanning AI"]}),(0,u.jsxs)(w,{children:[(0,u.jsx)(m.o,{onChange:r,checked:e}),(0,u.jsx)(a.N_,{to:"/login",children:(0,u.jsx)(c.A,{variant:"ghost",children:"Se connecter"})}),(0,u.jsx)(a.N_,{to:"/register",children:(0,u.jsx)(c.A,{children:"S'inscrire"})})]})]}),(0,u.jsxs)(A,{children:[(0,u.jsx)(N,{className:"top-right"}),(0,u.jsx)(N,{className:"bottom-left"}),(0,u.jsxs)(z,{children:[(0,u.jsx)(k,{children:"Oubliez Excel pour un vrai outil de planification"}),(0,u.jsx)(H,{children:"Des plannings intelligents qui s'adaptent \xe0 votre activit\xe9 pour optimiser votre masse salariale. G\xe9rez-les o\xf9 que vous soyez, avec une interface intuitive et des fonctionnalit\xe9s avanc\xe9es."}),(0,u.jsxs)(Y,{children:[(0,u.jsx)(a.N_,{to:"/register",children:(0,u.jsx)(c.A,{size:"large",children:"Commencer gratuitement"})}),(0,u.jsx)(a.N_,{to:"/login",children:(0,u.jsx)(c.A,{variant:"outlined",size:"large",children:"Voir une d\xe9mo"})})]})]}),(0,u.jsx)(q,{children:(0,u.jsx)(i(),{animationData:l,loop:!0})})]}),(0,u.jsxs)(R,{children:[(0,u.jsx)(S,{children:"Une gestion de planning simplifi\xe9e"}),(0,u.jsx)(C,{children:"Notre solution vous offre tous les outils n\xe9cessaires pour une planification efficace et sans stress"}),(0,u.jsxs)(P,{children:[(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83e\udde0"}),(0,u.jsx)(X,{children:"Planification intelligente"}),(0,u.jsx)(O,{children:"Notre IA analyse vos besoins et cr\xe9e automatiquement des plannings optimis\xe9s en fonction de votre activit\xe9 et de vos ressources."})]}),(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83d\udcb0"}),(0,u.jsx)(X,{children:"Optimisation des co\xfbts"}),(0,u.jsx)(O,{children:"R\xe9duisez votre masse salariale gr\xe2ce \xe0 une meilleure allocation des ressources et une planification pr\xe9cise adapt\xe9e \xe0 votre charge de travail."})]}),(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83d\udcf1"}),(0,u.jsx)(X,{children:"Accessibilit\xe9 totale"}),(0,u.jsx)(O,{children:"G\xe9rez vos plannings o\xf9 que vous soyez, sur tous vos appareils. Une interface responsive pour rester connect\xe9 en permanence."})]}),(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83d\udcc4"}),(0,u.jsx)(X,{children:"PDF automatiques"}),(0,u.jsx)(O,{children:"G\xe9n\xe9rez des PDF pr\xeats \xe0 l'impression en un clic pour afficher les plannings ou les distribuer \xe0 vos \xe9quipes."})]}),(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83d\udd12"}),(0,u.jsx)(X,{children:"Validation s\xe9curis\xe9e"}),(0,u.jsx)(O,{children:"Syst\xe8me de validation et verrouillage des heures par les managers pour garantir l'int\xe9grit\xe9 des donn\xe9es."})]}),(0,u.jsxs)(D,{children:[(0,u.jsx)(I,{children:"\ud83d\udcca"}),(0,u.jsx)(X,{children:"Analyses d\xe9taill\xe9es"}),(0,u.jsx)(O,{children:"Visualisez des statistiques pr\xe9cises sur l'utilisation du temps et l'efficacit\xe9 de vos \xe9quipes pour prendre de meilleures d\xe9cisions."})]})]})]}),(0,u.jsx)(W,{children:(0,u.jsxs)(_,{children:[(0,u.jsx)(S,{children:"D\xe9couvrez SmartPlanning en action"}),(0,u.jsx)(C,{children:"Regardez notre vid\xe9o de d\xe9monstration pour voir comment notre solution peut transformer votre gestion de planning"}),(0,u.jsx)(V,{})]})}),(0,u.jsxs)(F,{children:[(0,u.jsx)(S,{children:"Plus d'efficacit\xe9 pour votre entreprise"}),(0,u.jsx)(C,{children:"SmartPlanning AI vous apporte des avantages concrets et mesurables"}),(0,u.jsxs)("div",{ref:s,style:{maxWidth:"900px",margin:"0 auto"},children:[(0,u.jsxs)(G,{className:t.includes(0)?"visible":"",children:[(0,u.jsx)(E,{children:"\u23f1\ufe0f"}),(0,u.jsxs)(T,{children:[(0,u.jsx)(M,{children:"Gain de temps consid\xe9rable"}),(0,u.jsx)(U,{children:"R\xe9duisez jusqu'\xe0 70% le temps consacr\xe9 \xe0 la cr\xe9ation et gestion des plannings gr\xe2ce \xe0 l'automatisation intelligente."})]})]}),(0,u.jsxs)(G,{className:t.includes(1)?"visible":"",children:[(0,u.jsx)(E,{children:"\ud83d\udcbc"}),(0,u.jsxs)(T,{children:[(0,u.jsx)(M,{children:"Optimisation de la masse salariale"}),(0,u.jsx)(U,{children:"Adaptez pr\xe9cis\xe9ment vos ressources humaines \xe0 votre activit\xe9 r\xe9elle et \xe9vitez les sureffectifs ou sous-effectifs co\xfbteux."})]})]}),(0,u.jsxs)(G,{className:t.includes(2)?"visible":"",children:[(0,u.jsx)(E,{children:"\ud83d\udd04"}),(0,u.jsxs)(T,{children:[(0,u.jsx)(M,{children:"Flexibilit\xe9 maximale"}),(0,u.jsx)(U,{children:"Modifiez vos plannings en temps r\xe9el et informez instantan\xe9ment vos \xe9quipes des changements via notre syst\xe8me de notifications."})]})]}),(0,u.jsxs)(G,{className:t.includes(3)?"visible":"",children:[(0,u.jsx)(E,{children:"\ud83d\udcca"}),(0,u.jsxs)(T,{children:[(0,u.jsx)(M,{children:"Donn\xe9es exploitables"}),(0,u.jsx)(U,{children:"Acc\xe9dez \xe0 des rapports d\xe9taill\xe9s et des analyses qui vous aident \xe0 prendre des d\xe9cisions strat\xe9giques bas\xe9es sur des donn\xe9es concr\xe8tes."})]})]})]})]}),(0,u.jsxs)(B,{children:[(0,u.jsx)(Q,{className:"small"}),(0,u.jsx)(Q,{className:"medium"}),(0,u.jsx)(Q,{className:"large"}),(0,u.jsx)(J,{children:"Pr\xeat \xe0 r\xe9volutionner votre gestion de planning ?"}),(0,u.jsx)(K,{children:"Rejoignez des milliers d'entreprises qui ont d\xe9j\xe0 optimis\xe9 leur planification gr\xe2ce \xe0 SmartPlanning AI"}),(0,u.jsx)(a.N_,{to:"/register",children:(0,u.jsx)(L,{size:"large",children:"Commencer gratuitement"})})]}),(0,u.jsxs)(Z,{children:[(0,u.jsxs)(ee,{children:[(0,u.jsx)(re,{href:"#",children:"Conditions d'utilisation"}),(0,u.jsx)(re,{href:"#",children:"Politique de confidentialit\xe9"}),(0,u.jsx)(re,{href:"#",children:"Contact"})]}),(0,u.jsxs)(te,{children:["\xa9 ",(new Date).getFullYear()," SmartPlanning AI. Tous droits r\xe9serv\xe9s."]})]})]})}},5845:(e,r,t)=>{t.d(r,{o:()=>c});var o=t(1529),i=t(579);const n=o.Ay.label`
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
`,s=o.Ay.span`
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
`,l=o.Ay.span`
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
`,c=e=>{let{onChange:r,checked:t}=e;return(0,i.jsxs)(n,{children:[(0,i.jsx)(a,{type:"checkbox",onChange:r,checked:t}),(0,i.jsx)(s,{}),(0,i.jsx)(l,{children:"\u2600\ufe0f"}),(0,i.jsx)(d,{children:"\ud83c\udf19"})]})}}}]);
//# sourceMappingURL=859.4652a0a5.chunk.js.map