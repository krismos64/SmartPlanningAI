"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[754],{3754:(e,s,t)=>{t.r(s),t.d(s,{default:()=>z});var n=t(5043),i=t(5475),r=t(1529),o=t(3681),a=t(5845),l=t(579);const c=r.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,d=r.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,u=r.i7`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`,p=r.i7`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`,m=r.Ay.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${e=>{let{theme:s}=e;return s.colors.background}};
  color: ${e=>{let{theme:s}=e;return s.colors.text.primary}};
  animation: ${c} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
`,h=r.Ay.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${e=>{let{theme:s}=e;return s.spacing.lg}} ${e=>{let{theme:s}=e;return s.spacing.xl}};
  box-shadow: ${e=>{let{theme:s}=e;return s.shadows.small}};
  background-color: ${e=>{let{theme:s}=e;return s.colors.surface}};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.md}}) {
    padding: ${e=>{let{theme:s}=e;return s.spacing.md}};
    flex-direction: column;
    gap: ${e=>{let{theme:s}=e;return s.spacing.md}};
  }
`,x=(0,r.Ay)(i.N_)`
  font-size: ${e=>{let{theme:s}=e;return s.typography.sizes.xl}};
  font-weight: ${e=>{let{theme:s}=e;return s.typography.fontWeights.bold}};
  color: ${e=>{let{theme:s}=e;return s.colors.primary}};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${e=>{let{theme:s}=e;return s.spacing.sm}};
`,g=r.Ay.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.md}}) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`,f=(0,r.Ay)(i.N_)`
  text-decoration: none;
  color: ${e=>{let{theme:s}=e;return s.colors.text.secondary}};
  font-weight: ${e=>{let{theme:s}=e;return s.typography.fontWeights.medium}};
  transition: color 0.2s ease;

  &:hover {
    color: ${e=>{let{theme:s}=e;return s.colors.primary}};
  }
`,v=r.Ay.main`
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: ${e=>{let{theme:s}=e;return s.spacing.xl}};
  animation: ${d} 0.7s ease-in-out;

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.md}}) {
    padding: ${e=>{let{theme:s}=e;return s.spacing.lg}};
  }

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.sm}}) {
    padding: ${e=>{let{theme:s}=e;return s.spacing.md}};
  }
`,b=r.Ay.h1`
  font-size: 2.5rem;
  color: ${e=>{let{theme:s}=e;return s.colors.primary}};
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.xl}};
  position: relative;
  display: inline-block;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 0;
    width: 100px;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${e=>{let{theme:s}=e;return s.colors.primary}},
      ${e=>{let{theme:s}=e;return s.colors.secondary}}
    );
    border-radius: 2px;
    animation: ${u} 2s infinite;
  }

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.md}}) {
    font-size: 2rem;
  }
`,j=r.Ay.section`
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.xl}};
  padding: ${e=>{let{theme:s}=e;return s.spacing.lg}};
  background-color: ${e=>{let{theme:s}=e;return s.colors.surface}};
  border-radius: ${e=>{let{theme:s}=e;return s.borderRadius.large}};
  box-shadow: ${e=>{let{theme:s}=e;return s.shadows.medium}};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:s}=e;return s.shadows.large}};
  }
`,y=r.Ay.h2`
  font-size: 1.8rem;
  color: ${e=>{let{theme:s}=e;return s.colors.primary}};
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.md}};

  @media (max-width: ${e=>{let{theme:s}=e;return s.breakpoints.md}}) {
    font-size: 1.5rem;
  }
`,$=r.Ay.p`
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.md}};
  line-height: 1.6;
  color: ${e=>{let{theme:s}=e;return s.colors.text.primary}};
`,w=r.Ay.ul`
  margin-left: ${e=>{let{theme:s}=e;return s.spacing.xl}};
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.md}};
`,S=r.Ay.li`
  margin-bottom: ${e=>{let{theme:s}=e;return s.spacing.sm}};
  line-height: 1.6;
