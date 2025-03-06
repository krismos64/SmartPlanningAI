import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";

// Animation de rotation
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

// Conteneur du spinner
const SpinnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: ${({ $center }) => ($center ? "center" : "flex-start")};
  height: ${({ $center }) => ($center ? "100%" : "auto")};
  width: 100%;
  padding: 1rem;
`;

// Élément du spinner
const SpinnerElement = styled.div`
  width: ${({ $size }) => {
    switch ($size) {
      case "small":
        return "1.5rem";
      case "large":
        return "3rem";
      default:
        return "2rem";
    }
  }};
  height: ${({ $size }) => {
    switch ($size) {
      case "small":
        return "1.5rem";
      case "large":
        return "3rem";
      default:
        return "2rem";
    }
  }};
  border: ${({ $size }) => {
      switch ($size) {
        case "small":
          return "2px";
        case "large":
          return "4px";
        default:
          return "3px";
      }
    }}
    solid rgba(0, 0, 0, 0.1);
  border-top: ${({ $size, theme }) => {
    const borderWidth =
      $size === "small" ? "2px" : $size === "large" ? "4px" : "3px";
    return `${borderWidth} solid ${theme.colors.primary.main}`;
  }};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

// Texte du spinner
const SpinnerText = styled.p`
  margin-top: 0.5rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 0.875rem;
`;

/**
 * Composant Spinner pour indiquer un chargement
 */
const Spinner = ({ $center, $size, text }) => {
  return (
    <SpinnerContainer $center={$center}>
      <SpinnerElement $size={$size} />
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

Spinner.propTypes = {
  $center: PropTypes.bool,
  $size: PropTypes.oneOf(["small", "medium", "large"]),
  text: PropTypes.string,
};

Spinner.defaultProps = {
  $center: false,
  $size: "medium",
  text: "",
};

export default Spinner;
