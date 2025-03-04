import PropTypes from "prop-types";
import styled from "styled-components";

const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border || "#e0e0e0"};
`;

const Title = styled.h1`
  font-size: 1.75rem;
  font-weight: 600;
  margin: 0;
  color: ${({ theme }) => theme.colors.text?.primary || "#333"};
`;

const Description = styled.p`
  margin: 0.5rem 0 0 0;
  color: ${({ theme }) => theme.colors.text?.secondary || "#666"};
  font-size: 0.875rem;
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.75rem;
`;

/**
 * Composant d'en-tête de page avec titre, description et actions
 */
const PageHeader = ({ title, description, actions, children }) => {
  return (
    <HeaderContainer>
      <div>
        <Title>{title}</Title>
        {description && <Description>{description}</Description>}
        {children}
      </div>
      {actions && <ActionsContainer>{actions}</ActionsContainer>}
    </HeaderContainer>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  actions: PropTypes.node,
  children: PropTypes.node,
};

export default PageHeader;
