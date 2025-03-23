import axios from "axios";
import { motion } from "framer-motion";
import moment from "moment";
import "moment/locale/fr";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import Lottie from "react-lottie";
import styled from "styled-components";
import { API_ENDPOINTS, API_URL } from "../../config/api";

// Initialiser moment en français
moment.locale("fr");

// Constants
const DAYS_OF_WEEK = [
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
  "Dimanche",
];

// Styles
const WizardContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const WizardCard = styled(motion.div)`
  width: 90%;
  max-width: 900px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  overflow-y: auto;
  max-height: 90vh;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 15px;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  color: #333;
  margin: 0;
`;

const StepsContainer = styled.div`
  display: flex;
  margin-bottom: 24px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
`;

const Step = styled.div`
  flex: 1;
  padding: 12px;
  text-align: center;
  position: relative;
  font-weight: ${(props) => (props.active ? "bold" : "normal")};
  color: ${(props) =>
    props.active ? "#4f46e5" : props.completed ? "#10b981" : "#9ca3af"};

  &::after {
    content: "";
    position: absolute;
    bottom: -21px;
    left: 0;
    right: 0;
    height: 3px;
    background-color: ${(props) =>
      props.active ? "#4f46e5" : props.completed ? "#10b981" : "#e5e7eb"};
    transition: background-color 0.3s ease;
  }
`;

const StepContent = styled.div`
  margin-bottom: 30px;
`;

const FormRow = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
  background-color: white;

  &:focus {
    outline: none;
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.2);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 30px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PrimaryButton = styled(Button)`
  background-color: #4f46e5;
  color: white;
  border: none;

  &:hover:not(:disabled) {
    background-color: #4338ca;
  }
`;

const SecondaryButton = styled(Button)`
  background-color: white;
  color: #4b5563;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background-color: #f9fafb;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;

  &:hover {
    color: #ef4444;
  }
`;

const ErrorMessage = styled.p`
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 5px;
`;

const TimeInputGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 10px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
  flex-direction: column;
`;

const LoadingText = styled.p`
  margin-top: 10px;
  font-weight: bold;
  color: #4f46e5;
`;

const Summary = styled.div`
  background: #f9fafb;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 20px;
`;

const SummaryItem = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
`;

const ScheduleCard = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 15px;
  background: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const SwitchContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
`;

const SwitchLabel = styled.label`
  margin-right: 10px;
  font-weight: 500;
`;

const Switch = styled.input`
  position: relative;
  appearance: none;
  width: 50px;
  height: 24px;
  background: #e5e7eb;
  border-radius: 50px;
  cursor: pointer;

  &::before {
    content: "";
    position: absolute;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    top: 2px;
    left: 2px;
    background: white;
    transition: all 0.3s;
  }

  &:checked {
    background: #4f46e5;
  }

  &:checked::before {
    left: 28px;
  }
`;

const SectionTitle = styled.h3`
  margin-top: 20px;
  margin-bottom: 15px;
  font-size: 1.2rem;
  color: #1f2937;
