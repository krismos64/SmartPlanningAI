import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";
import { Button, Modal } from "../ui";
import { useNotification } from "../ui/Notification";

// Composants stylisés pour le contenu du modal
const ModalContent = styled.div`
  padding: 1rem 0;
`;

const WarningText = styled.p`
  color: ${({ theme }) => theme.colors.error};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  margin-bottom: 1.5rem;
`;

const Description = styled.p`
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const DeleteAccountModal = ({ $isOpen = false, onClose }) => {
  const { deleteAccount } = useAuth();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();

      showNotification({
        type: "success",
        message: "Votre compte a été supprimé avec succès",
      });

      navigate("/login");
    } catch (error) {
      console.error("Erreur lors de la suppression du compte:", error);

      showNotification({
        type: "error",
        message: "Erreur lors de la suppression du compte. Veuillez réessayer.",
      });
    } finally {
      setIsDeleting(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={$isOpen}
      onClose={onClose}
      title="Supprimer le compte"
      size="small"
    >
      <ModalContent>
        <WarningText>Attention : Cette action est irréversible.</WarningText>
        <Description>
          Êtes-vous sûr de vouloir supprimer votre compte ? Toutes vos données
          seront définitivement supprimées et ne pourront pas être récupérées.
        </Description>
        <ButtonGroup>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Annuler
          </Button>
          <Button
            variant="danger"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting
              ? "Suppression en cours..."
              : "Confirmer la suppression"}
          </Button>
        </ButtonGroup>
      </ModalContent>
    </Modal>
  );
};

export default DeleteAccountModal;
