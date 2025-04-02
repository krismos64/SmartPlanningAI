import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import planningAnimation from "../assets/animations/planning-animation.json";
import { useTheme } from "../components/ThemeProvider";
import Button from "../components/ui/Button";
import EnhancedLottie from "../components/ui/EnhancedLottie";
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
  margin-top: -64px;
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
  margin-top: 64px;

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

const ThemeSwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
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

  iframe {
    width: 100%;
    height: 100%;
    border: none;
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
    color: white !important;
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

const FeatureImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: scale(1.05);
    box-shadow: ${({ theme }) => theme.shadows.large};
  }
`;

const HeroBrandImage = styled.img`
  max-width: 200px;
  height: auto;
  margin-bottom: 2rem;
  animation: ${float} 6s ease-in-out infinite;

  @media (max-width: 992px) {
    margin: 0 auto 2rem;
  }
`;

const TestimonialImage = styled.img`
  max-width: 100%;
  height: auto;
  border-radius: 12px;
  margin: 3rem 0;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const BetaSection = styled.section`
  padding: 4rem 2rem;
  background: linear-gradient(
    135deg,
    ${({ theme }) => theme.colors.primary}15,
    ${({ theme }) => theme.colors.secondary}15
  );
  text-align: center;
  animation: ${fadeIn} 0.8s ease-in-out;
`;

const BetaContent = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const BetaTitle = styled.h2`
  font-size: 2.5rem;
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
`;

const BetaDescription = styled.p`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const BetaFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin: 2rem 0;
`;

const BetaFeature = styled.div`
  padding: 1.5rem;
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 10px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: transform 0.3s ease;

  &:hover {
    transform: translateY(-5px);
  }
`;

const BetaFeatureIcon = styled.div`
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const BetaFeatureText = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FAQSection = styled.section`
  padding: 6rem 2rem;
  background-color: ${({ theme }) => theme.colors.background};
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 4rem 1rem;
  }
`;

const FAQContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FAQCard = styled(motion.div)`
  background: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 4px;
    background: linear-gradient(
      90deg,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.large};

    &::before {
      opacity: 1;
    }
  }
`;

const FAQQuestion = styled.h3`
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.primary};
  display: flex;
  align-items: flex-start;
  gap: 1rem;

  svg {
    color: ${({ theme }) => theme.colors.secondary};
    font-size: 1.5rem;
    flex-shrink: 0;
  }
`;

const FAQAnswer = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  line-height: 1.6;
  margin-left: 2.5rem;
`;