`;

const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const AutoScheduleWizard = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [employees, setEmployees] = useState([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSchedule, setGeneratedSchedule] = useState(null);
  const [animationData, setAnimationData] = useState(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useForm({
    defaultValues: {
      weekStartDate: moment().startOf("isoWeek").format("YYYY-MM-DD"),
      departmentId: "",
      businessHours: {
        monday: { start: "09:00", end: "17:00", enabled: true },
        tuesday: { start: "09:00", end: "17:00", enabled: true },
        wednesday: { start: "09:00", end: "17:00", enabled: true },
        thursday: { start: "09:00", end: "17:00", enabled: true },
        friday: { start: "09:00", end: "17:00", enabled: true },
        saturday: { start: "10:00", end: "15:00", enabled: false },
        sunday: { start: "10:00", end: "15:00", enabled: false },
      },
      preferences: {
        enforceBreaks: true,
        prioritizeExperience: true,
        distributeWeekends: true,
        respectMaxHours: true,
        avoidConsecutiveLateShifts: true,
      },
      saveDraft: true,
    },
  });

  // Animation configuration
  useEffect(() => {
    // Charger l'animation depuis le fichier public
    fetch("/animations/robot.json")
      .then((response) => response.json())
      .then((data) => {
        setAnimationData(data);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement de l'animation :", error);
      });
  }, []);

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoadingEmployees(true);
        const response = await axios.get("/api/employees");
        if (response.data) {
          // Vérifier la structure de la réponse et s'adapter
          if (response.data.employees) {
            // Format { success: true, employees: [...] }
            setEmployees(
              response.data.employees.filter((emp) => emp.status === "active")
            );
          } else if (Array.isArray(response.data)) {
            // Format direct array
            setEmployees(
              response.data.filter((emp) => emp.status === "active")
            );
          } else if (response.data.data && Array.isArray(response.data.data)) {
            // Format { success: true, data: [...] }
            setEmployees(
              response.data.data.filter((emp) => emp.status === "active")
            );
          } else {
            console.error("Format de réponse inattendu:", response.data);
            setEmployees([]);
          }
        } else {
          console.error("Aucune donnée reçue de l'API");
          setEmployees([]);
        }
      } catch (error) {
        console.error("Error fetching employees:", error);
        toast.error("Erreur lors du chargement des employés");
        setEmployees([]);
      } finally {
        setIsLoadingEmployees(false);
      }
    };

    fetchEmployees();
  }, []);

  // Navigation functions
  const nextStep = () => {
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  // Generate schedule
  const generateSchedule = async (data) => {
    try {
      setIsGenerating(true);

      const payload = {
        weekStartDate: data.weekStartDate,
        weekStart: data.weekStartDate, // ajout d'un alias pour la compatibilité
        departmentId: data.departmentId,
        businessHours: Object.entries(data.businessHours).reduce(
          (acc, [day, hours]) => {
            if (hours.enabled) {
              acc[day] = { start: hours.start, end: hours.end };
            }
            return acc;
          },
          {}
        ),
        preferences: data.preferences,
        saveDraft: data.saveDraft,
      };

      console.log("Envoi de la requête de génération de planning:", payload);

      // Utiliser API_URL et API_ENDPOINTS pour construire l'URL complète
      const url = `${API_URL}${API_ENDPOINTS.SCHEDULE.AUTO_GENERATE}`;
      console.log("URL de l'API pour la génération de planning:", url);

      const response = await axios.post(url, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data) {
        console.log("Réponse de l'API:", response.data);
        const scheduleData =
          response.data.data || response.data.schedule || response.data;
        setGeneratedSchedule(scheduleData);
        toast.success("Planning généré avec succès!");
        setCurrentStep(4); // Move to results step
      }
    } catch (error) {
      console.error("Error generating schedule:", error);
      toast.error(
        error.response?.data?.message ||
          "Erreur lors de la génération du planning"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  // Form submission
  const onSubmit = (data) => {
    if (currentStep < 3) {
      nextStep();
    } else {
      generateSchedule(data);
    }
  };

  // Render steps
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <StepContent>
            <SectionTitle>
              Sélectionnez la semaine et le département
            </SectionTitle>
            <FormRow>
              <Label>Date de début de semaine</Label>
              <Controller
                name="weekStartDate"
                control={control}
                rules={{ required: "Ce champ est requis" }}
                render={({ field }) => (
                  <Input
                    type="date"
                    {...field}
                    onChange={(e) => {
                      const date = e.target.value;
                      // Ensure it's a Monday (ISO week starts on Monday)
                      const selectedDate = moment(date);
                      const weekStart = selectedDate
                        .startOf("isoWeek")
                        .format("YYYY-MM-DD");
                      field.onChange(weekStart);
                    }}
                  />
                )}
              />
              {errors.weekStartDate && (
                <ErrorMessage>{errors.weekStartDate.message}</ErrorMessage>
              )}
            </FormRow>

            <FormRow>
              <Label>Département</Label>
              <Controller
                name="departmentId"
                control={control}
                rules={{ required: "Veuillez sélectionner un département" }}
                render={({ field }) => (
                  <Select {...field}>
                    <option value="">Sélectionnez un département</option>
                    <option value="all">Tous les départements</option>
                    <option value="1">Service client</option>
                    <option value="2">Logistique</option>
                    <option value="3">Administration</option>
                  </Select>
                )}
              />
              {errors.departmentId && (
                <ErrorMessage>{errors.departmentId.message}</ErrorMessage>
              )}
            </FormRow>
          </StepContent>
        );

      case 1:
        return (
          <StepContent>
            <SectionTitle>Configurez les horaires d'ouverture</SectionTitle>
            {DAYS_OF_WEEK.map((day, index) => {
              const dayKey = day.toLowerCase();
              return (
                <FormRow key={dayKey}>
                  <CheckboxContainer>
                    <Controller
                      name={`businessHours.${dayKey}.enabled`}
                      control={control}
                      render={({ field }) => (
                        <Checkbox
                          type="checkbox"
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          id={`${dayKey}-enabled`}
                        />
                      )}
                    />
                    <Label htmlFor={`${dayKey}-enabled`}>{day}</Label>
                  </CheckboxContainer>

                  {watch(`businessHours.${dayKey}.enabled`) && (
                    <TimeInputGroup>
                      <div>
                        <Label>Début</Label>
                        <Controller
                          name={`businessHours.${dayKey}.start`}
                          control={control}
                          rules={{
                            required: watch(`businessHours.${dayKey}.enabled`)
                              ? "Ce champ est requis"
                              : false,
                          }}
                          render={({ field }) => (
                            <Input type="time" {...field} />
                          )}
                        />
                      </div>
                      <div>
                        <Label>Fin</Label>
                        <Controller
                          name={`businessHours.${dayKey}.end`}
                          control={control}
                          rules={{
                            required: watch(`businessHours.${dayKey}.enabled`)
                              ? "Ce champ est requis"
                              : false,
                            validate: (value) => {
                              if (watch(`businessHours.${dayKey}.enabled`)) {
                                return (
                                  value >
                                    watch(`businessHours.${dayKey}.start`) ||
                                  "L'heure de fin doit être après l'heure de début"
                                );
                              }
                              return true;
                            },
                          }}
                          render={({ field }) => (
                            <Input type="time" {...field} />
                          )}
                        />
                        {errors.businessHours?.[dayKey]?.end && (
                          <ErrorMessage>
                            {errors.businessHours[dayKey].end.message}
                          </ErrorMessage>
                        )}
                      </div>
                    </TimeInputGroup>
                  )}
                </FormRow>
              );
            })}
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <SectionTitle>Préférences de planification</SectionTitle>
            <FormRow>
              <SwitchContainer>
                <SwitchLabel>Imposer des pauses déjeuner</SwitchLabel>
                <Controller
                  name="preferences.enforceBreaks"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </SwitchContainer>

              <SwitchContainer>
                <SwitchLabel>
                  Prioriser l'expérience pour les postes critiques
                </SwitchLabel>
                <Controller
                  name="preferences.prioritizeExperience"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </SwitchContainer>

              <SwitchContainer>
                <SwitchLabel>Répartir équitablement les weekends</SwitchLabel>
                <Controller
                  name="preferences.distributeWeekends"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </SwitchContainer>

              <SwitchContainer>
                <SwitchLabel>Respecter les heures max par semaine</SwitchLabel>
                <Controller
                  name="preferences.respectMaxHours"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </SwitchContainer>

              <SwitchContainer>
                <SwitchLabel>Éviter les shifts tardifs consécutifs</SwitchLabel>
                <Controller
                  name="preferences.avoidConsecutiveLateShifts"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </SwitchContainer>
            </FormRow>
          </StepContent>
        );

      case 3:
        const formData = watch();
        const activeBusinessDays = Object.entries(formData.businessHours)
          .filter(([_, hours]) => hours.enabled)
          .map(([day]) => day);

        return (
          <StepContent>
            <SectionTitle>Résumé des paramètres</SectionTitle>
            <Summary>
              <SummaryItem>
                <strong>Semaine du:</strong>{" "}
                {moment(formData.weekStartDate).format("LL")}
              </SummaryItem>
              <SummaryItem>
                <strong>Département:</strong>{" "}
                {formData.departmentId === "all"
                  ? "Tous les départements"
                  : formData.departmentId === "1"
                  ? "Service client"
                  : formData.departmentId === "2"
                  ? "Logistique"
                  : formData.departmentId === "3"
                  ? "Administration"
                  : "Non spécifié"}
              </SummaryItem>
              <SummaryItem>
                <strong>Jours actifs:</strong>{" "}
                {activeBusinessDays
                  .map((day) => day.charAt(0).toUpperCase() + day.slice(1))
                  .join(", ")}
              </SummaryItem>
              <SummaryItem>
                <strong>Préférences activées:</strong>{" "}
                {Object.entries(formData.preferences)
                  .filter(([_, enabled]) => enabled)
                  .map(([pref]) => {
                    switch (pref) {
                      case "enforceBreaks":
                        return "Pauses déjeuner";
                      case "prioritizeExperience":
                        return "Priorisation par expérience";
                      case "distributeWeekends":
                        return "Répartition des weekends";
                      case "respectMaxHours":
                        return "Respect des heures max";
                      case "avoidConsecutiveLateShifts":
                        return "Éviter shifts tardifs consécutifs";
                      default:
                        return pref;
                    }
                  })
                  .join(", ")}
              </SummaryItem>
              <SummaryItem>
                <strong>Enregistrer comme brouillon:</strong>{" "}
                {formData.saveDraft ? "Oui" : "Non"}
              </SummaryItem>
            </Summary>

            <FormRow>
              <CheckboxContainer>
                <Controller
                  name="saveDraft"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      type="checkbox"
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      id="save-draft"
                    />
                  )}
                />
                <Label htmlFor="save-draft">
                  Enregistrer comme brouillon (modification possible
                  ultérieurement)
                </Label>
              </CheckboxContainer>
            </FormRow>

            <AnimationContainer>
              {animationData && (
                <Lottie options={defaultOptions} height={200} width={200} />
              )}
            </AnimationContainer>
          </StepContent>
        );

      case 4:
        return (
          <StepContent>
            <SectionTitle>Planning généré</SectionTitle>
            {generatedSchedule ? (
              <>
                <p>
                  Votre planning a été généré avec succès et sauvegardé comme
                  brouillon.
                </p>
                <Grid>
                  {generatedSchedule.map((schedule, index) => (
                    <ScheduleCard key={index}>
                      <h4>
                        {schedule.employee.firstName}{" "}
                        {schedule.employee.lastName}
                      </h4>
                      <p>Total heures: {schedule.totalHours}h</p>
                      <ul>
                        {schedule.shifts.map((shift, idx) => (
                          <li key={idx}>
                            {moment(shift.date).format("ddd D/MM")}:{" "}
                            {shift.startTime} - {shift.endTime}
                          </li>
                        ))}
                      </ul>
                    </ScheduleCard>
                  ))}
                </Grid>
                <ButtonGroup>
                  <PrimaryButton onClick={onClose}>
                    Fermer et retourner au planning
                  </PrimaryButton>
                </ButtonGroup>
              </>
            ) : (
              <p>Aucun planning n'a été généré. Veuillez réessayer.</p>
            )}
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <WizardContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <WizardCard
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {(isLoadingEmployees || isGenerating) && (
          <LoadingOverlay>
            {animationData && (
              <Lottie options={defaultOptions} height={150} width={150} />
            )}
            <LoadingText>
              {isLoadingEmployees
                ? "Chargement des employés..."
                : "Génération du planning en cours..."}
            </LoadingText>
          </LoadingOverlay>
        )}

        <Header>
          <Title>Assistant de planification automatique</Title>
          <CloseButton onClick={onClose}>&times;</CloseButton>
        </Header>

        <StepsContainer>
          <Step active={currentStep === 0} completed={currentStep > 0}>
            Paramètres
          </Step>
          <Step active={currentStep === 1} completed={currentStep > 1}>
            Horaires
          </Step>
          <Step active={currentStep === 2} completed={currentStep > 2}>
            Préférences
          </Step>
          <Step active={currentStep === 3} completed={currentStep > 3}>
            Résumé
          </Step>
          <Step active={currentStep === 4}>Résultat</Step>
        </StepsContainer>

        <form onSubmit={handleSubmit(onSubmit)}>
          {renderStepContent()}

          {currentStep < 4 && (
            <ButtonGroup>
              {currentStep > 0 && (
                <SecondaryButton type="button" onClick={prevStep}>
                  Précédent
                </SecondaryButton>
              )}

              {currentStep === 0 && (
                <SecondaryButton type="button" onClick={onClose}>
                  Annuler
                </SecondaryButton>
              )}

              <PrimaryButton type="submit" disabled={isGenerating}>
                {currentStep === 3 ? "Générer le planning" : "Suivant"}
              </PrimaryButton>
            </ButtonGroup>
          )}
        </form>
      </WizardCard>
    </WizardContainer>
  );
};

export default AutoScheduleWizard;
