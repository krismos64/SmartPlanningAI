"use strict";(self.webpackChunksmartplanning_ai=self.webpackChunksmartplanning_ai||[]).push([[41],{2041:(e,n,s)=>{s.r(n),s.d(n,{default:()=>I});var t=s(5043),r=s(5475),o=s(1529),i=s(3681),a=s(5845),l=s(579);const d=o.i7`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`,c=o.i7`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`,u=o.i7`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`,h=o.i7`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`,m=o.i7`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
`,p=o.Ay.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${e=>{let{theme:n}=e;return n.colors.background}};
  color: ${e=>{let{theme:n}=e;return n.colors.text.primary}};
  animation: ${d} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
`,x=o.Ay.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${e=>{let{theme:n}=e;return n.spacing.lg}} ${e=>{let{theme:n}=e;return n.spacing.xl}};
  box-shadow: ${e=>{let{theme:n}=e;return n.shadows.small}};
  background-color: ${e=>{let{theme:n}=e;return n.colors.surface}};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.md}}) {
    padding: ${e=>{let{theme:n}=e;return n.spacing.md}};
    flex-direction: column;
    gap: ${e=>{let{theme:n}=e;return n.spacing.md}};
  }
`,g=(0,o.Ay)(r.N_)`
  font-size: ${e=>{let{theme:n}=e;return n.typography.sizes.xl}};
  font-weight: ${e=>{let{theme:n}=e;return n.typography.fontWeights.bold}};
  color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${e=>{let{theme:n}=e;return n.spacing.sm}};
`,j=o.Ay.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.md}}) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`,f=(0,o.Ay)(r.N_)`
  text-decoration: none;
  color: ${e=>{let{theme:n}=e;return n.colors.text.secondary}};
  font-weight: ${e=>{let{theme:n}=e;return n.typography.fontWeights.medium}};
  transition: color 0.2s ease;

  &:hover {
    color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  }
`,v=o.Ay.main`
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: ${e=>{let{theme:n}=e;return n.spacing.xl}};
  animation: ${c} 0.7s ease-in-out;

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.md}}) {
    padding: ${e=>{let{theme:n}=e;return n.spacing.lg}};
  }

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.sm}}) {
    padding: ${e=>{let{theme:n}=e;return n.spacing.md}};
  }
`,b=o.Ay.h1`
  font-size: 2.5rem;
  color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.xl}};
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
      ${e=>{let{theme:n}=e;return n.colors.primary}},
      ${e=>{let{theme:n}=e;return n.colors.secondary}}
    );
    border-radius: 2px;
    animation: ${u} 2s infinite;
  }

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.md}}) {
    font-size: 2rem;
  }
`,y=o.Ay.section`
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.xl}};
  padding: ${e=>{let{theme:n}=e;return n.spacing.lg}};
  background-color: ${e=>{let{theme:n}=e;return n.colors.surface}};
  border-radius: ${e=>{let{theme:n}=e;return n.borderRadius.large}};
  box-shadow: ${e=>{let{theme:n}=e;return n.shadows.medium}};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${e=>{let{theme:n}=e;return n.shadows.large}};
  }

  &::before {
    content: "";
    position: absolute;
    top: -2px;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(
      90deg,
      ${e=>{let{theme:n}=e;return n.colors.primary}},
      ${e=>{let{theme:n}=e;return n.colors.info}},
      ${e=>{let{theme:n}=e;return n.colors.secondary}}
    );
    background-size: 200% 100%;
    animation: ${m} 3s infinite linear;
  }
`,$=o.Ay.h2`
  font-size: 1.8rem;
  color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.md}};

  @media (max-width: ${e=>{let{theme:n}=e;return n.breakpoints.md}}) {
    font-size: 1.5rem;
  }
`,k=o.Ay.p`
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.md}};
  line-height: 1.6;
  color: ${e=>{let{theme:n}=e;return n.colors.text.primary}};
`,w=o.Ay.ul`
  margin-left: ${e=>{let{theme:n}=e;return n.spacing.xl}};
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.md}};
`,A=o.Ay.li`
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.sm}};
  line-height: 1.6;
