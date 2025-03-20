import { memo, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import styled from "styled-components";
import { EMPLOYEE_STATUSES } from "../../config/constants";
import { Button } from "../ui";
import { FormInput, FormSelect } from "../ui/Form";

// Style pour la section d'information en haut du formulaire
const FormInfo = styled.div`
  padding: 1rem;
  background-color: #f8f9fa;
  border-left: 4px solid #3f51b5;
  margin-bottom: 1.5rem;
  border-radius: 4px;
`;

const RequiredInfo = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin: 0;

  span {
    color: #e53935;
    font-weight: 500;
  }
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const FormSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h4`
  margin-top: 0;
  margin-bottom: 1rem;
  color: #3f51b5;
  font-weight: 500;
  border-bottom: 1px solid #e0e0e0;
  padding-bottom: 0.5rem;
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

const ValidationError = styled.div`
  color: #e53935;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const EmployeeForm = ({ employee, onSubmit, onDelete }) => {
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [showSaveConfirmation, setShowSaveConfirmation] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

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
      setErrors({});
      setTouched({});
    }
  }, [employee]);

  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};

    // Validation du prénom
    if (!formData.first_name.trim()) {
      newErrors.first_name = "Le prénom est obligatoire";
    } else if (formData.first_name.length < 2) {
      newErrors.first_name = "Le prénom doit contenir au moins 2 caractères";
    }

    // Validation du nom
    if (!formData.last_name.trim()) {
      newErrors.last_name = "Le nom est obligatoire";
    } else if (formData.last_name.length < 2) {
      newErrors.last_name = "Le nom doit contenir au moins 2 caractères";
    }

    // Validation de l'email (si fourni)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    // Validation du téléphone (si fourni)
    if (
      formData.phone &&
      !/^(\+\d{1,3})?[\s-]?\d{6,14}$/.test(formData.phone)
    ) {
      newErrors.phone = "Format de téléphone invalide";
    }

    // Validation du code postal (si fourni)
    if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
      newErrors.zipCode = "Le code postal doit contenir 5 chiffres";
    }

    // Validation des heures contractuelles
    if (formData.contractHours < 0) {
      newErrors.contractHours =
        "Les heures contractuelles ne peuvent pas être négatives";
    } else if (formData.contractHours > 50) {
      newErrors.contractHours =
        "Les heures contractuelles ne peuvent pas dépasser 50 heures";
    }

    // Validation du statut
    if (!formData.status) {
      newErrors.status = "Le statut est obligatoire";
    }

    // Validation de la date d'embauche
    if (!formData.hire_date) {
      newErrors.hire_date = "La date d'embauche est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Effacer l'erreur lorsque le champ est modifié
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: undefined,
        }));
      }
    },
    [errors]
  );

  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({ ...prev, [name]: true }));

      // Valider le champ spécifique lors de la perte de focus
      validateField(name);
    },
    [formData]
  );

  const validateField = (fieldName) => {
    switch (fieldName) {
      case "first_name":
        if (!formData.first_name.trim()) {
          setErrors((prev) => ({
            ...prev,
            first_name: "Le prénom est obligatoire",
          }));
        } else if (formData.first_name.length < 2) {
          setErrors((prev) => ({
            ...prev,
            first_name: "Le prénom doit contenir au moins 2 caractères",
          }));
        } else {
          setErrors((prev) => ({ ...prev, first_name: undefined }));
        }
        break;

      case "last_name":
        if (!formData.last_name.trim()) {
          setErrors((prev) => ({
            ...prev,
            last_name: "Le nom est obligatoire",
          }));
        } else if (formData.last_name.length < 2) {
          setErrors((prev) => ({
            ...prev,
            last_name: "Le nom doit contenir au moins 2 caractères",
          }));
        } else {
          setErrors((prev) => ({ ...prev, last_name: undefined }));
        }
        break;

      case "email":
        if (
          formData.email &&
          !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
        ) {
          setErrors((prev) => ({ ...prev, email: "Format d'email invalide" }));
        } else {
          setErrors((prev) => ({ ...prev, email: undefined }));
        }
        break;

      case "phone":
        if (
          formData.phone &&
          !/^(\+\d{1,3})?[\s-]?\d{6,14}$/.test(formData.phone)
        ) {
          setErrors((prev) => ({
            ...prev,
            phone: "Format de téléphone invalide",
          }));
        } else {
          setErrors((prev) => ({ ...prev, phone: undefined }));
        }
        break;

      case "zipCode":
        if (formData.zipCode && !/^\d{5}$/.test(formData.zipCode)) {
          setErrors((prev) => ({
            ...prev,
            zipCode: "Le code postal doit contenir 5 chiffres",
          }));
        } else {
          setErrors((prev) => ({ ...prev, zipCode: undefined }));
        }
        break;

      case "contractHours":
        if (formData.contractHours < 0) {
          setErrors((prev) => ({
            ...prev,
            contractHours:
              "Les heures contractuelles ne peuvent pas être négatives",
          }));
        } else if (formData.contractHours > 50) {
          setErrors((prev) => ({
            ...prev,
            contractHours:
              "Les heures contractuelles ne peuvent pas dépasser 50 heures",
          }));
        } else {
          setErrors((prev) => ({ ...prev, contractHours: undefined }));
        }
        break;

      default:
        break;
    }
  };

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();

      // Vérifier si le token est présent
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Veuillez vous connecter pour accéder à cette page.");
        return;
      }

      // Marquer tous les champs comme touchés pour afficher toutes les erreurs
      const allFields = Object.keys(formData);
      const touchedFields = allFields.reduce((acc, field) => {
        acc[field] = true;
        return acc;
      }, {});
      setTouched(touchedFields);

      // Valider le formulaire
      const isValid = validateForm();

      if (!isValid) {
        toast.error("Veuillez corriger les erreurs dans le formulaire.");
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
        <FormInfo>
          <RequiredInfo>
            Les champs marqués d'un <span>*</span> sont obligatoires.
          </RequiredInfo>
        </FormInfo>

        <FormSection>
          <SectionTitle>Informations personnelles</SectionTitle>
          <FormGrid>
            <FormInput
              label="Prénom"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.first_name && errors.first_name}
              required
            />
            <FormInput
              label="Nom"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.last_name && errors.last_name}
              required
            />
            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.email && errors.email}
              helpText="Format: exemple@domaine.com"
            />
            <FormInput
              label="Téléphone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.phone && errors.phone}
              helpText="Format: +33612345678 ou 0612345678"
            />
            <FormInput
              label="Date de naissance"
              name="birthdate"
              type="date"
              value={formData.birthdate}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.birthdate && errors.birthdate}
              helpText="Facultatif"
            />
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>Adresse</SectionTitle>
          <FormGrid>
            <FormInput
              label="Adresse"
              name="address"
              value={formData.address}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.address && errors.address}
              helpText="Facultatif"
            />
            <FormInput
              label="Ville"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.city && errors.city}
              helpText="Facultatif"
            />
            <FormInput
              label="Code postal"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.zipCode && errors.zipCode}
              helpText="Format: 75001 (5 chiffres)"
            />
          </FormGrid>
        </FormSection>

        <FormSection>
          <SectionTitle>Informations professionnelles</SectionTitle>
          <FormGrid>
            <FormInput
              label="Département"
              name="department"
              value={formData.department}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.department && errors.department}
              helpText="Facultatif"
            />
            <FormInput
              label="Rôle"
              name="role"
              value={formData.role}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.role && errors.role}
              helpText="Facultatif"
            />
            <FormInput
              label="Heures contractuelles"
              name="contractHours"
              type="number"
              min="0"
              max="50"
              step="0.5"
              value={formData.contractHours}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.contractHours && errors.contractHours}
              helpText="Nombre d'heures hebdomadaires (max 50h)"
              required
            />
            <FormSelect
              label="Statut"
              name="status"
              value={formData.status}
              onChange={handleChange}
              onBlur={handleBlur}
              error={touched.status && errors.status}
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
              onBlur={handleBlur}
              error={touched.hire_date && errors.hire_date}
              required
            />
          </FormGrid>
        </FormSection>

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
