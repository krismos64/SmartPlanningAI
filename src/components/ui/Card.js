import styled, { css } from "styled-components";
import { cardHover, fadeIn } from "../../styles/animations";

// Styles pour les différentes variantes de cartes
const variants = {
  default: css`
    background-color: ${({ theme }) => theme.colors.surface};
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
  elevated: css`
    background-color: ${({ theme }) => theme.colors.surface};
    box-shadow: ${({ theme }) => theme.shadows.medium};
    border: none;
  `,
  outlined: css`
    background-color: transparent;
    border: 1px solid ${({ theme }) => theme.colors.border};
  `,
  filled: css`
    background-color: ${({ theme }) => `${theme.colors.primary}11`};
    border: none;
  `,
};

// Composant de base de la carte
const StyledCard = styled.div`
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: ${({ padding, theme }) => (padding ? padding : theme.spacing.lg)};
  width: ${({ width }) => width || "100%"};
  height: ${({ height }) => height || "auto"};
  animation: ${fadeIn} 0.3s ease-in-out;

  // Appliquer la variante
  ${({ variant, theme }) => variants[variant] || variants.default}

  // Appliquer l'animation au survol si interactive
  ${({ interactive }) => interactive && cardHover}
  
  // Style pour la carte cliquable
  ${({ clickable }) =>
    clickable &&
    css`
      cursor: pointer;
    `}
`;

// Composant d'en-tête de carte
export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.md};

  h2,
  h3,
  h4,
  h5,
  h6 {
    margin: 0;
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  }
`;

// Composant de titre de carte
export const CardTitle = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  font-size: ${({ theme }) => theme.typography.fontSizes.lg};
`;

// Composant de contenu de carte
export const CardContent = styled.div`
  color: ${({ theme }) => theme.colors.text.secondary};
`;

// Composant de pied de carte
export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: ${({ align }) => align || "flex-end"};
  margin-top: ${({ theme }) => theme.spacing.md};
  padding-top: ${({ theme }) => theme.spacing.md};
  border-top: 1px solid ${({ theme }) => theme.colors.divider};
  gap: ${({ theme }) => theme.spacing.sm};
`;

// Composant Card avec toutes les props
export const Card = ({
  children,
  variant = "default",
  padding,
  width,
  height,
  interactive = false,
  clickable = false,
  onClick,
  className,
  ...props
}) => {
  return (
    <StyledCard
      variant={variant}
      padding={padding}
      width={width}
      height={height}
      interactive={interactive}
      clickable={clickable}
      onClick={clickable ? onClick : undefined}
      className={className}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

// Exporter les sous-composants avec le composant principal
Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
