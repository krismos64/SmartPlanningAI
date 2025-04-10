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

const shimmer = keyframes`
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
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
  margin-top: -64px; /* Compenser la hauteur de la navbar */
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
  margin-top: 64px; /* Ajouter un margin pour compenser le margin-top négatif du container */

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

const Nav = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const ThemeSwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};
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
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.info},
      ${({ theme }) => theme.colors.secondary}
    );
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite linear;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.small};
`;

const TableHead = styled.thead`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background-color: ${({ theme }) =>
      theme.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.02)"};
  }

  &:hover {
    background-color: ${({ theme }) =>
      theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"};
  }
`;

const TableHeader = styled.th`
  padding: ${({ theme }) => theme.spacing.md};
  text-align: left;
`;

const TableCell = styled.td`
  padding: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid
    ${({ theme }) =>
      theme.isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"};
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

const PrivacyPolicy = () => {
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
          <span>📅</span> SmartPlanning
        </Logo>
        <Nav>
          <NavItem to="/">Accueil</NavItem>
          <NavItem to="/login">Connexion</NavItem>
          <ThemeSwitchWrapper>
            <ThemeSwitch onChange={toggleTheme} checked={isDarkMode} />
          </ThemeSwitchWrapper>
        </Nav>
      </Header>

      <Content ref={contentRef}>
        <PageTitle>Politique de Confidentialité</PageTitle>
        <Paragraph>
          <strong>Dernière mise à jour :</strong> {lastUpdate}
        </Paragraph>

        <Section>
          <SectionTitle>1. Introduction</SectionTitle>
          <Paragraph>
            Chez SmartPlanning, nous accordons une importance particulière à la
            protection de vos données personnelles. Cette politique de
            confidentialité vous informe de la manière dont nous collectons,
            utilisons, partageons et protégeons vos données personnelles lorsque
            vous utilisez notre plateforme de gestion de plannings et de
            personnel.
          </Paragraph>
          <Paragraph>
            Cette politique est conforme au Règlement Général sur la Protection
            des Données (RGPD) et à toutes les lois locales applicables en
            matière de protection des données.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>2. Données Que Nous Collectons</SectionTitle>
          <Paragraph>
            Selon votre utilisation de nos services, nous pouvons collecter les
            catégories de données suivantes :
          </Paragraph>
          <List>
            <ListItem>
              <strong>Données d'identification</strong> : nom, prénom, adresse
              e-mail, numéro de téléphone.
            </ListItem>
            <ListItem>
              <strong>Données professionnelles</strong> : poste, département,
              horaires de travail, préférences d'horaires, historique des
              plannings.
            </ListItem>
            <ListItem>
              <strong>Données d'utilisation</strong> : informations sur la façon
              dont vous utilisez notre plateforme, vos interactions avec les
              fonctionnalités.
            </ListItem>
            <ListItem>
              <strong>Données techniques</strong> : adresse IP, type de
              navigateur, informations sur l'appareil utilisé.
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>3. Comment Nous Utilisons Vos Données</SectionTitle>
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Finalité</TableHeader>
                <TableHeader>Base juridique</TableHeader>
                <TableHeader>Durée de conservation</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              <TableRow>
                <TableCell>
                  Création et gestion de votre compte utilisateur
                </TableCell>
                <TableCell>Exécution du contrat</TableCell>
                <TableCell>Durée du contrat + 3 ans</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Gestion des plannings et des ressources humaines
                </TableCell>
                <TableCell>Exécution du contrat / Intérêt légitime</TableCell>
                <TableCell>Durée du contrat + 5 ans</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Amélioration de nos services et analyses statistiques
                </TableCell>
                <TableCell>Intérêt légitime</TableCell>
                <TableCell>3 ans</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Communication par email concernant nos services
                </TableCell>
                <TableCell>Consentement / Intérêt légitime</TableCell>
                <TableCell>Jusqu'au retrait du consentement</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  Respect des obligations légales (comptabilité, fiscalité...)
                </TableCell>
                <TableCell>Obligation légale</TableCell>
                <TableCell>Selon les exigences légales (5 à 10 ans)</TableCell>
              </TableRow>
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>4. Partage des Données</SectionTitle>
          <Paragraph>
            Nous pouvons partager vos données personnelles dans les situations
            suivantes :
          </Paragraph>
          <List>
            <ListItem>
              <strong>
                Avec les autres utilisateurs de votre organisation
              </strong>{" "}
              : les utilisateurs ayant les droits d'administration ou de gestion
              peuvent accéder à certaines de vos données professionnelles afin
              de gérer les plannings.
            </ListItem>
            <ListItem>
              <strong>Avec nos prestataires de services</strong> : nous
              travaillons avec des prestataires qui nous fournissent des
              services informatiques, d'analyse ou commerciaux et qui peuvent
              avoir besoin d'accéder à certaines de vos données.
            </ListItem>
            <ListItem>
              <strong>En cas d'obligation légale</strong> : nous pouvons
              divulguer vos données si nous sommes tenus de le faire par la loi
              ou en réponse à des demandes légitimes des autorités publiques.
            </ListItem>
          </List>
          <Paragraph>
            Nous n'effectuons aucun transfert de données en dehors de l'Union
            Européenne, sauf vers des pays bénéficiant d'une décision
            d'adéquation ou avec des garanties appropriées conformément au RGPD.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>5. Vos Droits</SectionTitle>
          <Paragraph>
            Conformément au RGPD, vous disposez des droits suivants concernant
            vos données personnelles :
          </Paragraph>
          <List>
            <ListItem>
              <strong>Droit d'accès</strong> : vous pouvez demander une copie de
              vos données personnelles que nous détenons.
            </ListItem>
            <ListItem>
              <strong>Droit de rectification</strong> : vous pouvez demander la
              correction de vos données inexactes ou incomplètes.
            </ListItem>
            <ListItem>
              <strong>Droit à l'effacement</strong> : vous pouvez demander la
              suppression de vos données dans certaines circonstances.
            </ListItem>
            <ListItem>
              <strong>Droit à la limitation du traitement</strong> : vous pouvez
              demander la restriction du traitement de vos données.
            </ListItem>
            <ListItem>
              <strong>Droit à la portabilité</strong> : vous pouvez demander le
              transfert de vos données à un autre organisme.
            </ListItem>
            <ListItem>
              <strong>Droit d'opposition</strong> : vous pouvez vous opposer au
              traitement de vos données basé sur notre intérêt légitime.
            </ListItem>
            <ListItem>
              <strong>Droit de retirer votre consentement</strong> : vous pouvez
              retirer votre consentement à tout moment pour les traitements
              basés sur cette base légale.
            </ListItem>
          </List>
          <Paragraph>
            Pour exercer ces droits, veuillez nous contacter à{" "}
            <a
              href="mailto:contact@smartplanning.fr"
              style={{ color: styledTheme.colors.primary }}
            >
              contact@smartplanning.fr
            </a>
            . Nous répondrons à votre demande dans un délai d'un mois, qui peut
            être prolongé de deux mois si nécessaire.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>6. Sécurité des Données</SectionTitle>
          <Paragraph>
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour protéger vos données personnelles contre la perte,
            l'accès non autorisé, la divulgation, l'altération et la
            destruction, notamment :
          </Paragraph>
          <List>
            <ListItem>Chiffrement des données sensibles</ListItem>
            <ListItem>Contrôles d'accès stricts</ListItem>
            <ListItem>Pare-feu et systèmes de détection d'intrusion</ListItem>
            <ListItem>Sauvegardes régulières</ListItem>
            <ListItem>
              Formation de notre personnel à la sécurité des données
            </ListItem>
          </List>
        </Section>

        <Section>
          <SectionTitle>7. Cookies et Technologies Similaires</SectionTitle>
          <Paragraph>
            Nous utilisons des cookies et des technologies similaires pour
            améliorer votre expérience sur notre plateforme, analyser
            l'utilisation de nos services et personnaliser le contenu.
          </Paragraph>
          <Paragraph>
            Vous pouvez gérer vos préférences concernant les cookies à tout
            moment en modifiant les paramètres de votre navigateur ou en
            utilisant notre outil de gestion des cookies disponible sur notre
            plateforme.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>
            8. Modifications de la Politique de Confidentialité
          </SectionTitle>
          <Paragraph>
            Nous pouvons mettre à jour cette politique de confidentialité de
            temps à autre pour refléter des changements dans nos pratiques ou
            pour d'autres raisons opérationnelles, légales ou réglementaires.
          </Paragraph>
          <Paragraph>
            En cas de modifications substantielles, nous vous en informerons par
            email ou par une notification sur notre plateforme avant que les
            modifications ne prennent effet.
          </Paragraph>
        </Section>

        <Section>
          <SectionTitle>9. Contact</SectionTitle>
          <Paragraph>
            Si vous avez des questions ou des préoccupations concernant cette
            politique de confidentialité ou le traitement de vos données
            personnelles, veuillez nous contacter :
          </Paragraph>
          <Paragraph>
            <strong>Responsable de la protection des données :</strong>{" "}
            <a
              href="mailto:contact@smartplanning.fr"
              style={{ color: styledTheme.colors.primary }}
            >
              contact@smartplanning.fr
            </a>
          </Paragraph>
          <Paragraph>
            <strong>Adresse postale :</strong> SmartPlanning, 123 Avenue de la
            Tech, 75001 Paris, France
          </Paragraph>
          <Paragraph>
            Vous avez également le droit d'introduire une réclamation auprès de
            la Commission Nationale de l'Informatique et des Libertés (CNIL) si
            vous estimez que le traitement de vos données personnelles n'est pas
            conforme aux réglementations en vigueur.
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
    </PageContainer>
  );
};

export default PrivacyPolicy;
