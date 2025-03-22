import { Box, Paper, Typography } from "@mui/material";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const UpcomingVacationItem = ({ vacation }) => (
  <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
    <Typography
      variant="subtitle1"
      component="div"
      sx={{ fontWeight: "bold", mb: 0.5 }}
    >
      {vacation.employee_name ||
        (vacation.employee &&
          `${vacation.employee.first_name || ""} ${
            vacation.employee.last_name || ""
          }`.trim()) ||
        `Employé #${vacation.employee_id}`}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {format(new Date(vacation.start_date), "dd MMMM yyyy", { locale: fr })} -{" "}
      {format(new Date(vacation.end_date), "dd MMMM yyyy", { locale: fr })}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {vacation.type === "paid"
        ? "Congé payé"
        : vacation.type === "unpaid"
        ? "Congé sans solde"
        : vacation.type === "sick"
        ? "Congé maladie"
        : "Autre"}
    </Typography>
  </Paper>
);

const UpcomingVacations = ({ vacations = [] }) => {
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Prochains congés
      </Typography>
      {vacations.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          Aucun congé à venir
        </Typography>
      ) : (
        vacations.map((vacation) => (
          <UpcomingVacationItem key={vacation.id} vacation={vacation} />
        ))
      )}
    </Box>
  );
};

export default UpcomingVacations;
