import PropTypes from "prop-types";
import styled, { keyframes } from "styled-components";

const spin = keyframes`
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: ${({ center }) => (center ? "center" : "flex-start")};
  align-items: center;
  width: 100%;
  padding: ${({ size }) => (size === "large" ? "2rem" : "1rem")} 0;
`;

const SpinnerElement = styled.div`
  width: ${({ size }) => {
    switch (size) {
      case "small":
        return "1rem";
      case "large":
        return "3rem";
      default:
        return "2rem";
    }
  }};
  height: ${({ size }) => {
    switch (size) {
      case "small":
        return "1rem";
      case "large":
        return "3rem";
      default:
        return "2rem";
    }
  }};
  border: ${({ size }) => {
      switch (size) {
        case "small":
          return "2px";
        case "large":
          return "4px";
        default:
          return "3px";
      }
    }}
    solid rgba(0, 0, 0, 0.1);
  border-top: ${({ size }) => {
      switch (size) {
        case "small":
          return "2px";
        case "large":
          return "4px";
        default:
          return "3px";
      }
    }}
    solid ${({ theme }) => theme.colors.primary || "#1890ff"};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;

const SpinnerText = styled.span`
  margin-left: 0.75rem;
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
`;

/**
 * Composant de chargement (spinner)
 */
const Spinner = ({ size = "medium", center = false, text }) => {
  return (
    <SpinnerContainer center={center} size={size}>
      <SpinnerElement size={size} />
      {text && <SpinnerText>{text}</SpinnerText>}
    </SpinnerContainer>
  );
};

Spinner.propTypes = {
  size: PropTypes.oneOf(["small", "medium", "large"]),
  center: PropTypes.bool,
  text: PropTypes.string,
};

export default Spinner;
