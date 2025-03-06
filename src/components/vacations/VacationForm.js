import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { VACATION_TYPES } from "../../config/constants";
import { useAuth } from "../../contexts/AuthContext";
import useEmployees from "../../hooks/useEmployees";
import { getWorkingDaysCount } from "../../utils/dateUtils";

const FormContainer = styled.form`
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

const Select = styled.select`
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

const FileInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme }) => theme.colors.background.secondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s;
  max-width: fit-content;

  &:hover {
    background-color: ${({ theme }) => theme.colors.background.hover};
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const FileName = styled.div`
  font-size: 0.875rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: 0.5rem;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.error};
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${({ theme, variant }) =>
    variant === "primary"
      ? theme.colors.primary
      : variant === "error"
      ? theme.colors.error
      : "transparent"};
  color: ${({ theme, variant }) =>
    variant === "primary" || variant === "error"
      ? "white"
      : theme.colors.text.primary};
  border: ${({ theme, variant }) =>
    variant === "outline" ? `1px solid ${theme.colors.border}` : "none"};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: ${({ theme, variant }) =>
      variant === "primary"
        ? `${theme.colors.primary}dd`
        : variant === "error"
        ? `${theme.colors.error}dd`
        : `${theme.colors.border}33`};
  }
`;

const DaysCount = styled.div`
  background-color: ${({ theme }) => `${theme.colors.info}22`};
  color: ${({ theme }) => theme.colors.info};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-top: 1rem;
  font-size: 0.875rem;
  border-left: 3px solid ${({ theme }) => theme.colors.info};
`;

const QuotaWarning = styled.div`
  background-color: ${({ theme }) => `${theme.colors.warning}22`};
  color: ${({ theme }) => theme.colors.warning};
  padding: 1rem;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-top: 1rem;
  font-size: 0.875rem;
  border-left: 3px solid ${({ theme }) => theme.colors.warning};
`;

const VacationForm = ({ vacation, onSubmit, onCancel, currentUser }) => {
  const { user } = useAuth();
  const { employees, loading: loadingEmployees } = useEmployees();
  const [formData, setFormData] = useState({
    employeeId: vacation?.employeeId || user?.id || "",
    type: vacation?.type || "paid",
    startDate: vacation?.startDate || "",
    endDate: vacation?.endDate || "",
    reason: vacation?.reason || "",
    attachment: vacation?.attachment || null,
  });
  const [errors, setErrors] = useState({});
  const [fileName, setFileName] = useState("");
  const [daysCount, setDaysCount] = useState(0);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Calculer le nombre de jours entre les dates sélectionnées
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);

      // Vérifier que la date de fin est après la date de début
      if (end < start) {
        setErrors((prev) => ({
          ...prev,
          endDate: "La date de fin doit être après la date de début",
        }));
        setDaysCount(0);
        return;
      }

      // Calculer le nombre de jours ouvrés
      const count = getWorkingDaysCount(start, end);
      setDaysCount(count);
      setErrors((prev) => ({ ...prev, endDate: null }));

      // Vérifier si le quota est dépassé (uniquement pour les congés payés et RTT)
      if (formData.type === "paid" || formData.type === "rtt") {
        const vacationType = VACATION_TYPES.find(
          (t) => t.value === formData.type
        );
        const defaultQuota = vacationType ? vacationType.defaultQuota : 0;

        // TODO: Récupérer le quota restant de l'employé depuis l'API
        // Pour l'instant, on utilise le quota par défaut
        const remainingQuota = defaultQuota;

        setQuotaExceeded(count > remainingQuota);
      } else {
        setQuotaExceeded(false);
      }
    } else {
      setDaysCount(0);
      setQuotaExceeded(false);
    }
  }, [formData.startDate, formData.endDate, formData.type]);

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Effacer l'erreur lorsque l'utilisateur modifie le champ
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors]
  );

  const handleFileChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      setFileName(file.name);
      setFormData((prev) => ({
        ...prev,
        attachment: file,
      }));
    }
  }, []);

  // Valider le formulaire avant soumission
  const validateForm = () => {
    const newErrors = {};

    // Vérifier l'employé
    if (!formData.employeeId) {
      newErrors.employeeId = "Veuillez sélectionner un employé";
    }

    // Vérifier le type de congé
    if (!formData.type) {
      newErrors.type = "Veuillez sélectionner un type de congé";
    }

    // Vérifier les dates
    if (!formData.startDate) {
      newErrors.startDate = "La date de début est requise";
    } else {
      // Vérifier que la date est valide
      const startDate = new Date(formData.startDate);
      if (isNaN(startDate.getTime())) {
        newErrors.startDate = "Date de début invalide";
      }
    }

    if (!formData.endDate) {
      newErrors.endDate = "La date de fin est requise";
    } else {
      // Vérifier que la date est valide
      const endDate = new Date(formData.endDate);
      if (isNaN(endDate.getTime())) {
        newErrors.endDate = "Date de fin invalide";
      }
    }

    // Vérifier que la date de fin est après la date de début
    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate);
      const endDate = new Date(formData.endDate);

      if (
        !isNaN(startDate.getTime()) &&
        !isNaN(endDate.getTime()) &&
        endDate < startDate
      ) {
        newErrors.endDate = "La date de fin doit être après la date de début";
      }
    }

    // Vérifier la raison si c'est un congé sans solde
    if (formData.type === "unpaid" && !formData.reason) {
      newErrors.reason = "Une raison est requise pour les congés sans solde";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      "Tentative de soumission du formulaire avec les données:",
      formData
    );

    // Valider le formulaire
    if (!validateForm()) {
      console.error("Validation du formulaire échouée:", errors);
      return;
    }

    // Vérifier que l'utilisateur est authentifié
    if (!currentUser) {
      console.error("Erreur: utilisateur non authentifié");
      toast.error("Vous devez être connecté pour soumettre ce formulaire");
      return;
    }

    // Formater les données pour l'API
    const formattedData = {
      ...formData,
      // Convertir l'ID en nombre si nécessaire
      employeeId: formData.employeeId ? String(formData.employeeId) : "",
      // S'assurer que les dates sont au format YYYY-MM-DD
      startDate: formData.startDate,
      endDate: formData.endDate,
      // S'assurer que le type est une chaîne valide
      type: formData.type || "paid",
      // S'assurer que la raison est une chaîne
      reason: formData.reason || "",
    };

    console.log("Données soumises:", formattedData);
    onSubmit(formattedData);
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {user?.role !== "employee" && (
        <FormGroup>
          <Label htmlFor="employeeId">Employé</Label>
          <Select
            id="employeeId"
            name="employeeId"
            value={formData.employeeId}
            onChange={handleChange}
            disabled={loadingEmployees}
          >
            <option value="">Sélectionner un employé</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.first_name} {employee.last_name}
              </option>
            ))}
          </Select>
          {errors.employeeId && (
            <ErrorMessage>{errors.employeeId}</ErrorMessage>
          )}
        </FormGroup>
      )}

      <FormGroup>
        <Label htmlFor="type">Type de congé</Label>
        <Select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
        >
          {VACATION_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </Select>
        {errors.type && <ErrorMessage>{errors.type}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="startDate">Date de début</Label>
        <Input
          id="startDate"
          name="startDate"
          type="date"
          value={formData.startDate}
          onChange={handleChange}
        />
        {errors.startDate && <ErrorMessage>{errors.startDate}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label htmlFor="endDate">Date de fin</Label>
        <Input
          id="endDate"
          name="endDate"
          type="date"
          value={formData.endDate}
          onChange={handleChange}
        />
        {errors.endDate && <ErrorMessage>{errors.endDate}</ErrorMessage>}
      </FormGroup>

      {daysCount > 0 && (
        <DaysCount>
          Cette demande représente{" "}
          <strong>
            {daysCount} jour{daysCount > 1 ? "s" : ""} ouvré
            {daysCount > 1 ? "s" : ""}
          </strong>{" "}
          de congé.
        </DaysCount>
      )}

      {quotaExceeded && (
        <QuotaWarning>
          Attention : cette demande dépasse votre quota de congés disponibles.
        </QuotaWarning>
      )}

      <FormGroup>
        <Label htmlFor="reason">Motif (facultatif)</Label>
        <Textarea
          id="reason"
          name="reason"
          value={formData.reason}
          onChange={handleChange}
          placeholder="Précisez le motif de votre demande de congé..."
        />
      </FormGroup>

      <FormGroup>
        <Label>
          Pièce jointe (facultatif
          {formData.type === "sick" ? " mais recommandé" : ""})
        </Label>
        <FileInput>
          <FileInputLabel htmlFor="attachment">
            Choisir un fichier
          </FileInputLabel>
          <HiddenFileInput
            id="attachment"
            name="attachment"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
          />
          {fileName && <FileName>{fileName}</FileName>}
          {errors.attachment && (
            <ErrorMessage>{errors.attachment}</ErrorMessage>
          )}
        </FileInput>
      </FormGroup>

      <FormActions>
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit" variant="primary">
          {vacation ? "Modifier" : "Soumettre"}
        </Button>
      </FormActions>
    </FormContainer>
  );
};

export default memo(VacationForm);