`,z=o.Ay.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${e=>{let{theme:n}=e;return n.spacing.lg}};
  border-radius: ${e=>{let{theme:n}=e;return n.borderRadius.medium}};
  overflow: hidden;
  box-shadow: ${e=>{let{theme:n}=e;return n.shadows.small}};
`,D=o.Ay.thead`
  background-color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  color: white;
`,q=o.Ay.tr`
  &:nth-child(even) {
    background-color: ${e=>{let{theme:n}=e;return n.isDark?"rgba(255, 255, 255, 0.05)":"rgba(0, 0, 0, 0.02)"}};
  }

  &:hover {
    background-color: ${e=>{let{theme:n}=e;return n.isDark?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.05)"}};
  }
`,C=o.Ay.th`
  padding: ${e=>{let{theme:n}=e;return n.spacing.md}};
  text-align: left;
`,P=o.Ay.td`
  padding: ${e=>{let{theme:n}=e;return n.spacing.md}};
  border-top: 1px solid
    ${e=>{let{theme:n}=e;return n.isDark?"rgba(255, 255, 255, 0.1)":"rgba(0, 0, 0, 0.1)"}};
`,N=o.Ay.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${e=>{let{theme:n}=e;return n.colors.primary}};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: ${e=>{let{theme:n}=e;return n.shadows.medium}};
  transition: background-color 0.3s ease, transform 0.3s ease;
  opacity: ${e=>{let{visible:n}=e;return n?"1":"0"}};
  transform: ${e=>{let{visible:n}=e;return n?"scale(1)":"scale(0.8)"}};
  pointer-events: ${e=>{let{visible:n}=e;return n?"auto":"none"}};
  animation: ${h} 3s ease-in-out infinite;
  z-index: 10;

  &:hover {
    background-color: ${e=>{let{theme:n}=e;return n.colors.info}};
    transform: ${e=>{let{visible:n}=e;return n?"scale(1.1)":"scale(0.8)"}};
  }
