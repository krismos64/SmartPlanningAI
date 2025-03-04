import { useState } from "react";
// Remplacer l'importation de react-lottie
import styled from "styled-components";
import holidaysAnimation from "../assets/animations/holidays.json";

// Importer react-lottie avec require pour éviter les problèmes de compatibilité
const Lottie = require("react-lottie").default;

// Composants stylisés
const VacationsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
`;

const HeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
`;

const AnimationContainer = styled.div`
  width: 80px;
  height: 80px;
  flex-shrink: 0;
`;

const TitleContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const PageTitle = styled.h1`
  font-size: 2rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors.primary : "transparent"};
  color: ${({ theme, variant }) =>
    variant === "primary" ? "white" : theme.colors.text.primary};
  border: ${({ theme, variant }) =>
    variant === "outline" ? `1px solid ${theme.colors.border}` : "none"};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "primary"
        ? `${theme.colors.primary}dd`
        : `${theme.colors.border}33`};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ active, theme }) => (active ? theme.colors.primary : "transparent")};
  color: ${({ active, theme }) =>
    active ? theme.colors.primary : theme.colors.text.secondary};
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const VacationCard = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: 1rem;
  border-left: 4px solid
    ${({ status, theme }) =>
      status === "approved"
        ? theme.colors.success
        : status === "rejected"
        ? theme.colors.error
        : theme.colors.warning};
`;

const VacationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const VacationTitle = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const VacationStatus = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${({ status, theme }) =>
    status === "approved"
      ? `${theme.colors.success}22`
      : status === "rejected"
      ? `${theme.colors.error}22`
      : `${theme.colors.warning}22`};
  color: ${({ status, theme }) =>
    status === "approved"
      ? theme.colors.success
      : status === "rejected"
      ? theme.colors.error
      : theme.colors.warning};
`;

const VacationDetails = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const VacationDetail = styled.div`
  display: flex;
  flex-direction: column;
