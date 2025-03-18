import { Link } from "react-router-dom";
import styled from "styled-components";

const FooterContainer = styled.footer`
  padding: ${({ theme }) => theme.spacing.lg};
  background-color: ${({ theme }) => theme.colors.surface};
  text-align: center;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin-top: auto;
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

const FooterLink = styled.a`
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

const Footer = () => {
  return (
    <FooterContainer>
      <FooterLinks>
        <FooterLink as={Link} to="/terms">
          Conditions d'utilisation
        </FooterLink>
        <FooterLink as={Link} to="/privacy">
          Politique de confidentialité
        </FooterLink>
        <FooterLink as={Link} to="/contact">
          Contact
        </FooterLink>
      </FooterLinks>
      <Copyright>
        © {new Date().getFullYear()} SmartPlanning AI. Tous droits réservés.
      </Copyright>
    </FooterContainer>
  );
};

export default Footer;
