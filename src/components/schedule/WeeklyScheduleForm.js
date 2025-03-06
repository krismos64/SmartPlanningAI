import { format } from "date-fns";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import useEmployees from "../../hooks/useEmployees";
import useWeeklySchedules from "../../hooks/useWeeklySchedules";
import { getWeekStart } from "../../utils/dateUtils";
import WeeklyScheduleGrid from "./WeeklyScheduleGrid";

const WeeklyScheduleForm = ({ onSubmit, onCancel }) => {
  // Initialiser avec la date de début de la semaine courante
  const currentWeekStart = format(getWeekStart(new Date()), "yyyy-MM-dd");

  const [formData, setFormData] = useState({
    employeeId: "",
    weekStart: currentWeekStart,
    scheduleData: {},
  });

  const { employees, loading: employeesLoading } = useEmployees();
  const { createSchedule } = useWeeklySchedules();

  // S'assurer que weekStart est toujours défini
  useEffect(() => {
    if (!formData.weekStart) {
      setFormData((prev) => ({
        ...prev,
        weekStart: currentWeekStart,
      }));
    }
  }, [currentWeekStart]);

  const handleEmployeeChange = (event) => {
    const selectedEmployeeId = event.target.value;
    setFormData((prev) => ({
      ...prev,
      employeeId: selectedEmployeeId,
    }));
  };

  const handleWeekStartChange = (event) => {
    setFormData((prev) => ({
      ...prev,
      weekStart: event.target.value,
    }));
  };

  const handleScheduleChange = (newScheduleData) => {
    console.log("Nouvelles données de planning reçues:", newScheduleData);
    setFormData((prev) => ({
      ...prev,
      scheduleData: newScheduleData,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      if (!formData.employeeId) {
        toast.error("Veuillez sélectionner un employé");
        return;
      }

      if (!formData.weekStart) {
        toast.error("Veuillez sélectionner une date de début de semaine");
        return;
      }

      console.log("Données du formulaire à soumettre:", formData);

      // Créer le planning
      const result = await createSchedule({
        employeeId: formData.employeeId,
        weekStart: formData.weekStart,
        scheduleData: formData.scheduleData,
      });

      if (result.success) {
        toast.success("Planning créé avec succès");
        if (onSubmit) onSubmit(result.schedule);
      } else {
        toast.error(`Erreur: ${result.message}`);
      }
    } catch (error) {
      console.error("Erreur lors de la création du planning:", error);
      toast.error("Erreur lors de la création du planning");
    }
  };

  if (employeesLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="employee"
            className="block text-sm font-medium text-gray-700"
          >
            Employé
          </label>
          <select
            id="employee"
            name="employee"
            value={formData.employeeId}
            onChange={handleEmployeeChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Sélectionner un employé</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.firstName} {employee.lastName}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="weekStart"
            className="block text-sm font-medium text-gray-700"
          >
            Début de semaine
          </label>
          <input
            type="date"
            id="weekStart"
            name="weekStart"
            value={formData.weekStart}
            onChange={handleWeekStartChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          />
        </div>
      </div>

      <div className="mt-6">
        <WeeklyScheduleGrid
          scheduleData={[
            {
              employeeId: formData.employeeId,
              days: Object.entries(formData.scheduleData).map(
                ([day, data]) => ({
                  day,
                  ...data,
                })
              ),
            },
          ]}
          onScheduleChange={handleScheduleChange}
        />
      </div>

      <div className="mt-6 flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Créer le planning
        </button>
      </div>
    </form>
  );
};

WeeklyScheduleForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

export default WeeklyScheduleForm;