`;

const DetailLabel = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const VacationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalContent = styled.div`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 1.5rem;
  width: 100%;
  max-width: 500px;
  box-shadow: ${({ theme }) => theme.shadows.large};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors.text.primary};
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Input = styled.input`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const Textarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  background-color: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

// Composant Vacations
const Vacations = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false);

  // Données fictives pour les demandes de congés
  const vacationRequests = [
    {
      id: 1,
      employee: "Sophie Martin",
      type: "Congés payés",
      startDate: "2023-10-15",
      endDate: "2023-10-22",
      duration: "8 jours",
      status: "approved",
      reason: "Vacances familiales",
      approvedBy: "Admin",
      approvedAt: "2023-09-20",
    },
    {
      id: 2,
      employee: "Thomas Dubois",
      type: "Congés sans solde",
      startDate: "2023-11-05",
      endDate: "2023-11-10",
      duration: "6 jours",
      status: "pending",
      reason: "Raisons personnelles",
    },
    {
      id: 3,
      employee: "Julie Leroy",
      type: "Congés maladie",
      startDate: "2023-09-28",
      endDate: "2023-10-02",
      duration: "5 jours",
      status: "rejected",
      reason: "Maladie",
      rejectedBy: "Admin",
      rejectedAt: "2023-09-27",
      rejectionReason: "Documentation insuffisante",
    },
  ];

  // Filtrer les demandes en fonction de l'onglet actif
  const filteredRequests = vacationRequests.filter((request) => {
    if (activeTab === "all") return true;
    return request.status === activeTab;
  });

  // Formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <VacationsContainer>
      <PageHeader>
        <HeaderLeft>
          <AnimationContainer>
            <Lottie
              options={{
                loop: true,
                autoplay: true,
                animationData: holidaysAnimation,
                rendererSettings: {
                  preserveAspectRatio: "xMidYMid slice",
                },
              }}
              height={80}
              width={80}
            />
          </AnimationContainer>
          <TitleContainer>
            <PageTitle>Gestion des congés</PageTitle>
            <PageDescription>
              Gérez les demandes de congés de vos employés
            </PageDescription>
          </TitleContainer>
        </HeaderLeft>

        <Button variant="primary" onClick={() => setShowModal(true)}>
          <span>+</span> Nouvelle demande
        </Button>
      </PageHeader>

      <TabsContainer>
        <Tab active={activeTab === "all"} onClick={() => setActiveTab("all")}>
          Tous
        </Tab>
        <Tab
          active={activeTab === "pending"}
          onClick={() => setActiveTab("pending")}
        >
          En attente
        </Tab>
        <Tab
          active={activeTab === "approved"}
          onClick={() => setActiveTab("approved")}
        >
          Approuvés
        </Tab>
        <Tab
          active={activeTab === "rejected"}
          onClick={() => setActiveTab("rejected")}
        >
          Refusés
        </Tab>
      </TabsContainer>

      {filteredRequests.length > 0 ? (
        filteredRequests.map((request) => (
          <VacationCard key={request.id} status={request.status}>
            <VacationHeader>
              <VacationTitle>{request.employee}</VacationTitle>
              <VacationStatus status={request.status}>
                {request.status === "approved"
                  ? "Approuvé"
                  : request.status === "rejected"
                  ? "Refusé"
                  : "En attente"}
              </VacationStatus>
            </VacationHeader>

            <VacationDetails>
              <VacationDetail>
                <DetailLabel>Type</DetailLabel>
                <DetailValue>{request.type}</DetailValue>
              </VacationDetail>

              <VacationDetail>
                <DetailLabel>Date de début</DetailLabel>
                <DetailValue>{formatDate(request.startDate)}</DetailValue>
              </VacationDetail>

              <VacationDetail>
                <DetailLabel>Date de fin</DetailLabel>
                <DetailValue>{formatDate(request.endDate)}</DetailValue>
              </VacationDetail>

              <VacationDetail>
                <DetailLabel>Durée</DetailLabel>
                <DetailValue>{request.duration}</DetailValue>
              </VacationDetail>
            </VacationDetails>

            <VacationDetail>
              <DetailLabel>Motif</DetailLabel>
              <DetailValue>{request.reason}</DetailValue>
            </VacationDetail>

            {request.status === "approved" && (
              <VacationDetail>
                <DetailLabel>Approuvé par</DetailLabel>
                <DetailValue>
                  {request.approvedBy} le {formatDate(request.approvedAt)}
                </DetailValue>
              </VacationDetail>
            )}

            {request.status === "rejected" && (
              <VacationDetail>
                <DetailLabel>Motif du refus</DetailLabel>
                <DetailValue>{request.rejectionReason}</DetailValue>
              </VacationDetail>
            )}

            {request.status === "pending" && (
              <VacationActions>
                <Button variant="outline">Refuser</Button>
                <Button variant="primary">Approuver</Button>
              </VacationActions>
            )}
          </VacationCard>
        ))
      ) : (
        <EmptyState>
          Aucune demande de congés{" "}
          {activeTab !== "all"
            ? `${
                activeTab === "pending"
                  ? "en attente"
                  : activeTab === "approved"
                  ? "approuvée"
                  : "refusée"
              }`
            : ""}{" "}
          trouvée.
        </EmptyState>
      )}

      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Nouvelle demande de congés</ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <Form>
              <FormGroup>
                <Label htmlFor="employee">Employé</Label>
                <Input
                  id="employee"
                  type="text"
                  placeholder="Sélectionner un employé"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="type">Type de congés</Label>
                <Input
                  id="type"
                  type="text"
                  placeholder="Sélectionner un type"
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="startDate">Date de début</Label>
                <Input id="startDate" type="date" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input id="endDate" type="date" />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="reason">Motif</Label>
                <Textarea
                  id="reason"
                  placeholder="Entrez le motif de la demande"
                />
              </FormGroup>

              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Soumettre
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </VacationsContainer>
  );
};

export default Vacations;
