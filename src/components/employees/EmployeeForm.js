import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { EMPLOYEE_STATUSES } from "../../config/constants";
import { Button } from "../ui";
import { FormInput, FormSelect } from "../ui/Form";

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const ConfirmationModal = styled.div`
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
`;

const ConfirmationContent = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const ConfirmationTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const ConfirmationText = styled.p`
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const ConfirmationActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
`;

const EmployeeForm = ({ employee, onSubmit, onDelete }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);

  // Fonction pour formater les dates ISO en format YYYY-MM-DD
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    try {
      // Si la date est déjà au format YYYY-MM-DD, la retourner telle quelle
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
      }
      // Sinon, convertir la date ISO en format YYYY-MM-DD
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error);
      return "";
    }
  };

  const initialFormData = {
    first_name: employee?.first_name || "",
    last_name: employee?.last_name || "",
    email: employee?.email || "",
    phone: employee?.phone || "",
    address: employee?.address || "",
    city: employee?.city || "",
    zipCode: employee?.zip_code || "",
    department: employee?.department || "",
    role: employee?.role || "",
    status: employee?.status || "active",
    birthdate: formatDateForInput(employee?.birthdate) || "",
    hire_date:
      formatDateForInput(employee?.hire_date) ||
      formatDateForInput(new Date().toISOString()),
    contractHours: employee?.contractHours ?? 35,
  };

  const [formData, setFormData] = useState(initialFormData);

  useEffect(() => {
    // Mettre à jour le formulaire quand l'employé change
    if (employee) {
      setFormData({
        first_name: employee.first_name || "",
        last_name: employee.last_name || "",
        email: employee.email || "",
        phone: employee.phone || "",
        address: employee.address || "",
        city: employee.city || "",
        zipCode: employee.zip_code || "",
        department: employee.department || "",
        role: employee.role || "",
        status: employee.status || "active",
        birthdate: formatDateForInput(employee.birthdate) || "",
        hire_date:
          formatDateForInput(employee.hire_date) ||
          formatDateForInput(new Date().toISOString()),
        contractHours: employee.contractHours ?? 35,
      });
    }
  }, [employee]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter pour accéder à cette page.");
        return;
      }

      // Si c'est une modification, demander confirmation
      if (employee) {
        setShowSaveConfirmation(true);
      } else {
        // Si c'est une création, soumettre directement
        console.log("Données du formulaire à soumettre:", formData);
        onSubmit(formData);
      }
    },
    [formData, onSubmit, employee]
  );

  const confirmSave = useCallback(() => {
    // Vérifier si le token est présent
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Veuillez vous connecter pour accéder à cette page.");
      setShowSaveConfirmation(false);
      return;
    }

    console.log("Données du formulaire à soumettre:", formData);
    onSubmit(formData);
    setShowSaveConfirmation(false);
  }, [formData, onSubmit]);

  const cancelSave = useCallback(() => {
    setShowSaveConfirmation(false);
  }, []);

  const handleDeleteClick = useCallback(() => {
    // Vérifier si le token est présent
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Veuillez vous connecter pour accéder à cette page.");
      return;
    }

    setShowDeleteConfirmation(true);
  }, []);

  const confirmDelete = useCallback(() => {
    // Vérifier si le token est présent
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Veuillez vous connecter pour accéder à cette page.");
      setShowDeleteConfirmation(false);
      return;
    }

    if (onDelete) onDelete();
    setShowDeleteConfirmation(false);
  }, [onDelete]);

  const cancelDelete = useCallback(() => {
    setShowDeleteConfirmation(false);
  }, []);

  return (
    <>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <FormInput
            label="Prénom"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Nom"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Téléphone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Adresse"
            name="address"
            value={formData.address}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Ville"
            name="city"
            value={formData.city}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Code postal"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Date de naissance"
            name="birthdate"
            type="date"
            value={formData.birthdate}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Département"
            name="department"
            value={formData.department}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Rôle"
            name="role"
            value={formData.role}
            onChange={handleChange}
            helpText="Facultatif"
          />
          <FormInput
            label="Heures contractuelles"
            name="contractHours"
            type="number"
            min="0"
            step="0.5"
            value={formData.contractHours}
            onChange={handleChange}
            helpText="Nombre d'heures hebdomadaires"
          />
          <FormSelect
            label="Statut"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
          >
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </FormSelect>
          <FormInput
            label="Date d'embauche"
            name="hire_date"
            type="date"
            value={formData.hire_date}
            onChange={handleChange}
            helpText="Facultatif"
          />
        </FormGrid>

        <FormActions>
          {onDelete && (
            <Button type="button" onClick={handleDeleteClick} variant="error">
              Supprimer
            </Button>
          )}
          <Button type="submit" variant="primary">
            {employee ? "Enregistrer" : "Ajouter"}
          </Button>
        </FormActions>
      </form>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirmation && (
        <ConfirmationModal>
          <ConfirmationContent>
            <ConfirmationTitle>Confirmer la suppression</ConfirmationTitle>
            <ConfirmationText>
              Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est
              irréversible.
            </ConfirmationText>
            <ConfirmationActions>
              <Button type="button" onClick={cancelDelete} variant="secondary">
                Annuler
              </Button>
              <Button type="button" onClick={confirmDelete} variant="error">
                Supprimer
              </Button>
            </ConfirmationActions>
          </ConfirmationContent>
        </ConfirmationModal>
      )}

      {/* Modal de confirmation d'enregistrement */}
      {showSaveConfirmation && (
        <ConfirmationModal>
          <ConfirmationContent>
            <ConfirmationTitle>Confirmer les modifications</ConfirmationTitle>
            <ConfirmationText>
              Êtes-vous sûr de vouloir enregistrer les modifications pour cet
              employé ?
            </ConfirmationText>
            <ConfirmationActions>
              <Button type="button" onClick={cancelSave} variant="secondary">
                Annuler
              </Button>
              <Button type="button" onClick={confirmSave} variant="primary">
                Enregistrer
              </Button>
            </ConfirmationActions>
          </ConfirmationContent>
        </ConfirmationModal>
      )}
    </>
  );
};

export default memo(EmployeeForm);