`,k=r.Ay.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:s}=e;return s.colors.primary}};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: ${e=>{let{theme:s}=e;return s.shadows.medium}};
  transition: background-color 0.3s ease, transform 0.3s ease;
  opacity: ${e=>{let{visible:s}=e;return s?"1":"0"}};
  transform: ${e=>{let{visible:s}=e;return s?"scale(1)":"scale(0.8)"}};
  pointer-events: ${e=>{let{visible:s}=e;return s?"auto":"none"}};
  animation: ${p} 3s ease-in-out infinite;
  z-index: 10;

  &:hover {
    background-color: ${e=>{let{theme:s}=e;return s.colors.info}};
    transform: ${e=>{let{visible:s}=e;return s?"scale(1.1)":"scale(0.8)"}};
  }
`,z=()=>{const{toggleTheme:e}=(0,o.D)(),s="dark"===(0,o.D)().theme,t=(0,r.DP)(),[c,d]=(0,n.useState)(!1),u=(0,n.useRef)(null);(0,n.useEffect)((()=>{const e=()=>{window.scrollY>300?d(!0):d(!1)};return window.addEventListener("scroll",e),()=>{window.removeEventListener("scroll",e)}}),[]);return(0,l.jsxs)(m,{children:[(0,l.jsxs)(h,{children:[(0,l.jsxs)(x,{to:"/",children:[(0,l.jsx)("span",{children:"\ud83d\udcc5"})," SmartPlanning AI"]}),(0,l.jsxs)(g,{children:[(0,l.jsx)(f,{to:"/",children:"Accueil"}),(0,l.jsx)(f,{to:"/login",children:"Connexion"}),(0,l.jsx)(a.o,{onChange:e,checked:s})]})]}),(0,l.jsxs)(v,{ref:u,children:[(0,l.jsx)(b,{children:"Conditions d'Utilisation"}),(0,l.jsxs)($,{children:[(0,l.jsx)("strong",{children:"Derni\xe8re mise \xe0 jour :"})," ","15 mars 2023"]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"1. Introduction"}),(0,l.jsx)($,{children:'Bienvenue sur SmartPlanning AI, une plateforme de gestion de plannings et de personnel. Ces conditions d\'utilisation r\xe9gissent votre utilisation de notre site web, de nos applications et de nos services (collectivement d\xe9sign\xe9s comme les "Services").'}),(0,l.jsx)($,{children:"En utilisant nos Services, vous acceptez d'\xeatre li\xe9 par ces conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser nos Services."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"2. D\xe9finitions"}),(0,l.jsxs)(w,{children:[(0,l.jsxs)(S,{children:[(0,l.jsx)("strong",{children:"SmartPlanning AI"})," : d\xe9signe notre plateforme de gestion de plannings et de personnel, y compris le site web, les applications et tous les services associ\xe9s."]}),(0,l.jsxs)(S,{children:[(0,l.jsx)("strong",{children:"Utilisateur"})," : d\xe9signe toute personne qui acc\xe8de \xe0 nos Services, y compris les administrateurs, les gestionnaires et les employ\xe9s."]}),(0,l.jsxs)(S,{children:[(0,l.jsx)("strong",{children:"Contenu"})," : d\xe9signe toutes les informations, donn\xe9es, textes, images, graphiques, vid\xe9os, messages ou autres mat\xe9riels que vous publiez, t\xe9l\xe9chargez, partagez, stockez ou rendez disponible sur nos Services."]})]})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"3. Services Propos\xe9s"}),(0,l.jsx)($,{children:"SmartPlanning AI fournit des outils de gestion de plannings, de suivi de temps de travail, de gestion des cong\xe9s et d'optimisation des ressources humaines. Nos Services peuvent inclure :"}),(0,l.jsxs)(w,{children:[(0,l.jsx)(S,{children:"Cr\xe9ation et gestion de plannings"}),(0,l.jsx)(S,{children:"Gestion des cong\xe9s et absences"}),(0,l.jsx)(S,{children:"Analyse de donn\xe9es et rapports"}),(0,l.jsx)(S,{children:"Syst\xe8mes de communication interne"}),(0,l.jsx)(S,{children:"Outils d'optimisation assist\xe9s par intelligence artificielle"})]})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"4. Compte Utilisateur"}),(0,l.jsx)($,{children:"Pour utiliser certaines fonctionnalit\xe9s de nos Services, vous devez cr\xe9er un compte. Vous \xeates responsable de maintenir la confidentialit\xe9 de vos informations d'identification et de toutes les activit\xe9s qui se produisent sous votre compte."}),(0,l.jsx)($,{children:"Vous acceptez de nous fournir des informations pr\xe9cises, actuelles et compl\xe8tes lors de la cr\xe9ation de votre compte et de mettre \xe0 jour ces informations pour les maintenir exactes."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"5. Propri\xe9t\xe9 Intellectuelle"}),(0,l.jsx)($,{children:"SmartPlanning AI et son contenu, fonctionnalit\xe9s et fonctionnalit\xe9s sont et resteront la propri\xe9t\xe9 exclusive de SmartPlanning AI et de ses conc\xe9dants de licence. Nos Services sont prot\xe9g\xe9s par le droit d'auteur, les marques et autres lois fran\xe7aises et internationales."}),(0,l.jsx)($,{children:"Vous ne pouvez pas reproduire, distribuer, modifier, cr\xe9er des \u0153uvres d\xe9riv\xe9es, afficher publiquement, ex\xe9cuter publiquement, republier, t\xe9l\xe9charger, stocker ou transmettre tout mat\xe9riel de nos Services, sauf si express\xe9ment permis par ces conditions."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"6. Confidentialit\xe9 des Donn\xe9es"}),(0,l.jsxs)($,{children:["Notre traitement de vos donn\xe9es personnelles est r\xe9gi par notre"," ",(0,l.jsx)(i.N_,{to:"/privacy",style:{color:t.colors.primary},children:"Politique de Confidentialit\xe9"}),", qui est incorpor\xe9e \xe0 ces conditions d'utilisation. En utilisant nos Services, vous consentez \xe0 ces pratiques."]}),(0,l.jsx)($,{children:"Conform\xe9ment au R\xe8glement G\xe9n\xe9ral sur la Protection des Donn\xe9es (RGPD), nous nous engageons \xe0 prot\xe9ger vos donn\xe9es personnelles et \xe0 respecter vos droits \xe0 la vie priv\xe9e."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"7. Responsabilit\xe9s de l'Utilisateur"}),(0,l.jsx)($,{children:"En utilisant nos Services, vous acceptez de :"}),(0,l.jsxs)(w,{children:[(0,l.jsx)(S,{children:"Utiliser nos Services conform\xe9ment \xe0 toutes les lois applicables"}),(0,l.jsx)(S,{children:"Ne pas utiliser nos Services d'une mani\xe8re qui pourrait endommager, d\xe9sactiver, surcharger ou compromettre nos syst\xe8mes"}),(0,l.jsx)(S,{children:"Ne pas tenter d'acc\xe9der sans autorisation \xe0 des parties de nos Services auxquelles vous n'avez pas droit d'acc\xe8s"}),(0,l.jsx)(S,{children:"Ne pas utiliser nos Services pour transmettre du mat\xe9riel ill\xe9gal, diffamatoire, harcelant, invasif de la vie priv\xe9e d'autrui, ou autrement r\xe9pr\xe9hensible"})]})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"8. Limitations de Responsabilit\xe9"}),(0,l.jsx)($,{children:'SmartPlanning AI fournit ses Services "tels quels" et "tels que disponibles", sans garantie d\'aucune sorte. Nous ne garantissons pas que nos Services seront ininterrompus, opportuns, s\xe9curis\xe9s ou exempts d\'erreurs.'}),(0,l.jsx)($,{children:"En aucun cas, SmartPlanning AI ne sera responsable des dommages indirects, accessoires, sp\xe9ciaux, cons\xe9cutifs ou punitifs, ou de toute perte de profits ou de revenus, r\xe9sultant de votre utilisation de nos Services."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"9. Modifications des Conditions"}),(0,l.jsx)($,{children:"Nous nous r\xe9servons le droit de modifier ces conditions d'utilisation \xe0 tout moment. Les modifications entreront en vigueur d\xe8s leur publication sur nos Services. Votre utilisation continue de nos Services apr\xe8s la publication des modifications constitue votre acceptation des nouvelles conditions."}),(0,l.jsx)($,{children:"Nous vous informerons des modifications substantielles par email ou par une notification sur nos Services."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"10. R\xe9siliation"}),(0,l.jsx)($,{children:"Nous nous r\xe9servons le droit de suspendre ou de r\xe9silier votre acc\xe8s \xe0 nos Services, \xe0 notre seule discr\xe9tion, sans pr\xe9avis, pour des violations de ces conditions d'utilisation ou pour toute autre raison."}),(0,l.jsx)($,{children:"Vous pouvez r\xe9silier votre compte \xe0 tout moment en suivant les instructions sur nos Services ou en nous contactant directement."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"11. Droit Applicable"}),(0,l.jsx)($,{children:"Ces conditions d'utilisation sont r\xe9gies et interpr\xe9t\xe9es conform\xe9ment aux lois fran\xe7aises, sans \xe9gard aux principes de conflits de lois."}),(0,l.jsx)($,{children:"Tout litige d\xe9coulant de ou li\xe9 \xe0 ces conditions sera soumis \xe0 la juridiction exclusive des tribunaux fran\xe7ais."})]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(y,{children:"12. Contact"}),(0,l.jsxs)($,{children:["Si vous avez des questions concernant ces conditions d'utilisation, veuillez nous contacter \xe0 l'adresse suivante :"," ",(0,l.jsx)("a",{href:"mailto:contact@smartplanning.ai",style:{color:t.colors.primary},children:"contact@smartplanning.ai"})]})]})]}),(0,l.jsx)(k,{visible:c,onClick:()=>{window.scrollTo({top:0,behavior:"smooth"})},"aria-label":"Retour en haut de page",children:"\u2191"})]})}},5845:(e,s,t)=>{t.d(s,{o:()=>d});var n=t(1529),i=t(579);const r=n.Ay.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
`,o=n.Ay.input`
  opacity: 0;
  width: 0;
  height: 0;

  &:checked + span {
    background-color: #4361ee;
  }

  &:checked + span:before {
    transform: translateX(30px);
  }
`,a=n.Ay.span`
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
`,l=n.Ay.span`
  position: absolute;
  left: 8px;
  top: 6px;
  color: #f9d71c;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,c=n.Ay.span`
  position: absolute;
  right: 8px;
  top: 6px;
  color: #f8f9fa;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,d=e=>{let{onChange:s,checked:t}=e;return(0,i.jsxs)(r,{children:[(0,i.jsx)(o,{type:"checkbox",onChange:s,checked:t}),(0,i.jsx)(a,{}),(0,i.jsx)(l,{children:"\u2600\ufe0f"}),(0,i.jsx)(c,{children:"\ud83c\udf19"})]})}}}]);
//# sourceMappingURL=754.44202f56.chunk.js.map