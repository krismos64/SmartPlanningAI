import Lottie from "lottie-react";
import { useCallback, useState } from "react";
import { FaCalendarAlt, FaList, FaPlus } from "react-icons/fa";
import styled from "styled-components";
import holidaysAnimation from "../assets/animations/holidays.json";
import { useNotification } from "../components/ui/Notification";
import VacationCalendar from "../components/vacations/VacationCalendar";
import VacationExport from "../components/vacations/VacationExport";
import VacationForm from "../components/vacations/VacationForm";
import { useAuth } from "../contexts/AuthContext";
import useVacations from "../hooks/useVacations";
import ActivityLogger from "../utils/activityLogger";

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

  @media (max-width: ${({ theme }) => theme.breakpoints?.md || "768px"}) {
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
  color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
  margin-bottom: 0.5rem;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.colors?.text?.secondary || "#6B7280"};
  font-size: 1.1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) =>
    variant === "primary" ? theme.colors?.primary || "#4F46E5" : "transparent"};
  color: ${({ theme, variant }) =>
    variant === "primary" ? "white" : theme.colors?.text?.primary || "#111827"};
  border: ${({ theme, variant }) =>
    variant === "outline"
      ? `1px solid ${theme.colors?.border || "#E5E7EB"}`
      : "none"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
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
        ? `${theme.colors?.primary || "#4F46E5"}dd`
        : `${theme.colors?.border || "#E5E7EB"}33`};
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ active, theme }) =>
      active ? theme.colors?.primary || "#4F46E5" : "transparent"};
  color: ${({ active, theme }) =>
    active
      ? theme.colors?.primary || "#4F46E5"
      : theme.colors?.text?.secondary || "#6B7280"};
  font-weight: ${({ active }) => (active ? 500 : 400)};
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${({ theme }) => theme.colors?.primary || "#4F46E5"};
  }
`;

const ViewToggle = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
`;

const ViewToggleButton = styled.button`
  padding: 0.5rem 1rem;
  background-color: ${({ active, theme }) =>
    active
      ? theme.colors?.primary || "#4F46E5"
      : theme.colors?.background || "#F9FAFB"};
  color: ${({ active, theme }) =>
    active ? "white" : theme.colors?.text?.primary || "#111827"};
  border: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:first-child {
    border-top-left-radius: ${({ theme }) =>
      theme.borderRadius?.small || "0.25rem"};
    border-bottom-left-radius: ${({ theme }) =>
      theme.borderRadius?.small || "0.25rem"};
  }

  &:last-child {
    border-top-right-radius: ${({ theme }) =>
      theme.borderRadius?.small || "0.25rem"};
    border-bottom-right-radius: ${({ theme }) =>
      theme.borderRadius?.small || "0.25rem"};
  }

  &:hover {
    background-color: ${({ active, theme }) =>
      active
        ? theme.colors?.primary || "#4F46E5"
        : theme.colors?.background || "#F9FAFB"};
  }
`;

const VacationCard = styled.div`
  background-color: ${({ theme }) => theme.colors?.surface || "#FFFFFF"};
  border-radius: ${({ theme }) => theme.borderRadius?.medium || "0.375rem"};
  padding: 1.5rem;
  box-shadow: ${({ theme }) =>
    theme.shadows?.small || "0 1px 2px 0 rgba(0, 0, 0, 0.05)"};
  margin-bottom: 1rem;
  border-left: 4px solid
    ${({ status, theme }) =>
      status === "approved"
        ? theme.colors?.success || "#10B981"
        : status === "rejected"
        ? theme.colors?.danger || "#EF4444"
        : theme.colors?.warning || "#F59E0B"};
`;

const VacationHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;

  @media (max-width: ${({ theme }) => theme.breakpoints?.sm || "640px"}) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
`;

const VacationTitle = styled.h3`
  font-size: 1.25rem;
  color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
  margin: 0;
`;

const VacationStatus = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 0.875rem;
  font-weight: 500;
  background-color: ${({ status, theme }) =>
    status === "approved"
      ? `${theme.colors?.success || "#10B981"}22`
      : status === "rejected"
      ? `${theme.colors?.danger || "#EF4444"}22`
      : `${theme.colors?.warning || "#F59E0B"}22`};
  color: ${({ status, theme }) =>
    status === "approved"
      ? theme.colors?.success || "#10B981"
      : status === "rejected"
      ? theme.colors?.danger || "#EF4444"
      : theme.colors?.warning || "#F59E0B"};
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
  color: ${({ theme }) => theme.colors?.text?.secondary || "#6B7280"};
  margin-bottom: 0.25rem;
`;

