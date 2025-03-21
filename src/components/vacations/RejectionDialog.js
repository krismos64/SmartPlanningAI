import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  alpha,
} from "@mui/material";
import { useState } from "react";
import { useTheme as useThemeProvider } from "../../components/ThemeProvider";

/**
 * Composant de dialogue pour le rejet d'une demande de congés
 */
const RejectionDialog = ({ open, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const { theme: themeMode } = useThemeProvider();
  const isDarkMode = themeMode === "dark";

  const handleConfirm = () => {
    onConfirm(reason);
    setReason("");
  };

  const handleCancel = () => {
    onClose();
    setReason("");
  };

  return (
    <Dialog
      open={open}
      onClose={handleCancel}
      PaperProps={{
        style: {
          backgroundColor: isDarkMode ? "#1F2937" : "#FFFFFF",
          color: isDarkMode ? "#D1D5DB" : "inherit",
          boxShadow: isDarkMode
            ? `0 4px 20px ${alpha("#000", 0.4)}`
            : `0 4px 20px ${alpha("#000", 0.1)}`,
          borderRadius: "8px",
        },
      }}
    >
      <DialogTitle
        sx={{
          color: isDarkMode ? "#F9FAFB" : "inherit",
          borderBottom: `1px solid ${
            isDarkMode ? alpha("#6B7280", 0.2) : alpha("#E5E7EB", 0.8)
          }`,
        }}
      >
        Motif de rejet
      </DialogTitle>

      <DialogContent sx={{ mt: 2 }}>
        <DialogContentText
          sx={{
            color: isDarkMode ? "#9CA3AF" : "#4B5563",
            mb: 2,
          }}
        >
          Veuillez indiquer la raison pour laquelle vous rejetez cette demande
          de congé.
        </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          id="reason"
          label="Motif du rejet"
          type="text"
          fullWidth
          multiline
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          variant="outlined"
          InputLabelProps={{
            style: {
              color: isDarkMode ? "#9CA3AF" : undefined,
            },
          }}
          InputProps={{
            style: {
              color: isDarkMode ? "#D1D5DB" : undefined,
              backgroundColor: isDarkMode ? alpha("#111827", 0.4) : undefined,
            },
          }}
        />
      </DialogContent>

      <DialogActions
        sx={{
          p: 2,
          borderTop: `1px solid ${
            isDarkMode ? alpha("#6B7280", 0.2) : alpha("#E5E7EB", 0.8)
          }`,
        }}
      >
        <Button
          onClick={handleCancel}
          sx={{
            color: isDarkMode ? "#9CA3AF" : "#6B7280",
            "&:hover": {
              backgroundColor: isDarkMode
                ? alpha("#6B7280", 0.1)
                : alpha("#6B7280", 0.05),
            },
          }}
        >
          Annuler
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          sx={{
            transition: "all 0.2s ease",
            backgroundColor: isDarkMode ? "#EF4444" : undefined,
            "&:hover": {
              backgroundColor: isDarkMode ? "#DC2626" : undefined,
              transform: "scale(1.03)",
            },
          }}
        >
          Confirmer le rejet
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionDialog;
