import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import styled, {
  keyframes,
  useTheme as useStyledTheme,
} from "styled-components";
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
  overflow-x: hidden;
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

const LogoAnimation = styled.div`
  width: 40px;
  height: 40px;
  animation: ${float} 3s ease-in-out infinite;
`;

const Nav = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
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

const ThemeSwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ContactSection = styled.section`
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  animation: ${fadeIn} 0.7s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    flex-direction: column;
    padding: 3rem 1.5rem;
  }
`;

const ContactInfo = styled.div`
  flex: 1;
  animation: ${slideInLeft} 0.8s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    order: 2;
  }
`;

const ContactTitle = styled.h1`
  font-size: 2.8rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  position: relative;

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
    font-size: 2.2rem;
  }
`;

const ContactSubtitle = styled.p`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 500px;
`;

const ContactDetailsContainer = styled.div`
  margin-top: 3rem;
`;

const ContactDetailCard = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  box-shadow: ${({ theme }) => theme.shadows.small};
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${slideUp} 0.5s ease-in-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;

  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.medium};
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(
      to bottom,
      ${({ theme }) => theme.colors.primary},
      ${({ theme }) => theme.colors.secondary}
    );
  }
`;

const DetailIcon = styled.div`
  font-size: 1.8rem;
  color: ${({ theme }) => theme.colors.primary};
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: ${({ theme }) =>
    theme.isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const DetailContent = styled.div`
  flex: 1;
`;

const DetailTitle = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const DetailText = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1rem;
  line-height: 1.5;
`;

const ContactFormContainer = styled.div`
  flex: 1;
  max-width: 600px;
  animation: ${slideInRight} 0.8s ease-in-out;

  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    order: 1;
    max-width: 100%;
    margin-bottom: 2rem;
  }
`;

const AnimationContainer = styled.div`
  width: 100%;
  height: 250px;
  margin-bottom: 2rem;
  animation: ${float} 6s ease-in-out infinite;
`;

const FormCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 16px;
  padding: 2.5rem;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  transition: transform 0.4s ease, box-shadow 0.4s ease;
  position: relative;
  overflow: hidden;

  &:hover {
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
    background-size: 200% 100%;
    animation: ${shimmer} 3s infinite linear;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    padding: 1.5rem;
  }
`;

const FormTitle = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: ${({ theme }) => theme.colors.primary};
  text-align: center;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
`;

const FormLabel = styled.label`
  font-size: 1rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormInput = styled.input`
  font-size: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.isDark ? "rgba(255, 255, 255, 0.05)" : theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.3s ease, box-shadow 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary}88;
  }
`;

const FormTextarea = styled.textarea`
  font-size: 1rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) =>
    theme.isDark ? "rgba(255, 255, 255, 0.05)" : theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  transition: border-color 0.3s ease, box-shadow 0.3s ease;
  resize: vertical;
  min-height: 120px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => theme.colors.primary}33;
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.text.secondary}88;
  }
`;

const FormButton = styled(Button)`
  margin-top: 0.5rem;
  align-self: center;
  min-width: 150px;
`;

const FormHint = styled.p`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  text-align: center;
  margin-top: 1rem;
`;

const SuccessMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.success}22;
  border: 1px solid ${({ theme }) => theme.colors.success};
  color: ${({ theme }) => theme.colors.success};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${slideUp} 0.5s ease-in-out;
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error}22;
  border: 1px solid ${({ theme }) => theme.colors.error};
  color: ${({ theme }) => theme.colors.error};
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
  animation: ${slideUp} 0.5s ease-in-out;
`;

const Contact = () => {
  const { toggleTheme } = useTheme();
  const isDarkMode = useTheme().theme === "dark";
  const styledTheme = useStyledTheme();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({
    status: null,
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simuler un appel API
    setTimeout(() => {
      setIsSubmitting(false);
      setFormStatus({
        status: "success",
        message: t("contact.form.success"),
      });
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      });

      // Réinitialiser le message de statut après 5 secondes
      setTimeout(() => {
        setFormStatus({
          status: null,
          message: "",
        });
      }, 5000);
    }, 1500);
  };

  return (
    <PageContainer>
      <Header>
        <Logo to="/">
          <LogoAnimation>
            <EnhancedLottie animationData={planningAnimation} loop={true} />
          </LogoAnimation>
          SmartPlanning
        </Logo>
        <Nav>
          <NavItem to="/">{t("common.goHome")}</NavItem>
          <NavItem to="/login">{t("auth.login")}</NavItem>
          <ThemeSwitchWrapper>
            <ThemeSwitch onChange={toggleTheme} checked={isDarkMode} />
          </ThemeSwitchWrapper>
        </Nav>
      </Header>

      <ContactSection>
        <ContactInfo>
          <ContactTitle>{t("contact.title")}</ContactTitle>
          <ContactSubtitle>{t("contact.subtitle")}</ContactSubtitle>

          <ContactDetailsContainer>
            <ContactDetailCard delay="0.1s">
              <DetailIcon>📧</DetailIcon>
              <DetailContent>
                <DetailTitle>{t("contact.email")}</DetailTitle>
                <DetailText>{t("contact.emailAddress")}</DetailText>
              </DetailContent>
            </ContactDetailCard>
          </ContactDetailsContainer>
        </ContactInfo>

        <ContactFormContainer>
          <AnimationContainer>
            <EnhancedLottie animationData={planningAnimation} loop={true} />
          </AnimationContainer>

          <FormCard>
            <FormTitle>{t("contact.form.title")}</FormTitle>

            {formStatus.status === "success" && (
              <SuccessMessage>{formStatus.message}</SuccessMessage>
            )}

            {formStatus.status === "error" && (
              <ErrorMessage>{formStatus.message}</ErrorMessage>
            )}

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <FormLabel htmlFor="name">{t("contact.form.name")}</FormLabel>
                <FormInput
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={t("contact.form.name")}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="email">{t("contact.form.email")}</FormLabel>
                <FormInput
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder={t("contact.form.email")}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="subject">
                  {t("contact.form.subject")}
                </FormLabel>
                <FormInput
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t("contact.form.subject")}
                  required
                />
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="message">
                  {t("contact.form.message")}
                </FormLabel>
                <FormTextarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t("contact.form.message")}
                  required
                />
              </FormGroup>

              <FormButton type="submit" size="large" disabled={isSubmitting}>
                {isSubmitting
                  ? t("contact.form.sending")
                  : t("contact.form.send")}
              </FormButton>

              <FormHint>{t("contact.form.hint")}</FormHint>
            </Form>
          </FormCard>
        </ContactFormContainer>
      </ContactSection>
    </PageContainer>
  );
};

export default Contact;