const LandingPage = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [visibleBenefits, setVisibleBenefits] = useState([]);
  const benefitsRef = useRef(null);
  const demoRef = useRef(null);
  const { t } = useTranslation();
  const sectionRef = useRef(null);

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

    const currentBenefitsRef = benefitsRef.current;

    if (currentBenefitsRef) {
      observer.observe(currentBenefitsRef);
    }

    return () => {
      if (currentBenefitsRef) {
        observer.unobserve(currentBenefitsRef);
      }
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    const currentSectionRef = sectionRef.current;

    if (currentSectionRef) {
      observer.observe(currentSectionRef);
    }

    return () => {
      if (currentSectionRef) {
        observer.disconnect();
      }
    };
  }, []);

  const scrollToDemo = () => {
    demoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Données structurées JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SmartPlanning",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
    },
    description:
      "Optimisez la gestion de vos plannings avec SmartPlanning. Version bêta gratuite, intuitive et assistée par IA.",
    featureList: [
      "Planification intelligente",
      "Gestion des employés",
      "Optimisation des plannings",
      "Interface intuitive",
    ],
    url: "https://smartplanning.fr",
    author: {
      "@type": "Organization",
      name: "SmartPlanning",
      url: "https://smartplanning.fr",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "127",
    },
    availableOnDevice: ["Desktop", "Mobile", "Tablet"],
    screenshot: "https://smartplanning.fr/images/business-smartplanning.png",
  };

  // Données structurées pour organisation
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SmartPlanning",
    url: "https://smartplanning.fr",
    logo: "https://smartplanning.fr/images/logo-smartplanning.png",
    description:
      "SmartPlanning offre une solution de planification intelligente pour les entreprises de toutes tailles.",
  };

  // Données structurées pour FAQ
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Qu'est-ce que SmartPlanning ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SmartPlanning est une solution de planification intelligente pour entreprises, qui utilise l'intelligence artificielle pour optimiser vos plannings d'employés. Notre plateforme est disponible sur smartplanning.fr et propose une version bêta gratuite.",
        },
      },
      {
        "@type": "Question",
        name: "Comment fonctionne l'optimisation des plannings avec l'IA ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Notre algorithme d'IA analyse les contraintes de votre entreprise (disponibilités des employés, compétences requises, règles de travail) pour générer automatiquement des plannings optimisés qui maximisent l'efficacité tout en respectant les préférences de chacun.",
        },
      },
      {
        "@type": "Question",
        name: "SmartPlanning est-il vraiment gratuit ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Oui, SmartPlanning est actuellement disponible gratuitement pendant sa phase bêta. Après le lancement officiel, nous proposerons différentes formules tarifaires, mais les utilisateurs de la bêta bénéficieront d'un mois gratuit supplémentaire.",
        },
      },
      {
        "@type": "Question",
        name: "Quels types d'entreprises peuvent utiliser SmartPlanning ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SmartPlanning s'adapte à tous types d'entreprises : restaurants, commerces, hôpitaux, cliniques, usines, centres d'appels, etc. Notre solution est particulièrement efficace pour les entreprises avec des horaires variables ou complexes.",
        },
      },
      {
        "@type": "Question",
        name: "Comment puis-je accéder à SmartPlanning ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SmartPlanning est accessible directement depuis votre navigateur sur smartplanning.fr. Il suffit de créer un compte gratuit pour commencer à utiliser toutes les fonctionnalités. Notre application est responsive et fonctionne sur ordinateurs, tablettes et smartphones.",
        },
      },
      {
        "@type": "Question",
        name: "Mes données sont-elles sécurisées avec SmartPlanning ?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Absolument. La sécurité est notre priorité. Toutes les données sont cryptées et nous respectons strictement le RGPD. Nous n'utilisons jamais vos données à des fins commerciales et vous restez propriétaire de toutes vos informations.",
        },
      },
    ],
  };

  return (
    <LandingContainer>
      <Helmet>
        <title>
          SmartPlanning - Logiciel de planification intelligent et gratuit pour
          les entreprises
        </title>
        <meta
          name="description"
          content="SmartPlanning.fr - Optimisez la gestion de vos plannings d'entreprise avec notre solution intelligente assistée par IA. Version bêta gratuite, intuitive et efficace. Essayez-la dès maintenant !"
        />
        <meta
          name="keywords"
          content="planification, planning, IA, intelligence artificielle, gestion d'entreprise, optimisation, bêta gratuite, smartplanning.fr, logiciel planning, planning entreprise, planning employés"
        />
        <meta
          property="og:title"
          content="SmartPlanning - Logiciel de planification intelligent et gratuit"
        />
        <meta
          property="og:description"
          content="SmartPlanning.fr - Optimisez la gestion de vos plannings d'entreprise avec notre solution intelligente assistée par IA. Version bêta gratuite, intuitive et efficace."
        />
        <meta property="og:url" content="https://smartplanning.fr" />
        <meta property="og:type" content="website" />
        <meta
          property="og:image"
          content="https://smartplanning.fr/images/business-smartplanning.png"
        />
        <meta property="og:site_name" content="SmartPlanning" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          content="SmartPlanning - Logiciel de planification intelligent"
        />
        <meta
          name="twitter:description"
          content="Solution de planification intelligente pour entreprises. Essayez gratuitement sur smartplanning.fr"
        />
        <meta
          name="twitter:image"
          content="https://smartplanning.fr/images/business-smartplanning.png"
        />
        <link rel="canonical" href="https://smartplanning.fr" />
        <meta name="author" content="SmartPlanning" />
        <meta name="robots" content="index, follow" />
        <meta
          name="google-site-verification"
          content="votre-code-de-verification"
        />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">
          {JSON.stringify(organizationLd)}
        </script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <Header>
        <Logo>
          <LogoAnimation>
            <EnhancedLottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          SmartPlanning
        </Logo>
        <Nav>
          <ThemeSwitchWrapper>
            <ThemeSwitch onChange={toggleTheme} checked={isDarkMode} />
          </ThemeSwitchWrapper>
          <Link to="/login">
            <Button variant="ghost">{t("auth.login")}</Button>
          </Link>
          <Link to="/register">
            <Button>{t("auth.register")}</Button>
          </Link>
        </Nav>
      </Header>

      <HeroSection>
        <BackgroundDecoration className="top-right" />
        <BackgroundDecoration className="bottom-left" />

        <HeroContent>
          <HeroBrandImage
            src="/images/logo-smartplanning.png"
            alt="SmartPlanningAI - Logiciel de planification intelligente pour entreprises"
          />
          <HeroTitle>{t("landingPage.hero.title")}</HeroTitle>
          <HeroSubtitle>{t("landingPage.hero.subtitle")}</HeroSubtitle>
          <CTAButtons>
            <Link to="/register">
              <Button size="large">{t("landingPage.hero.cta.start")}</Button>
            </Link>
            <Button
              variant="outlined"
              size="large"
              onClick={() => {
                const demoSection = document.getElementById("demo-section");
                demoSection?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {t("landingPage.hero.cta.demo")}
            </Button>
          </CTAButtons>
        </HeroContent>
        <AnimationContainer>
          <EnhancedLottie
            animationData={planningAnimation}
            loop={true}
            alt="Animation de planification intelligente avec SmartPlanningAI"
          />
        </AnimationContainer>
      </HeroSection>

      <FeaturesSection>
        <SectionTitle>{t("landingPage.features.title")}</SectionTitle>
        <SectionSubtitle>{t("landingPage.features.subtitle")}</SectionSubtitle>
        <FeaturesGrid>
          <FeatureCard>
            <FeatureIcon>🧠</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.ai.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.ai.description")}
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>💰</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.cost.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.cost.description")}
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📱</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.mobile.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.mobile.description")}
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📄</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.pdf.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.pdf.description")}
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>🔒</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.security.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.security.description")}
            </FeatureDescription>
          </FeatureCard>

          <FeatureCard>
            <FeatureIcon>📊</FeatureIcon>
            <FeatureTitle>
              {t("landingPage.features.items.analytics.title")}
            </FeatureTitle>
            <FeatureDescription>
              {t("landingPage.features.items.analytics.description")}
            </FeatureDescription>
          </FeatureCard>
        </FeaturesGrid>
      </FeaturesSection>

      <DemoSection ref={demoRef} id="demo-section">
        <DemoContainer>
          <SectionTitle>{t("landingPage.demo.title")}</SectionTitle>
          <SectionSubtitle>{t("landingPage.demo.subtitle")}</SectionSubtitle>
          <FeatureImage
            src="/images/business-smartplanning.png"
            alt="SmartPlanning en action - Interface de planification pour entreprises sur smartplanning.fr"
          />
          <DemoVideoContainer>
            <iframe
              src="https://www.youtube.com/watch?v=W4UWkI4S2Qg&ab_channel=krismosDev"
              title="SmartPlanning - Démonstration du logiciel de planification intelligent sur smartplanning.fr"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </DemoVideoContainer>
        </DemoContainer>
      </DemoSection>

      <BenefitsSection>
        <SectionTitle>{t("landingPage.benefits.title")}</SectionTitle>
        <SectionSubtitle>{t("landingPage.benefits.subtitle")}</SectionSubtitle>

        <div
          style={{ maxWidth: "900px", margin: "0 auto", textAlign: "center" }}
        >
          <TestimonialImage
            src="/images/comic-smartplanning.png"
            alt="Témoignages clients SmartPlanning - Bénéfices de la planification intelligente sur smartplanning.fr"
          />
        </div>

        <div ref={benefitsRef} style={{ maxWidth: "900px", margin: "0 auto" }}>
          <BenefitItem className={visibleBenefits.includes(0) ? "visible" : ""}>
            <BenefitIcon>⏱️</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>
                {t("landingPage.benefits.items.time.title")}
              </BenefitTitle>
              <BenefitDescription>
                {t("landingPage.benefits.items.time.description")}
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(1) ? "visible" : ""}>
            <BenefitIcon>💼</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>
                {t("landingPage.benefits.items.cost.title")}
              </BenefitTitle>
              <BenefitDescription>
                {t("landingPage.benefits.items.cost.description")}
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(2) ? "visible" : ""}>
            <BenefitIcon>🔄</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>
                {t("landingPage.benefits.items.flexibility.title")}
              </BenefitTitle>
              <BenefitDescription>
                {t("landingPage.benefits.items.flexibility.description")}
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>

          <BenefitItem className={visibleBenefits.includes(3) ? "visible" : ""}>
            <BenefitIcon>📊</BenefitIcon>
            <BenefitContent>
              <BenefitTitle>
                {t("landingPage.benefits.items.data.title")}
              </BenefitTitle>
              <BenefitDescription>
                {t("landingPage.benefits.items.data.description")}
              </BenefitDescription>
            </BenefitContent>
          </BenefitItem>
        </div>
      </BenefitsSection>

      {/* Nouvelle section Bêta à la bonne position après les bénéfices */}
      <BetaSection ref={sectionRef}>
        <BetaContent>
          <BetaTitle>🎉 SmartPlanning est en bêta gratuite ! 🎁</BetaTitle>
          <BetaDescription>
            Profitez de notre version bêta gratuite et contribuez à
            l'amélioration de SmartPlanning !
          </BetaDescription>
          <BetaFeatures>
            <BetaFeature>
              <BetaFeatureIcon>🎁</BetaFeatureIcon>
              <BetaFeatureText>
                Accès complet gratuit pendant la phase bêta
              </BetaFeatureText>
            </BetaFeature>
            <BetaFeature>
              <BetaFeatureIcon>💡</BetaFeatureIcon>
              <BetaFeatureText>
                1 mois gratuit à partir du lancement du plan tarifaire
              </BetaFeatureText>
            </BetaFeature>
            <BetaFeature>
              <BetaFeatureIcon>🤝</BetaFeatureIcon>
              <BetaFeatureText>
                Contribuez à l'amélioration du produit
              </BetaFeatureText>
            </BetaFeature>
            <BetaFeature>
              <BetaFeatureIcon>✉️</BetaFeatureIcon>
              <BetaFeatureText>
                Donnez votre avis et signalez les bugs
              </BetaFeatureText>
            </BetaFeature>
          </BetaFeatures>
          <Link to="/contact">
            <Button variant="primary" size="large">
              Donner votre avis
            </Button>
          </Link>
        </BetaContent>
      </BetaSection>

      <FAQSection>
        <SectionTitle>{t("landingPage.faq.title")}</SectionTitle>
        <SectionSubtitle>{t("landingPage.faq.subtitle")}</SectionSubtitle>
        <FAQContainer>
          <FAQCard
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <FAQQuestion>
              <span>🔒</span>
              {t("landingPage.faq.items.security.question")}
            </FAQQuestion>
            <FAQAnswer>{t("landingPage.faq.items.security.answer")}</FAQAnswer>
          </FAQCard>

          <FAQCard
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <FAQQuestion>
              <span>💰</span>
              {t("landingPage.faq.items.pricing.question")}
            </FAQQuestion>
            <FAQAnswer>{t("landingPage.faq.items.pricing.answer")}</FAQAnswer>
          </FAQCard>

          <FAQCard
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <FAQQuestion>
              <span>🔄</span>
              {t("landingPage.faq.items.updates.question")}
            </FAQQuestion>
            <FAQAnswer>{t("landingPage.faq.items.updates.answer")}</FAQAnswer>
          </FAQCard>

          <FAQCard
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <FAQQuestion>
              <span>📱</span>
              {t("landingPage.faq.items.mobile.question")}
            </FAQQuestion>
            <FAQAnswer>{t("landingPage.faq.items.mobile.answer")}</FAQAnswer>
          </FAQCard>
        </FAQContainer>
      </FAQSection>

      <CTASection>
        <CircleDecoration className="small" />
        <CircleDecoration className="medium" />
        <CircleDecoration className="large" />

        <CTATitle>{t("landingPage.cta.title")}</CTATitle>
        <CTADescription>{t("landingPage.cta.subtitle")}</CTADescription>
        <Link to="/register">
          <CTAButton size="large">{t("landingPage.cta.button")}</CTAButton>
        </Link>
      </CTASection>
    </LandingContainer>
  );
};

export default LandingPage;