`,I=()=>{const{toggleTheme:e}=(0,i.D)(),n="dark"===(0,i.D)().theme,s=(0,o.DP)(),[r,d]=(0,t.useState)(!1),c=(0,t.useRef)(null);(0,t.useEffect)((()=>{const e=()=>{window.scrollY>300?d(!0):d(!1)};return window.addEventListener("scroll",e),()=>{window.removeEventListener("scroll",e)}}),[]);return(0,l.jsxs)(p,{children:[(0,l.jsxs)(x,{children:[(0,l.jsxs)(g,{to:"/",children:[(0,l.jsx)("span",{children:"\ud83d\udcc5"})," SmartPlanning AI"]}),(0,l.jsxs)(j,{children:[(0,l.jsx)(f,{to:"/",children:"Accueil"}),(0,l.jsx)(f,{to:"/login",children:"Connexion"}),(0,l.jsx)(a.o,{onChange:e,checked:n})]})]}),(0,l.jsxs)(v,{ref:c,children:[(0,l.jsx)(b,{children:"Politique de Confidentialit\xe9"}),(0,l.jsxs)(k,{children:[(0,l.jsx)("strong",{children:"Derni\xe8re mise \xe0 jour :"})," ","15 mars 2023"]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"1. Introduction"}),(0,l.jsx)(k,{children:"Chez SmartPlanning AI, nous accordons une importance particuli\xe8re \xe0 la protection de vos donn\xe9es personnelles. Cette politique de confidentialit\xe9 vous informe de la mani\xe8re dont nous collectons, utilisons, partageons et prot\xe9geons vos donn\xe9es personnelles lorsque vous utilisez notre plateforme de gestion de plannings et de personnel."}),(0,l.jsx)(k,{children:"Cette politique est conforme au R\xe8glement G\xe9n\xe9ral sur la Protection des Donn\xe9es (RGPD) et \xe0 toutes les lois locales applicables en mati\xe8re de protection des donn\xe9es."})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"2. Donn\xe9es Que Nous Collectons"}),(0,l.jsx)(k,{children:"Selon votre utilisation de nos services, nous pouvons collecter les cat\xe9gories de donn\xe9es suivantes :"}),(0,l.jsxs)(w,{children:[(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Donn\xe9es d'identification"})," : nom, pr\xe9nom, adresse e-mail, num\xe9ro de t\xe9l\xe9phone."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Donn\xe9es professionnelles"})," : poste, d\xe9partement, horaires de travail, pr\xe9f\xe9rences d'horaires, historique des plannings."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Donn\xe9es d'utilisation"})," : informations sur la fa\xe7on dont vous utilisez notre plateforme, vos interactions avec les fonctionnalit\xe9s."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Donn\xe9es techniques"})," : adresse IP, type de navigateur, informations sur l'appareil utilis\xe9."]})]})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"3. Comment Nous Utilisons Vos Donn\xe9es"}),(0,l.jsxs)(z,{children:[(0,l.jsx)(D,{children:(0,l.jsxs)(q,{children:[(0,l.jsx)(C,{children:"Finalit\xe9"}),(0,l.jsx)(C,{children:"Base juridique"}),(0,l.jsx)(C,{children:"Dur\xe9e de conservation"})]})}),(0,l.jsxs)("tbody",{children:[(0,l.jsxs)(q,{children:[(0,l.jsx)(P,{children:"Cr\xe9ation et gestion de votre compte utilisateur"}),(0,l.jsx)(P,{children:"Ex\xe9cution du contrat"}),(0,l.jsx)(P,{children:"Dur\xe9e du contrat + 3 ans"})]}),(0,l.jsxs)(q,{children:[(0,l.jsx)(P,{children:"Gestion des plannings et des ressources humaines"}),(0,l.jsx)(P,{children:"Ex\xe9cution du contrat / Int\xe9r\xeat l\xe9gitime"}),(0,l.jsx)(P,{children:"Dur\xe9e du contrat + 5 ans"})]}),(0,l.jsxs)(q,{children:[(0,l.jsx)(P,{children:"Am\xe9lioration de nos services et analyses statistiques"}),(0,l.jsx)(P,{children:"Int\xe9r\xeat l\xe9gitime"}),(0,l.jsx)(P,{children:"3 ans"})]}),(0,l.jsxs)(q,{children:[(0,l.jsx)(P,{children:"Communication par email concernant nos services"}),(0,l.jsx)(P,{children:"Consentement / Int\xe9r\xeat l\xe9gitime"}),(0,l.jsx)(P,{children:"Jusqu'au retrait du consentement"})]}),(0,l.jsxs)(q,{children:[(0,l.jsx)(P,{children:"Respect des obligations l\xe9gales (comptabilit\xe9, fiscalit\xe9...)"}),(0,l.jsx)(P,{children:"Obligation l\xe9gale"}),(0,l.jsx)(P,{children:"Selon les exigences l\xe9gales (5 \xe0 10 ans)"})]})]})]})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"4. Partage des Donn\xe9es"}),(0,l.jsx)(k,{children:"Nous pouvons partager vos donn\xe9es personnelles dans les situations suivantes :"}),(0,l.jsxs)(w,{children:[(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Avec les autres utilisateurs de votre organisation"})," ",": les utilisateurs ayant les droits d'administration ou de gestion peuvent acc\xe9der \xe0 certaines de vos donn\xe9es professionnelles afin de g\xe9rer les plannings."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Avec nos prestataires de services"})," : nous travaillons avec des prestataires qui nous fournissent des services informatiques, d'analyse ou commerciaux et qui peuvent avoir besoin d'acc\xe9der \xe0 certaines de vos donn\xe9es."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"En cas d'obligation l\xe9gale"})," : nous pouvons divulguer vos donn\xe9es si nous sommes tenus de le faire par la loi ou en r\xe9ponse \xe0 des demandes l\xe9gitimes des autorit\xe9s publiques."]})]}),(0,l.jsx)(k,{children:"Nous n'effectuons aucun transfert de donn\xe9es en dehors de l'Union Europ\xe9enne, sauf vers des pays b\xe9n\xe9ficiant d'une d\xe9cision d'ad\xe9quation ou avec des garanties appropri\xe9es conform\xe9ment au RGPD."})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"5. Vos Droits"}),(0,l.jsx)(k,{children:"Conform\xe9ment au RGPD, vous disposez des droits suivants concernant vos donn\xe9es personnelles :"}),(0,l.jsxs)(w,{children:[(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit d'acc\xe8s"})," : vous pouvez demander une copie de vos donn\xe9es personnelles que nous d\xe9tenons."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit de rectification"})," : vous pouvez demander la correction de vos donn\xe9es inexactes ou incompl\xe8tes."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit \xe0 l'effacement"})," : vous pouvez demander la suppression de vos donn\xe9es dans certaines circonstances."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit \xe0 la limitation du traitement"})," : vous pouvez demander la restriction du traitement de vos donn\xe9es."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit \xe0 la portabilit\xe9"})," : vous pouvez demander le transfert de vos donn\xe9es \xe0 un autre organisme."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit d'opposition"})," : vous pouvez vous opposer au traitement de vos donn\xe9es bas\xe9 sur notre int\xe9r\xeat l\xe9gitime."]}),(0,l.jsxs)(A,{children:[(0,l.jsx)("strong",{children:"Droit de retirer votre consentement"})," : vous pouvez retirer votre consentement \xe0 tout moment pour les traitements bas\xe9s sur cette base l\xe9gale."]})]}),(0,l.jsxs)(k,{children:["Pour exercer ces droits, veuillez nous contacter \xe0"," ",(0,l.jsx)("a",{href:"mailto:dpo@smartplanning.ai",style:{color:s.colors.primary},children:"dpo@smartplanning.ai"}),". Nous r\xe9pondrons \xe0 votre demande dans un d\xe9lai d'un mois, qui peut \xeatre prolong\xe9 de deux mois si n\xe9cessaire."]})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"6. S\xe9curit\xe9 des Donn\xe9es"}),(0,l.jsx)(k,{children:"Nous mettons en \u0153uvre des mesures techniques et organisationnelles appropri\xe9es pour prot\xe9ger vos donn\xe9es personnelles contre la perte, l'acc\xe8s non autoris\xe9, la divulgation, l'alt\xe9ration et la destruction, notamment :"}),(0,l.jsxs)(w,{children:[(0,l.jsx)(A,{children:"Chiffrement des donn\xe9es sensibles"}),(0,l.jsx)(A,{children:"Contr\xf4les d'acc\xe8s stricts"}),(0,l.jsx)(A,{children:"Pare-feu et syst\xe8mes de d\xe9tection d'intrusion"}),(0,l.jsx)(A,{children:"Sauvegardes r\xe9guli\xe8res"}),(0,l.jsx)(A,{children:"Formation de notre personnel \xe0 la s\xe9curit\xe9 des donn\xe9es"})]})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"7. Cookies et Technologies Similaires"}),(0,l.jsx)(k,{children:"Nous utilisons des cookies et des technologies similaires pour am\xe9liorer votre exp\xe9rience sur notre plateforme, analyser l'utilisation de nos services et personnaliser le contenu."}),(0,l.jsx)(k,{children:"Vous pouvez g\xe9rer vos pr\xe9f\xe9rences concernant les cookies \xe0 tout moment en modifiant les param\xe8tres de votre navigateur ou en utilisant notre outil de gestion des cookies disponible sur notre plateforme."})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"8. Modifications de la Politique de Confidentialit\xe9"}),(0,l.jsx)(k,{children:"Nous pouvons mettre \xe0 jour cette politique de confidentialit\xe9 de temps \xe0 autre pour refl\xe9ter des changements dans nos pratiques ou pour d'autres raisons op\xe9rationnelles, l\xe9gales ou r\xe9glementaires."}),(0,l.jsx)(k,{children:"En cas de modifications substantielles, nous vous en informerons par email ou par une notification sur notre plateforme avant que les modifications ne prennent effet."})]}),(0,l.jsxs)(y,{children:[(0,l.jsx)($,{children:"9. Contact"}),(0,l.jsx)(k,{children:"Si vous avez des questions ou des pr\xe9occupations concernant cette politique de confidentialit\xe9 ou le traitement de vos donn\xe9es personnelles, veuillez nous contacter :"}),(0,l.jsxs)(k,{children:[(0,l.jsx)("strong",{children:"Responsable de la protection des donn\xe9es :"})," ",(0,l.jsx)("a",{href:"mailto:dpo@smartplanning.ai",style:{color:s.colors.primary},children:"dpo@smartplanning.ai"})]}),(0,l.jsxs)(k,{children:[(0,l.jsx)("strong",{children:"Adresse postale :"})," SmartPlanning AI, 123 Avenue de la Tech, 75001 Paris, France"]}),(0,l.jsx)(k,{children:"Vous avez \xe9galement le droit d'introduire une r\xe9clamation aupr\xe8s de la Commission Nationale de l'Informatique et des Libert\xe9s (CNIL) si vous estimez que le traitement de vos donn\xe9es personnelles n'est pas conforme aux r\xe9glementations en vigueur."})]})]}),(0,l.jsx)(N,{visible:r,onClick:()=>{window.scrollTo({top:0,behavior:"smooth"})},"aria-label":"Retour en haut de page",children:"\u2191"})]})}},5845:(e,n,s)=>{s.d(n,{o:()=>c});var t=s(1529),r=s(579);const o=t.Ay.label`
  position: relative;
  display: inline-block;
  width: 60px;
  height: 30px;
  cursor: pointer;
`,i=t.Ay.input`
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
`,l=t.Ay.span`
  position: absolute;
  left: 8px;
  top: 6px;
  color: #f9d71c;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,d=t.Ay.span`
  position: absolute;
  right: 8px;
  top: 6px;
  color: #f8f9fa;
  font-size: 16px;
  z-index: 1;
  pointer-events: none;
`,c=e=>{let{onChange:n,checked:s}=e;return(0,r.jsxs)(o,{children:[(0,r.jsx)(i,{type:"checkbox",onChange:n,checked:s}),(0,r.jsx)(a,{}),(0,r.jsx)(l,{children:"\u2600\ufe0f"}),(0,r.jsx)(d,{children:"\ud83c\udf19"})]})}}}]);
//# sourceMappingURL=41.6f053914.chunk.js.map