import { Link } from "react-router-dom";
import styled from "styled-components";

// Composants stylisés
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 2rem;
  text-align: center;
`;

const ErrorCode = styled.div`
  font-size: 6rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.error};
  margin-bottom: 1rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  max-width: 500px;
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const StyledLink = styled(Link)`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  text-decoration: none;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => `${theme.colors.primary}dd`};
  }
`;

// Composant page d'erreur 403
const Unauthorized = () => {
  return (
    <Container>
      <ErrorCode>403</ErrorCode>
      <Title>Accès refusé</Title>
      <Description>
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
        Veuillez contacter votre administrateur si vous pensez qu'il s'agit
        d'une erreur.
      </Description>
      <StyledLink to="/dashboard">Retour au tableau de bord</StyledLink>
    </Container>
  );
};

export default Unauthorized;
