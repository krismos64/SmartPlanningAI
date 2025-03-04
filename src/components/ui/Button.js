import styled, { css } from "styled-components";
import { buttonAnimation } from "../../styles/animations";

// Styles pour les différentes variantes de boutons
const variants = {
  primary: css`
    background-color: ${({ theme }) => theme?.colors?.primary || "#3a86ff"};
    color: white;
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.primary ? `${theme.colors.primary}dd` : "#3a86ffdd"};
      box-shadow: ${({ theme }) =>
        theme?.shadows?.button || "0 4px 6px rgba(58, 134, 255, 0.25)"};
    }
  `,
  secondary: css`
    background-color: ${({ theme }) => theme?.colors?.secondary || "#8338ec"};
    color: white;
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.secondary ? `${theme.colors.secondary}dd` : "#8338ecdd"};
      box-shadow: 0 4px 6px rgba(131, 56, 236, 0.25);
    }
  `,
  accent: css`
    background-color: ${({ theme }) => theme?.colors?.accent || "#ff006e"};
    color: white;
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.accent ? `${theme.colors.accent}dd` : "#ff006edd"};
      box-shadow: 0 4px 6px rgba(255, 0, 110, 0.25);
    }
  `,
  success: css`
    background-color: ${({ theme }) => theme?.colors?.success || "#06d6a0"};
    color: white;
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.success ? `${theme.colors.success}dd` : "#06d6a0dd"};
      box-shadow: 0 4px 6px rgba(6, 214, 160, 0.25);
    }
  `,
  warning: css`
    background-color: ${({ theme }) => theme?.colors?.warning || "#ffbe0b"};
    color: ${({ theme }) => theme?.colors?.text?.primary || "#212529"};
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.warning ? `${theme.colors.warning}dd` : "#ffbe0bdd"};
      box-shadow: 0 4px 6px rgba(255, 190, 11, 0.25);
    }
  `,
  error: css`
    background-color: ${({ theme }) => theme?.colors?.error || "#ef476f"};
    color: white;
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.error ? `${theme.colors.error}dd` : "#ef476fdd"};
      box-shadow: 0 4px 6px rgba(239, 71, 111, 0.25);
    }
  `,
  outline: css`
    background-color: transparent;
    color: ${({ theme }) => theme?.colors?.primary || "#3a86ff"};
    border: 2px solid ${({ theme }) => theme?.colors?.primary || "#3a86ff"};
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.primary ? `${theme.colors.primary}11` : "#3a86ff11"};
      box-shadow: 0 4px 6px rgba(58, 134, 255, 0.15);
    }
  `,
  ghost: css`
    background-color: transparent;
    color: ${({ theme }) => theme?.colors?.primary || "#3a86ff"};
    &:hover {
      background-color: ${({ theme }) =>
        theme?.colors?.primary ? `${theme.colors.primary}11` : "#3a86ff11"};
    }
  `,
  link: css`
    background-color: transparent;
    color: ${({ theme }) => theme?.colors?.primary || "#3a86ff"};
    padding: 0;
    height: auto;
    font-weight: ${({ theme }) =>
      theme?.typography?.fontWeights?.medium || "500"};
    &:hover {
      text-decoration: underline;
      transform: none;
    }
    &:active {
      transform: none;
    }
  `,
};

// Styles pour les différentes tailles de boutons
const sizes = {
  xs: css`
    height: 28px;
    padding: 0 ${({ theme }) => theme?.spacing?.sm || "0.5rem"};
    font-size: ${({ theme }) => theme?.typography?.sizes?.xs || "0.75rem"};
    border-radius: ${({ theme }) => theme?.borderRadius?.small || "4px"};
  `,
  sm: css`
    height: 36px;
    padding: 0 ${({ theme }) => theme?.spacing?.md || "1rem"};
    font-size: ${({ theme }) => theme?.typography?.sizes?.sm || "0.875rem"};
    border-radius: ${({ theme }) => theme?.borderRadius?.small || "4px"};
  `,
  md: css`
    height: 44px;
    padding: 0 ${({ theme }) => theme?.spacing?.lg || "1.5rem"};
    font-size: ${({ theme }) => theme?.typography?.sizes?.md || "1rem"};
    border-radius: ${({ theme }) => theme?.borderRadius?.medium || "8px"};
  `,
  lg: css`
    height: 52px;
    padding: 0 ${({ theme }) => theme?.spacing?.xl || "2rem"};
    font-size: ${({ theme }) => theme?.typography?.sizes?.lg || "1.125rem"};
    border-radius: ${({ theme }) => theme?.borderRadius?.medium || "8px"};
  `,
  xl: css`
    height: 60px;
    padding: 0 ${({ theme }) => theme?.spacing?.["2xl"] || "3rem"};
    font-size: ${({ theme }) => theme?.typography?.sizes?.xl || "1.25rem"};
    border-radius: ${({ theme }) => theme?.borderRadius?.large || "12px"};
  `,
};

// Composant de base du bouton
const StyledButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme?.spacing?.sm || "0.5rem"};
  border: none;
  outline: none;
  cursor: pointer;
  font-family: ${({ theme }) =>
    theme?.typography?.fontFamily || "'Inter', 'Roboto', sans-serif"};
  font-weight: ${({ theme }) =>
    theme?.typography?.fontWeights?.medium || "500"};
  white-space: nowrap;
  ${buttonAnimation}

  // Appliquer la variante
  ${({ $variant }) => variants[$variant] || variants.primary}
  
  // Appliquer la taille
  ${({ $size }) => sizes[$size] || sizes.md}
  
  // Style pour le bouton désactivé
  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.6;
      cursor: not-allowed;
      &:hover {
        transform: none;
        box-shadow: none;
      }
    `}
    
  // Style pour le bouton pleine largeur
  ${({ $fullWidth }) =>
    $fullWidth &&
    css`
      width: 100%;
    `}
    
  // Style pour le bouton avec icône seulement
  ${({ $iconOnly, $size }) =>
    $iconOnly &&
    css`
      width: ${$size === "xs"
        ? "28px"
        : $size === "sm"
        ? "36px"
        : $size === "md"
        ? "44px"
        : $size === "lg"
        ? "52px"
        : "60px"};
      padding: 0;
      justify-content: center;
    `}
    
  // Animation de chargement
  ${({ $loading }) =>
    $loading &&
    css`
      position: relative;
      color: transparent !important;
      pointer-events: none;

      &::after {
        content: "";
        position: absolute;
        width: 20px;
        height: 20px;
        top: 50%;
        left: 50%;
        margin-top: -10px;
        margin-left: -10px;
        border-radius: 50%;
        border: 2px solid
          ${({ theme, $variant }) => {
            if (
              $variant === "ghost" ||
              $variant === "outline" ||
              $variant === "link"
            ) {
              return theme?.colors?.primary || "#3a86ff";
            }
            return "rgba(255, 255, 255, 0.5)";
          }};
        border-top-color: ${({ theme, $variant }) => {
          if (
            $variant === "ghost" ||
            $variant === "outline" ||
            $variant === "link"
          ) {
            return theme?.colors?.primary || "#3a86ff";
          }
          return "white";
        }};
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }
    `}
`;

// Composant Button avec ses props
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = false,
  iconOnly = false,
  loading = false,
  leftIcon,
  rightIcon,
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      disabled={disabled || loading}
      $fullWidth={fullWidth}
      $iconOnly={iconOnly}
      $loading={loading}
      {...props}
    >
      {leftIcon && !loading && leftIcon}
      {children}
      {rightIcon && !loading && rightIcon}
    </StyledButton>
  );
};

export default Button;
