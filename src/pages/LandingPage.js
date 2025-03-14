import Lottie from "lottie-react";
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import planningAnimation from "../assets/animations/planning-animation.json";
import { useTheme } from "../components/ThemeProvider";
import Button from "../components/ui/Button";
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

const slideInLeft = keyframes`
  from {
    transform: translateX(-50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const slideInRight = keyframes`
  from {
    transform: translateX(50px);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

const float = keyframes`
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

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
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
  overflow-x: hidden;
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
  animation: ${float} 3s ease-in-out infinite;
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
`;

const HeroContent = styled.div`
  flex: 1;
  animation: ${slideInLeft} 0.7s ease-in-out;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 2;
    margin-top: 2rem;
    animation: ${slideUp} 0.7s ease-in-out;
  }
`;

const HeroTitle = styled.h1`
  font-size: 4rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
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
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
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
`;

const HeroSubtitle = styled.p`
  font-size: 1.3rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
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
  max-width: 550px;
  animation: ${slideInRight} 1s ease-in-out, ${float} 6s ease-in-out infinite;
  position: relative;
  z-index: 2;

  @media (max-width: 992px) {
    order: 1;
    max-width: 400px;
    animation: ${fadeIn} 1s ease-in-out, ${float} 6s ease-in-out infinite;
  }
`;

const BackgroundDecoration = styled.div`
  position: absolute;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: linear-gradient(
    45deg,
    ${({ theme }) => theme.colors.primary}20,
    ${({ theme }) => theme.colors.secondary}20
  );
  filter: blur(60px);
  z-index: 1;
  animation: ${pulse} 10s ease-in-out infinite;

  &.top-right {
    top: -100px;
    right: -100px;
  }

  &.bottom-left {
    bottom: -100px;
    left: -100px;
    animation-delay: 2s;
  }
`;

const FeaturesSection = styled.section`
  padding: 6rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const SectionSubtitle = styled.p`
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 4rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
`;

const FeatureCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &:hover {
    transform: translateY(-10px);
    box-shadow: ${({ theme }) => theme.shadows.large};
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
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
  }
`;

const FeatureIcon = styled.div`
  font-size: 3rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  animation: ${float} 3s ease-in-out infinite;
  display: inline-block;
`;

const FeatureTitle = styled.h3`
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FeatureDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.7;
  font-size: 1.05rem;
`;

const DemoSection = styled.section`
  padding: 6rem 2rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  text-align: center;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const DemoContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
`;

const DemoVideoContainer = styled.div`
  margin-top: 3rem;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.large};
  position: relative;
  aspect-ratio: 16/9;
  background-color: ${({ theme }) => theme.colors.surface};
  animation: ${pulse} 4s ease-in-out infinite;

  &::before {
    content: "Vidéo de démonstration";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: ${({ theme }) => theme.colors.text.secondary};
    z-index: 1;
  }

  &::after {
    content: "▶";
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    color: ${({ theme }) => theme.colors.primary};
    background-color: ${({ theme }) => theme.colors.surface}CC;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: ${({ theme }) => theme.shadows.medium};
    cursor: pointer;
    transition: transform 0.3s ease;
    z-index: 2;
  }

  &:hover::after {
    transform: translate(-50%, -50%) scale(1.1);
  }
`;

const BenefitsSection = styled.section`
  padding: 6rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const BenefitItem = styled.div`
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
`;

const BenefitIcon = styled.div`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  background-color: ${({ theme }) => theme.colors.surface};
  width: 80px;
  height: 80px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  flex-shrink: 0;
`;

const BenefitContent = styled.div`
  flex: 1;
`;

const BenefitTitle = styled.h3`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const BenefitDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.7;
  font-size: 1.1rem;
`;

const CTASection = styled.section`
  padding: 5rem 2rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary},
    ${({ theme }) => theme.colors.secondary}
  );
  text-align: center;
  color: white;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 3rem 1rem;
  }
`;

const CTATitle = styled.h2`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;

  @media (max-width: 768px) {
    font-size: 2.2rem;
  }
`;

const CTADescription = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  max-width: 700px;
  margin-left: auto;
  margin-right: auto;
`;

const CTAButton = styled(Button)`
  background-color: white;
  color: ${({ theme }) => theme.colors.primary};
  font-size: 1.1rem;
  padding: 0.8rem 2rem;
  border-radius: 50px;
  font-weight: 600;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  }
`;

const CircleDecoration = styled.div`
  position: absolute;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.1);

  &.small {
    width: 100px;
    height: 100px;
    top: 20%;
    left: 10%;
    animation: ${float} 6s ease-in-out infinite;
  }

  &.medium {
    width: 150px;
    height: 150px;
    bottom: 30%;
    right: 10%;
    animation: ${float} 8s ease-in-out infinite;
  }

  &.large {
    width: 200px;
    height: 200px;
    bottom: -50px;
    left: 30%;
    animation: ${float} 10s ease-in-out infinite;
  }
`;

