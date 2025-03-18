import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled, {
  keyframes,
  useTheme as useStyledTheme,
} from "styled-components";
import { useTheme } from "../components/ThemeProvider";
import { ThemeSwitch } from "../components/ui/ThemeSwitch";

// Animations
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    transform: translateY(30px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.4);
  }
  70% {
    box-shadow: 0 0 0 15px rgba(79, 70, 229, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(79, 70, 229, 0);
  }
`;

const floatAnimation = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-10px);
  }
  100% {
    transform: translateY(0px);
  }
`;

// Styled Components
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  animation: ${fadeIn} 0.5s ease-in-out;
  transition: background-color 0.3s ease, color 0.3s ease;
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  box-shadow: ${({ theme }) => theme.shadows.small};
  background-color: ${({ theme }) => theme.colors.surface};
  position: sticky;
  top: 0;
  z-index: 100;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Logo = styled(Link)`
  font-size: ${({ theme }) => theme.typography.sizes.xl};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`;

const NavItem = styled(Link)`
  text-decoration: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Content = styled.main`
  flex: 1;
  max-width: 1000px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.xl};
  animation: ${slideUp} 0.7s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.lg};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`;

const PageTitle = styled.h1`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
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
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    border-radius: 2px;
    animation: ${pulse} 2s infinite;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 2rem;
  }
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.large};
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const SectionTitle = styled.h2`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 1.5rem;
  }
`;

const Paragraph = styled.p`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const List = styled.ul`
  margin-left: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`;

const ListItem = styled.li`
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: 1.6;
`;

const BackToTopButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: background-color 0.3s ease, transform 0.3s ease;
  opacity: ${({ visible }) => (visible ? "1" : "0")};
  transform: ${({ visible }) => (visible ? "scale(1)" : "scale(0.8)")};
  pointer-events: ${({ visible }) => (visible ? "auto" : "none")};
  animation: ${floatAnimation} 3s ease-in-out infinite;
  z-index: 10;

  &:hover {
    background-color: ${({ theme }) => theme.colors.info};
    transform: ${({ visible }) => (visible ? "scale(1.1)" : "scale(0.8)")};
  }
`;

const Footer = styled.footer`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.md};

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`;

const FooterLink = styled(Link)`
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.sizes.sm};
`;

