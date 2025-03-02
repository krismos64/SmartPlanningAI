import styled, { keyframes } from "styled-components";
import { Link } from "react-router-dom";
import Lottie from "lottie-react";
import { useTheme } from "../components/ThemeProvider";
import Button from "../components/ui/Button";
import { ThemeSwitch } from "../components/ui/ThemeSwitch";
import planningAnimation from "../assets/animations/planning-animation.json";

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

// Styled Components
const LandingContainer = styled.div`
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

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    padding: ${({ theme }) => theme.spacing.md};
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
  }
`;

const Logo = styled.div`
  font-size: ${({ theme }) => theme.typography.sizes["2xl"]};
  font-weight: ${({ theme }) => theme.typography.fontWeights.bold};
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`;

const LogoAnimation = styled.div`
  width: 40px;
  height: 40px;
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: center;
    gap: 1rem;
  }
`;

const HeroSection = styled.section`
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
`;

const HeroContent = styled.div`
  flex: 1;
  animation: ${slideUp} 0.7s ease-in-out;

  @media (max-width: 992px) {
    order: 2;
    margin-top: 2rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.primary};
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.textSecondary};
  max-width: 600px;

  @media (max-width: 992px) {
    margin-left: auto;
    margin-right: auto;
  }
`;

const CTAButtons = styled.div`
  display: flex;
  gap: 1rem;

  @media (max-width: 992px) {
    justify-content: center;
  }

  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const AnimationContainer = styled.div`
  flex: 1;
  max-width: 500px;
  animation: ${fadeIn} 1s ease-in-out;

  @media (max-width: 992px) {
    order: 1;
    max-width: 400px;
  }
`;

const FeaturesSection = styled.section`
  padding: 4rem 2rem;
  background-color: ${({ theme }) => theme.backgroundAlt};

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 3rem;
  color: ${({ theme }) => theme.primary};

  @media (max-width: 768px) {
    font-size: 2rem;
    margin-bottom: 2rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.cardBackground};
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  }
`;

const FeatureIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.primary};
  margin-bottom: 1.5rem;
`;

const FeatureTitle = styled.h3`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.text};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  line-height: 1.6;
`;

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.cardBackground};
  padding: 2rem;
  text-align: center;
  margin-top: auto;
`;

const FooterLinks = styled.div`
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;

  @media (max-width: 576px) {
    flex-direction: column;
    gap: 0.5rem;
  }
`;

const FooterLink = styled.a`
  color: ${({ theme }) => theme.textSecondary};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.primary};
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.textSecondary};
  font-size: 0.9rem;
`;

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <LandingContainer>
      <Header>
        <Logo>
          <LogoAnimation>
            <Lottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          SmartPlanning AI
        </Logo>
        <Nav>
          <ThemeSwitch onChange={toggleTheme} checked={isDarkMode} />
          <Link to="/login">
            <Button variant="ghost">Se connecter</Button>
          </Link>
          <Link to="/register">
            <Button>S'inscrire</Button>
          </Link>
        </Nav>
      </Header>

      <HeroSection>
        <HeroContent>
          <HeroTitle>Planifiez intelligemment avec l'IA</HeroTitle>
          <HeroSubtitle>
            Optimisez la gestion de vos plannings d'entreprise grâce à notre
            solution alimentée par l'intelligence artificielle. Gagnez du temps,
            réduisez les erreurs et améliorez la productivité.
          </HeroSubtitle>
          <CTAButtons>
            <Link to="/register">
              <Button size="large">Commencer gratuitement</Button>
            </Link>
            <Link to="/login">
              <Button variant="outlined" size="large">
                Voir une démo
              </Button>
            </Link>
          </CTAButtons>
        </HeroContent>
        <AnimationContainer>
          <Lottie animationData={planningAnimation} loop={true} />
        </AnimationContainer>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>Pourquoi choisir SmartPlanning AI ?</SectionTitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🔄</FeatureIcon>
            <FeatureTitle>Automatisation intelligente</FeatureTitle>
            <FeatureDescription>
              Notre IA analyse vos besoins et automatise la création de
              plannings optimisés pour votre entreprise.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Analyses détaillées</FeatureTitle>
            <FeatureDescription>
              Obtenez des insights précieux sur l'utilisation du temps et
              l'efficacité de vos équipes.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔔</FeatureIcon>
            <FeatureTitle>Notifications en temps réel</FeatureTitle>
            <FeatureDescription>
              Restez informé des changements de planning et des événements
              importants grâce à nos alertes personnalisables.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Sécurité renforcée</FeatureTitle>
            <FeatureDescription>
              Vos données sont protégées par des protocoles de sécurité avancés
              et conformes aux réglementations.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <Footer>
        <FooterLinks>
          <FooterLink href="#">Conditions d'utilisation</FooterLink>
          <FooterLink href="#">Politique de confidentialité</FooterLink>
          <FooterLink href="#">Contact</FooterLink>
        </FooterLinks>
        <Copyright>
          © {new Date().getFullYear()} SmartPlanning AI. Tous droits réservés.
        </Copyright>
      </Footer>
    </LandingContainer>
  );
};

export default LandingPage;