const Footer = styled.footer`
  background-color: ${({ theme }) => theme.colors.surface};
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
  color: ${({ theme }) => theme.colors.text.secondary};
  text-decoration: none;
  transition: color 0.3s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const Copyright = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.9rem;
`;

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [visibleBenefits, setVisibleBenefits] = useState([]);
  const benefitsRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const benefits = Array.from(entry.target.children);
            benefits.forEach((benefit, index) => {
              setTimeout(() => {
                setVisibleBenefits((prev) => [...prev, index]);
              }, index * 200);
            });
          }
        });
      },
      { threshold: 0.1 }
    );

    if (benefitsRef.current) {
      observer.observe(benefitsRef.current);
    }

    return () => {
      if (benefitsRef.current) {
        observer.unobserve(benefitsRef.current);
      }
    };
  }, []);

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
        <BackgroundDecoration className="top-right" />
        <BackgroundDecoration className="bottom-left" />

        <HeroContent>
          <HeroTitle>
            Oubliez Excel pour un vrai outil de planification
          </HeroTitle>
          <HeroSubtitle>
            Des plannings intelligents qui s'adaptent à votre activité pour
            optimiser votre masse salariale. Gérez-les où que vous soyez, avec
            une interface intuitive et des fonctionnalités avancées.
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
        <SectionTitle>Une gestion de planning simplifiée</SectionTitle>
        <SectionSubtitle>
          Notre solution vous offre tous les outils nécessaires pour une
          planification efficace et sans stress
        </SectionSubtitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🧠</FeatureIcon>
            <FeatureTitle>Planification intelligente</FeatureTitle>
            <FeatureDescription>
              Notre IA analyse vos besoins et crée automatiquement des plannings
              optimisés en fonction de votre activité et de vos ressources.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>Optimisation des coûts</FeatureTitle>
            <FeatureDescription>
              Réduisez votre masse salariale grâce à une meilleure allocation
              des ressources et une planification précise adaptée à votre charge
              de travail.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>Accessibilité totale</FeatureTitle>
            <FeatureDescription>
              Gérez vos plannings où que vous soyez, sur tous vos appareils. Une
              interface responsive pour rester connecté en permanence.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📄</FeatureIcon>
            <FeatureTitle>PDF automatiques</FeatureTitle>
            <FeatureDescription>
              Générez des PDF prêts à l'impression en un clic pour afficher les
              plannings ou les distribuer à vos équipes.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>Validation sécurisée</FeatureTitle>
            <FeatureDescription>
              Système de validation et verrouillage des heures par les managers
              pour garantir l'intégrité des données.
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>Analyses détaillées</FeatureTitle>
            <FeatureDescription>
              Visualisez des statistiques précises sur l'utilisation du temps et
              l'efficacité de vos équipes pour prendre de meilleures décisions.
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <DemoSection>
        <DemoContainer>
          <SectionTitle>Découvrez SmartPlanning en action</SectionTitle>
          <SectionSubtitle>
            Regardez notre vidéo de démonstration pour voir comment notre
            solution peut transformer votre gestion de planning
          </SectionSubtitle>
          <DemoVideoContainer />
        </DemoContainer>
      </DemoSection>

      <BenefitsSection>
        <SectionTitle>Plus d'efficacité pour votre entreprise</SectionTitle>
        <SectionSubtitle>
          SmartPlanning AI vous apporte des avantages concrets et mesurables
        </SectionSubtitle>

        <div ref={benefitsRef} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <BenefitItem className={visibleBenefits.includes(0) ? "visible" : ""}>
            <BenefitIcon>⏱️</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Gain de temps considérable</BenefitTitle>
              <BenefitDescription>
                Réduisez jusqu'à 70% le temps consacré à la création et gestion
                des plannings grâce à l'automatisation intelligente.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(1) ? "visible" : ""}>
            <BenefitIcon>💼</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Optimisation de la masse salariale</BenefitTitle>
              <BenefitDescription>
                Adaptez précisément vos ressources humaines à votre activité
                réelle et évitez les sureffectifs ou sous-effectifs coûteux.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(2) ? "visible" : ""}>
            <BenefitIcon>🔄</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Flexibilité maximale</BenefitTitle>
              <BenefitDescription>
                Modifiez vos plannings en temps réel et informez instantanément
                vos équipes des changements via notre système de notifications.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(3) ? "visible" : ""}>
            <BenefitIcon>📊</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>Données exploitables</BenefitTitle>
              <BenefitDescription>
                Accédez à des rapports détaillés et des analyses qui vous aident
                à prendre des décisions stratégiques basées sur des données
                concrètes.
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
        </div>
      </BenefitsSection>

      <CTASection>
        <CircleDecoration className="small" />
        <CircleDecoration className="medium" />
        <CircleDecoration className="large" />

        <CTATitle>Prêt à révolutionner votre gestion de planning ?</CTATitle>
        <CTADescription>
          Rejoignez des milliers d'entreprises qui ont déjà optimisé leur
          planification grâce à SmartPlanning AI
        </CTADescription>
        <Link to="/register">
          <CTAButton size="large">Commencer gratuitement</CTAButton>
        </Link>
      </CTASection>

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
