import styled from "@emotion/styled";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  alpha,
  useTheme,
} from "@mui/material";
import { forwardRef } from "react";
import { FiAlertTriangle } from "react-icons/fi";

// Animation de transition pour le dialogue
const Transition = forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

// Styliser le dialogue
const StyledDialog = styled(Dialog)({
  "& .MuiDialog-paper": {
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
  },
});

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  backgroundColor: theme?.palette?.error?.main || "#f44336",
  color: theme?.palette?.error?.contrastText || "#fff",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "16px 24px",
}));

const IconContainer = styled("div")({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "24px",
  animation: "pulse 1.5s infinite",
  "@keyframes pulse": {
    "0%": {
      transform: "scale(1)",
    },
    "50%": {
      transform: "scale(1.1)",
    },
    "100%": {
      transform: "scale(1)",
    },
  },
});

const StyledDialogContent = styled(DialogContent)({
  padding: "24px",
});

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  padding: "16px 24px",
  borderTop: `1px solid ${alpha(theme?.palette?.divider || "#e0e0e0", 0.1)}`,
}));

const CancelButton = styled(Button)(({ theme }) => ({
  backgroundColor: alpha(theme?.palette?.error?.light || "#f77", 0.1),
  color: theme?.palette?.error?.main || "#f44336",
  "&:hover": {
    backgroundColor: alpha(theme?.palette?.error?.light || "#f77", 0.2),
  },
}));

const ConfirmButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme?.palette?.error?.main || "#f44336",
  color: theme?.palette?.error?.contrastText || "#fff",
  "&:hover": {
    backgroundColor: theme?.palette?.error?.dark || "#d32f2f",
  },
}));

/**
 * Dialogue de confirmation animé
 * @param {Object} props - Propriétés du composant
 * @param {boolean} props.open - État d'ouverture du dialogue
 * @param {function} props.onClose - Fonction appelée lors de la fermeture du dialogue
 * @param {function} props.onConfirm - Fonction appelée lors de la confirmation
 * @param {string} props.title - Titre du dialogue
 * @param {string} props.message - Message du dialogue
 * @param {string} props.confirmLabel - Libellé du bouton de confirmation
 * @param {string} props.cancelLabel - Libellé du bouton d'annulation
 */
const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title = "Confirmation",
  message = "Êtes-vous sûr de vouloir effectuer cette action ?",
  confirmLabel = "Confirmer",
  cancelLabel = "Annuler",
}) => {
  const theme = useTheme();

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <StyledDialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={onClose}
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
      maxWidth="xs"
      fullWidth
    >
      <StyledDialogTitle id="confirm-dialog-title" theme={theme}>
        <IconContainer>
          <FiAlertTriangle />
        </IconContainer>
        {title}
      </StyledDialogTitle>
      <StyledDialogContent>
        <DialogContentText id="confirm-dialog-description">
          {message}
        </DialogContentText>
      </StyledDialogContent>
      <StyledDialogActions theme={theme}>
        <CancelButton onClick={onClose} variant="text" theme={theme}>
          {cancelLabel}
        </CancelButton>
        <ConfirmButton
          onClick={handleConfirm}
          variant="contained"
          autoFocus
          theme={theme}
        >
          {confirmLabel}
        </ConfirmButton>
      </StyledDialogActions>
    </StyledDialog>
  );
};

export default ConfirmDialog;
