import { useState } from "react";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import Modal from "../ui/Modal";
import { useNotification } from "../ui/Notification";

// Styles pour le modal de suppression
const WarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem 0;
`;

const WarningText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-weight: 500;
  font-size: 1.1rem;
  text-align: center;
`;

const WarningDescription = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 1rem;
  text-align: center;
`;

const StepContainer = styled.div`
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ConfirmInput = styled.input`
  padding: 0.75rem;
  border: 1px solid
    ${({ theme, error }) => (error ? theme.colors.error : theme.colors.border)};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  width: 100%;
  font-size: 1rem;
  margin-top: 0.5rem;

  &:focus {
    outline: none;
    border-color: ${({ theme, error }) =>
      error ? theme.colors.error : theme.colors.primary};
    box-shadow: 0 0 0 2px
      ${({ theme, error }) =>
        error ? `${theme.colors.error}33` : `${theme.colors.primary}33`};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 1.5rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: ${({ fullWidth }) => (fullWidth ? "100%" : "auto")};

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CancelButton = styled(Button)`
  background-color: transparent;
  border: 1px solid ${({ theme }) => theme.colors.border};
  color: ${({ theme }) => theme.colors.text.primary};

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.background};
  }
`;

const DeleteButton = styled(Button)`
  background-color: ${({ theme }) => theme.colors.error};
  border: none;
  color: white;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => `${theme.colors.error}dd`};
  }
`;

const CheckboxContainer = styled.label`
  display: flex;
  align-items: center;
  margin: 0.5rem 0;
  cursor: pointer;

  input {
    margin-right: 0.5rem;
  }
`;

// Composant de modal de suppression de compte
const DeleteAccountModal = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [confirmText, setConfirmText] = useState("");
  const [checks, setChecks] = useState({
    understand: false,
    cannotRevert: false,
  });
  const [isLoading, setIsLoading] = useState(false);

  const { requestAccountDeletion } = useAuth();
  const { showNotification } = useNotification();

  // Fonction pour gérer les changements de checkboxes
  const handleCheckChange = (e) => {
    const { name, checked } = e.target;
    setChecks((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  // Fonction pour passer à l'étape suivante
  const goToNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  // Fonction pour réinitialiser le modal
  const resetModal = () => {
    setCurrentStep(1);
    setConfirmText("");
    setChecks({
      understand: false,
      cannotRevert: false,
    });
    setIsLoading(false);
  };

  // Fonction pour fermer le modal
  const handleClose = () => {
    resetModal();
    onClose();
  };

  // Fonction pour gérer la demande de suppression de compte
  const handleDeleteRequest = async () => {
    setIsLoading(true);

    try {
      const result = await requestAccountDeletion();

      if (result.success) {
        showNotification({
          type: "success",
          title: "Demande envoyée",
          message:
            "Un email de confirmation a été envoyé à votre adresse email. Veuillez suivre les instructions pour finaliser la suppression de votre compte.",
        });
        handleClose();
      } else {
        showNotification({
          type: "error",
          title: "Erreur",
          message:
            result.message ||
            "Une erreur est survenue lors de la demande de suppression.",
        });
      }
    } catch (error) {
      showNotification({
        type: "error",
        title: "Erreur",
        message:
          "Une erreur inattendue est survenue. Veuillez réessayer plus tard.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Vérifier si le texte de confirmation est valide
  const isConfirmTextValid =
    confirmText.toLowerCase() === "supprimer mon compte";

  // Vérifier si tous les checks sont cochés
  const areAllChecksValid = Object.values(checks).every(
    (check) => check === true
  );

  // Rendu du contenu en fonction de l'étape actuelle
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContainer>
            <WarningText>
              Attention : Cette action est irréversible !
            </WarningText>
            <WarningDescription>
              La suppression de votre compte entraînera la perte permanente de :
            </WarningDescription>

            <ul>
              <li>Toutes vos données personnelles</li>
              <li>Vos plannings et historique</li>
              <li>Vos préférences et paramètres</li>
              <li>Votre accès à l'application</li>
            </ul>

            <CheckboxContainer>
              <input
                type="checkbox"
                name="understand"
                checked={checks.understand}
                onChange={handleCheckChange}
              />
              Je comprends que mes données seront définitivement supprimées
            </CheckboxContainer>

            <CheckboxContainer>
              <input
                type="checkbox"
                name="cannotRevert"
                checked={checks.cannotRevert}
                onChange={handleCheckChange}
              />
              Je comprends que cette action ne peut pas être annulée
            </CheckboxContainer>

            <ButtonGroup>
              <CancelButton onClick={handleClose}>Annuler</CancelButton>
              <DeleteButton
                onClick={goToNextStep}
                disabled={!areAllChecksValid}
              >
                Continuer
              </DeleteButton>
            </ButtonGroup>
          </StepContainer>
        );

      case 2:
        return (
          <StepContainer>
            <WarningText>Confirmation finale</WarningText>
            <WarningDescription>
              Pour confirmer la suppression de votre compte, veuillez saisir
              "supprimer mon compte" ci-dessous.
            </WarningDescription>

            <div>
              <ConfirmInput
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="supprimer mon compte"
                error={confirmText && !isConfirmTextValid}
              />
            </div>

            <WarningDescription>
              Un email contenant un lien de confirmation vous sera envoyé. Vous
              devrez cliquer sur ce lien pour finaliser la suppression de votre
              compte.
            </WarningDescription>

            <ButtonGroup>
              <CancelButton onClick={handleClose}>Annuler</CancelButton>
              <DeleteButton
                onClick={handleDeleteRequest}
                disabled={!isConfirmTextValid || isLoading}
              >
                {isLoading ? "Traitement en cours..." : "Supprimer mon compte"}
              </DeleteButton>
            </ButtonGroup>
          </StepContainer>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Supprimer votre compte"
      size="small"
    >
      <WarningContainer>{renderStepContent()}</WarningContainer>
    </Modal>
  );
};

export default DeleteAccountModal;