const DetailValue = styled.div`
  font-weight: 500;
  color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
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
  color: ${({ theme }) => theme.colors?.text?.secondary || "#6B7280"};
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
  background-color: ${({ theme }) => theme.colors?.surface || "#FFFFFF"};
  border-radius: ${({ theme }) => theme.borderRadius?.medium || "0.375rem"};
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: ${({ theme }) =>
    theme.shadows?.large || "0 10px 15px -3px rgba(0, 0, 0, 0.1)"};
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const ModalTitle = styled.h2`
  font-size: 1.5rem;
  color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors?.text?.secondary || "#6B7280"};
  font-size: 1.5rem;
  cursor: pointer;

  &:hover {
    color: ${({ theme }) => theme.colors?.text?.primary || "#111827"};
  }
`;

const RejectModal = styled(Modal)``;

const RejectModalContent = styled(ModalContent)`
  max-width: 400px;
`;

const RejectForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RejectTextarea = styled.textarea`
  padding: 0.75rem;
  border: 1px solid ${({ theme }) => theme.colors?.border || "#E5E7EB"};
  border-radius: ${({ theme }) => theme.borderRadius?.small || "0.25rem"};
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors?.primary || "#4F46E5"};
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
  const { user } = useAuth();
  const {
    vacations,
    loading,
    error,
    createVacation,
    updateVacation,
    approveVacation,
    rejectVacation,
    deleteVacation,
    getVacationsByStatus,
    refetch: fetchVacations,
  } = useVacations();
  const { showNotification } = useNotification();

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("list");
  const [showModal, setShowModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedVacation, setSelectedVacation] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Filtrer les demandes en fonction de l'onglet actif
  const filteredVacations = getVacationsByStatus(
    activeTab === "all" ? null : activeTab
  );

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Traduire le type de congé
  const translateType = (type) => {
    const types = {
      paid: "Congés payés",
      rtt: "RTT",
      unpaid: "Congés sans solde",
      sick: "Maladie",
      exceptional: "Absence exceptionnelle",
      recovery: "Récupération",
    };
    return types[type] || type;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = useCallback(
    async (vacationData) => {
      setIsLoading(true);
      try {
        console.log("Données du formulaire soumises:", vacationData);

        // Vérifier que l'utilisateur est authentifié
        if (!user) {
          console.error("Erreur: utilisateur non authentifié");
          showNotification(
            "Vous devez être connecté pour créer une demande de congé",
            "error"
          );
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
          return;
        }

        // Vérifier que les données requises sont présentes
        if (!vacationData.employeeId) {
          throw new Error("L'identifiant de l'employé est requis");
        }

        if (!vacationData.startDate || !vacationData.endDate) {
          throw new Error("Les dates de début et de fin sont requises");
        }

        if (selectedVacation) {
          // Mise à jour d'un congé existant
          console.log("Mise à jour d'un congé existant:", selectedVacation.id);
          const response = await updateVacation(
            selectedVacation.id,
            vacationData
          );

          console.log("Réponse de mise à jour:", response);

          if (response.success) {
            // Enregistrer l'activité de mise à jour
            await ActivityLogger.logUpdate(
              "vacation",
              selectedVacation.id,
              `Mise à jour d'une demande de congé du ${formatDate(
                vacationData.startDate
              )} au ${formatDate(vacationData.endDate)}`,
              user
            );

            setSelectedVacation(null);
            setShowModal(false);
            showNotification(
              "Demande de congé mise à jour avec succès",
              "success"
            );
          } else {
            // Vérifier si l'erreur est liée à l'authentification
            if (
              response.error === "Authentification requise" ||
              response.error === "Session expirée"
            ) {
              showNotification(
                "Session expirée. Veuillez vous reconnecter.",
                "error"
              );
              setTimeout(() => {
                window.location.href = "/login";
              }, 2000);
              return;
            }
            throw new Error(response.error || "Erreur lors de la mise à jour");
          }
        } else {
          // Création d'un nouveau congé
          console.log("Création d'un nouveau congé");
          const response = await createVacation(vacationData);

          console.log("Réponse de création:", response);

          if (response.success) {
            // Enregistrer l'activité de création
            await ActivityLogger.logCreation(
              "vacation",
              response.vacation.id,
              `Nouvelle demande de congé du ${formatDate(
                vacationData.startDate
              )} au ${formatDate(vacationData.endDate)}`,
              user
            );

            setSelectedVacation(null);
            setShowModal(false);
            showNotification("Demande de congé créée avec succès", "success");
          } else {
            // Vérifier si l'erreur est liée à l'authentification
            if (
              response.error === "Authentification requise" ||
              response.error === "Session expirée"
            ) {
              showNotification(
                "Session expirée. Veuillez vous reconnecter.",
                "error"
              );
              setTimeout(() => {
                window.location.href = "/login";
              }, 2000);
              return;
            }
            throw new Error(response.error || "Erreur lors de la création");
          }
        }
      } catch (error) {
        console.error("Erreur détaillée lors de la soumission:", error);
        showNotification(error.message || "Une erreur est survenue", "error");
      } finally {
        setIsLoading(false);
      }
    },
    [
      selectedVacation,
      createVacation,
      updateVacation,
      user,
      formatDate,
      showNotification,
    ]
  );

  // Gérer l'approbation d'une demande
  const handleApprove = useCallback(
    async (id) => {
      try {
        await approveVacation(id);
        showNotification("Demande de congé approuvée", "success");
      } catch (error) {
        showNotification("Erreur lors de l'approbation de la demande", "error");
      }
    },
    [approveVacation, showNotification]
  );

  // Gérer le rejet d'une demande
  const handleReject = useCallback(
    async (id, reason) => {
      try {
        await rejectVacation(id, reason);
        showNotification("Demande de congé rejetée", "success");
        setShowRejectModal(false);
        setRejectionReason("");
      } catch (error) {
        showNotification("Erreur lors du rejet de la demande", "error");
      }
    },
    [rejectVacation, showNotification]
  );

  // Ouvrir le modal de rejet
  const openRejectModal = useCallback((vacation) => {
    setSelectedVacation(vacation);
    setShowRejectModal(true);
  }, []);

  // Gérer la suppression d'une demande
  const handleDelete = useCallback(
    async (id) => {
      if (!id) return;

      setIsLoading(true);
      try {
        const vacationToDelete = vacations.find((v) => v.id === id);
        if (!vacationToDelete) {
          throw new Error("Demande de congé introuvable");
        }

        const response = await deleteVacation(id);
        if (response.success) {
          // Enregistrer l'activité de suppression
          await ActivityLogger.logDeletion(
            "vacation",
            id,
            `Suppression d'une demande de congé du ${formatDate(
              vacationToDelete.startDate
            )} au ${formatDate(vacationToDelete.endDate)}`,
            user
          );

          setSelectedVacation(null);
          showNotification("Demande de congé supprimée avec succès", "success");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        showNotification(
          error.message || "Une erreur est survenue lors de la suppression",
          "error"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [vacations, deleteVacation, user]
  );

  // Ouvrir le modal d'édition
  const handleEdit = useCallback((vacation) => {
    setSelectedVacation(vacation);
    setShowModal(true);
  }, []);

  // Gérer le clic sur un jour du calendrier
  const handleDayClick = useCallback((date) => {
    // Créer une nouvelle demande de congé avec la date sélectionnée
    setSelectedVacation(null);
    setShowModal(true);
    // Le formulaire sera pré-rempli avec cette date
  }, []);

  return (
    <VacationsContainer>
      <PageHeader>
        <HeaderLeft>
          <AnimationContainer>
            <Lottie
              animationData={holidaysAnimation}
              loop={true}
              autoplay={true}
              style={{ height: 80, width: 80 }}
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
          <FaPlus /> Nouvelle demande
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

      <ViewToggle>
        <ViewToggleButton
          active={viewMode === "list"}
          onClick={() => setViewMode("list")}
        >
          <FaList /> Liste
        </ViewToggleButton>
        <ViewToggleButton
          active={viewMode === "calendar"}
          onClick={() => setViewMode("calendar")}
        >
          <FaCalendarAlt /> Calendrier
        </ViewToggleButton>
      </ViewToggle>

      {/* Bouton d'export PDF */}
      {filteredVacations.length > 0 && (
        <VacationExport vacations={filteredVacations} isGlobal={true} />
      )}

      {/* Vue calendrier */}
      {viewMode === "calendar" && (
        <VacationCalendar
          vacations={filteredVacations}
          onDayClick={handleDayClick}
        />
      )}

      {/* Vue liste */}
      {viewMode === "list" && (
        <>
          {filteredVacations.length > 0 ? (
            filteredVacations.map((vacation) => (
              <VacationCard key={vacation.id} status={vacation.status}>
                <VacationHeader>
                  <VacationTitle>
                    {vacation.employeeName || "Employé inconnu"}
                  </VacationTitle>
                  <VacationStatus status={vacation.status}>
                    {vacation.status === "approved"
                      ? "Approuvé"
                      : vacation.status === "rejected"
                      ? "Refusé"
                      : "En attente"}
                  </VacationStatus>
                </VacationHeader>

                <VacationDetails>
                  <VacationDetail>
                    <DetailLabel>Type</DetailLabel>
                    <DetailValue>{translateType(vacation.type)}</DetailValue>
                  </VacationDetail>

                  <VacationDetail>
                    <DetailLabel>Date de début</DetailLabel>
                    <DetailValue>{formatDate(vacation.startDate)}</DetailValue>
                  </VacationDetail>

                  <VacationDetail>
                    <DetailLabel>Date de fin</DetailLabel>
                    <DetailValue>{formatDate(vacation.endDate)}</DetailValue>
                  </VacationDetail>

                  <VacationDetail>
                    <DetailLabel>Durée</DetailLabel>
                    <DetailValue>{vacation.duration}</DetailValue>
                  </VacationDetail>
                </VacationDetails>

                <VacationDetail>
                  <DetailLabel>Motif</DetailLabel>
                  <DetailValue>{vacation.reason || "-"}</DetailValue>
                </VacationDetail>

                {vacation.status === "approved" && (
                  <VacationDetail>
                    <DetailLabel>Approuvé le</DetailLabel>
                    <DetailValue>
                      {formatDate(vacation.approvedAt)}{" "}
                      {vacation.approvedAt
                        ? new Date(vacation.approvedAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </DetailValue>
                  </VacationDetail>
                )}

                {vacation.status === "rejected" && (
                  <VacationDetail>
                    <DetailLabel>Refusé le</DetailLabel>
                    <DetailValue>
                      {formatDate(vacation.rejectedAt)}{" "}
                      {vacation.rejectedAt
                        ? new Date(vacation.rejectedAt).toLocaleTimeString(
                            "fr-FR",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )
                        : ""}
                    </DetailValue>
                  </VacationDetail>
                )}

                {vacation.status === "rejected" && vacation.rejectionReason && (
                  <VacationDetail>
                    <DetailLabel>Motif du refus</DetailLabel>
                    <DetailValue>{vacation.rejectionReason}</DetailValue>
                  </VacationDetail>
                )}

                {/* Actions selon le statut et le rôle de l'utilisateur */}
                <VacationActions>
                  {/* Actions pour les employés sur leurs propres demandes en attente */}
                  {vacation.employeeId === user.id &&
                    vacation.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(vacation.id)}
                        >
                          Supprimer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(vacation)}
                        >
                          Modifier
                        </Button>
                      </>
                    )}

                  {/* Actions pour les admins et managers sur les demandes en attente */}
                  {(user.role === "admin" || user.role === "manager") &&
                    vacation.status === "pending" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => openRejectModal(vacation)}
                        >
                          Refuser
                        </Button>
                        <Button
                          variant="primary"
                          onClick={() => handleApprove(vacation.id)}
                        >
                          Approuver
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(vacation.id)}
                        >
                          Supprimer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(vacation)}
                        >
                          Modifier
                        </Button>
                      </>
                    )}

                  {/* Actions pour les admins et managers sur les demandes approuvées */}
                  {(user.role === "admin" || user.role === "manager") &&
                    vacation.status === "approved" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Mettre la demande en attente
                            updateVacation(vacation.id, { status: "pending" });
                          }}
                        >
                          Remettre en attente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(vacation.id)}
                        >
                          Supprimer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(vacation)}
                        >
                          Modifier
                        </Button>
                      </>
                    )}

                  {/* Actions pour les admins et managers sur les demandes rejetées */}
                  {(user.role === "admin" || user.role === "manager") &&
                    vacation.status === "rejected" && (
                      <>
                        <Button
                          variant="outline"
                          onClick={() => {
                            // Mettre la demande en attente
                            updateVacation(vacation.id, { status: "pending" });
                          }}
                        >
                          Remettre en attente
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleDelete(vacation.id)}
                        >
                          Supprimer
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => handleEdit(vacation)}
                        >
                          Modifier
                        </Button>
                      </>
                    )}
                </VacationActions>
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
        </>
      )}

      {/* Modal de création/édition de demande */}
      {showModal && (
        <Modal onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {selectedVacation
                  ? "Modifier la demande"
                  : "Nouvelle demande de congés"}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>×</CloseButton>
            </ModalHeader>

            <VacationForm
              vacation={selectedVacation}
              onSubmit={handleSubmit}
              onCancel={() => setShowModal(false)}
              currentUser={user}
            />
          </ModalContent>
        </Modal>
      )}

      {/* Modal de rejet */}
      {showRejectModal && (
        <RejectModal onClick={() => setShowRejectModal(false)}>
          <RejectModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Motif du refus</ModalTitle>
              <CloseButton onClick={() => setShowRejectModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <RejectForm onSubmit={(e) => e.preventDefault()}>
              <RejectTextarea
                placeholder="Veuillez indiquer le motif du refus..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />

              <ButtonGroup>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                >
                  Annuler
                </Button>
                <Button type="submit" variant="primary">
                  Confirmer le refus
                </Button>
              </ButtonGroup>
            </RejectForm>
          </RejectModalContent>
        </RejectModal>
      )}
    </VacationsContainer>
  );
};

export default Vacations;
