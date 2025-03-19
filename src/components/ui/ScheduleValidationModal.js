import { CircularProgress } from "@mui/material";
import React, { Suspense } from "react";

// Import dynamique pour éviter les problèmes de dépendances
const ScheduleValidationModal = React.lazy(() =>
  import("../schedule/ScheduleValidationModal")
);

/**
 * Wrapper pour le composant de validation de planning
 * Permet de charger le composant de manière dynamique et de gérer le fallback
 */
const ScheduleValidationModalWrapper = (props) => {
  return (
    <Suspense
      fallback={
        <CircularProgress
          size={40}
          sx={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />
      }
    >
      <ScheduleValidationModal {...props} />
    </Suspense>
  );
};

export default ScheduleValidationModalWrapper;