const TermsOfService = () => {
  const { toggleTheme } = useTheme();
  const isDarkMode = useTheme().theme === "dark";
  const styledTheme = useStyledTheme();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const lastUpdate = "15 mars 2023";

  return (
    <PageContainer>
      <Header>
        <Logo to="/">
          <span>📅</span> SmartPlanning AI
        </Logo>
        <Nav>
          <NavItem to="/">Accueil</NavItem>
          <NavItem to="/login">Connexion</NavItem>
          <ThemeSwitch onChange={toggleTheme} checked={isDarkMode} />
        </Nav>
      </Header>

      <Content ref={contentRef}>
        <PageTitle>Conditions d'Utilisation</PageTitle>
        <Paragraph>
          <strong>Dernière mise à jour :</strong> {lastUpdate}
        </Paragraph>

        <Section>
          <SectionTitle>1. Introduction</SectionTitle>
          <Paragraph>
            Bienvenue sur SmartPlanning AI, une plateforme de gestion de
            plannings et de personnel. Ces conditions d'utilisation régissent
            votre utilisation de notre site web, de nos applications et de nos
            services (collectivement désignés comme les "Services").
          </Paragraph>
          <Paragraph>
            En utilisant nos Services, vous acceptez d'être lié par ces
            conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas
            utiliser nos Services.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Définitions</SectionTitle>
          <List>
            <ListItem>
              <strong>SmartPlanning AI</strong> : désigne notre plateforme de
              gestion de plannings et de personnel, y compris le site web, les
              applications et tous les services associés.
            </ListItem>
            <ListItem>
              <strong>Utilisateur</strong> : désigne toute personne qui accède à
              nos Services, y compris les administrateurs, les gestionnaires et
              les employés.
            </ListItem>
            <ListItem>
              <strong>Contenu</strong> : désigne toutes les informations,
              données, textes, images, graphiques, vidéos, messages ou autres
              matériels que vous publiez, téléchargez, partagez, stockez ou
              rendez disponible sur nos Services.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. Services Proposés</SectionTitle>
          <Paragraph>
            SmartPlanning AI fournit des outils de gestion de plannings, de
            suivi de temps de travail, de gestion des congés et d'optimisation
            des ressources humaines. Nos Services peuvent inclure :
          </Paragraph>
          <List>
            <ListItem>Création et gestion de plannings</ListItem>
            <ListItem>Gestion des congés et absences</ListItem>
            <ListItem>Analyse de données et rapports</ListItem>
            <ListItem>Systèmes de communication interne</ListItem>
            <ListItem>
              Outils d'optimisation assistés par intelligence artificielle
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>4. Compte Utilisateur</SectionTitle>
          <Paragraph>
            Pour utiliser certaines fonctionnalités de nos Services, vous devez
            créer un compte. Vous êtes responsable de maintenir la
            confidentialité de vos informations d'identification et de toutes
            les activités qui se produisent sous votre compte.
          </Paragraph>
          <Paragraph>
            Vous acceptez de nous fournir des informations précises, actuelles
            et complètes lors de la création de votre compte et de mettre à jour
            ces informations pour les maintenir exactes.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>5. Propriété Intellectuelle</SectionTitle>
          <Paragraph>
            SmartPlanning AI et son contenu, fonctionnalités et fonctionnalités
            sont et resteront la propriété exclusive de SmartPlanning AI et de
            ses concédants de licence. Nos Services sont protégés par le droit
            d'auteur, les marques et autres lois françaises et internationales.
          </Paragraph>
          <Paragraph>
            Vous ne pouvez pas reproduire, distribuer, modifier, créer des
            œuvres dérivées, afficher publiquement, exécuter publiquement,
            republier, télécharger, stocker ou transmettre tout matériel de nos
            Services, sauf si expressément permis par ces conditions.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. Confidentialité des Données</SectionTitle>
          <Paragraph>
            Notre traitement de vos données personnelles est régi par notre{" "}
            <Link to="/privacy" style={{ color: styledTheme.colors.primary }}>
              Politique de Confidentialité
            </Link>
            , qui est incorporée à ces conditions d'utilisation. En utilisant
            nos Services, vous consentez à ces pratiques.
          </Paragraph>
          <Paragraph>
            Conformément au Règlement Général sur la Protection des Données
            (RGPD), nous nous engageons à protéger vos données personnelles et à
            respecter vos droits à la vie privée.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>7. Responsabilités de l'Utilisateur</SectionTitle>
          <Paragraph>En utilisant nos Services, vous acceptez de :</Paragraph>
          <List>
            <ListItem>
              Utiliser nos Services conformément à toutes les lois applicables
            </ListItem>
            <ListItem>
              Ne pas utiliser nos Services d'une manière qui pourrait
              endommager, désactiver, surcharger ou compromettre nos systèmes
            </ListItem>
            <ListItem>
              Ne pas tenter d'accéder sans autorisation à des parties de nos
              Services auxquelles vous n'avez pas droit d'accès
            </ListItem>
            <ListItem>
              Ne pas utiliser nos Services pour transmettre du matériel illégal,
              diffamatoire, harcelant, invasif de la vie privée d'autrui, ou
              autrement répréhensible
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>8. Limitations de Responsabilité</SectionTitle>
          <Paragraph>
            SmartPlanning AI fournit ses Services "tels quels" et "tels que
            disponibles", sans garantie d'aucune sorte. Nous ne garantissons pas
            que nos Services seront ininterrompus, opportuns, sécurisés ou
            exempts d'erreurs.
          </Paragraph>
          <Paragraph>
            En aucun cas, SmartPlanning AI ne sera responsable des dommages
            indirects, accessoires, spéciaux, consécutifs ou punitifs, ou de
            toute perte de profits ou de revenus, résultant de votre utilisation
            de nos Services.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. Modifications des Conditions</SectionTitle>
          <Paragraph>
            Nous nous réservons le droit de modifier ces conditions
            d'utilisation à tout moment. Les modifications entreront en vigueur
            dès leur publication sur nos Services. Votre utilisation continue de
            nos Services après la publication des modifications constitue votre
            acceptation des nouvelles conditions.
          </Paragraph>
          <Paragraph>
            Nous vous informerons des modifications substantielles par email ou
            par une notification sur nos Services.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>10. Résiliation</SectionTitle>
          <Paragraph>
            Nous nous réservons le droit de suspendre ou de résilier votre accès
            à nos Services, à notre seule discrétion, sans préavis, pour des
            violations de ces conditions d'utilisation ou pour toute autre
            raison.
          </Paragraph>
          <Paragraph>
            Vous pouvez résilier votre compte à tout moment en suivant les
            instructions sur nos Services ou en nous contactant directement.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>11. Droit Applicable</SectionTitle>
          <Paragraph>
            Ces conditions d'utilisation sont régies et interprétées
            conformément aux lois françaises, sans égard aux principes de
            conflits de lois.
          </Paragraph>
          <Paragraph>
            Tout litige découlant de ou lié à ces conditions sera soumis à la
            juridiction exclusive des tribunaux français.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>12. Contact</SectionTitle>
          <Paragraph>
            Si vous avez des questions concernant ces conditions d'utilisation,
            veuillez nous contacter à l'adresse suivante :{" "}
            <a
              href="mailto:contact@smartplanning.ai"
              style={{ color: styledTheme.colors.primary }}
            >
              contact@smartplanning.ai
            </a>
          </Paragraph>
        </Section>
      </Content>

      <BackToTopButton
        visible={showBackToTop}
        onClick={scrollToTop}
        aria-label="Retour en haut de page"
      >
        ↑
      </BackToTopButton>

      <Footer>
        <FooterLinks>
          <FooterLink to="/terms">Conditions d'utilisation</FooterLink>
          <FooterLink to="/privacy">Politique de confidentialité</FooterLink>
          <FooterLink to="/">Accueil</FooterLink>
        </FooterLinks>
        <Copyright>
          © {new Date().getFullYear()} SmartPlanning AI. Tous droits réservés.
        </Copyright>
      </Footer>
    </PageContainer>
  );
};

export default TermsOfService;
