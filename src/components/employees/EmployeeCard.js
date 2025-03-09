import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaBriefcase, FaMapMarkerAlt, FaUser } from "react-icons/fa";
import styled, { keyframes } from "styled-components";
import { formatDateForDisplay } from "../../utils/dateUtils";
import { Button } from "../ui";

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

// Styled Components
const CardContainer = styled(motion.div)`
  background: ${({ theme }) => theme.colors.background.card};
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  max-width: 800px;
  width: 100%;
  margin: 0 auto;
  animation: ${fadeIn} 0.5s ease-out;
  position: relative;
  overflow: hidden;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 2rem;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    bottom: -1rem;
    left: 0;
    width: 100%;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const Avatar = styled.div`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.primary.main};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1.5rem;
  color: white;
  font-size: 2.5rem;
  font-weight: bold;
`;

const EmployeeName = styled.h2`
  font-size: 1.8rem;
  margin: 0;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const EmployeeRole = styled.p`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  margin: 0.5rem 0 0;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
`;

const InfoSection = styled.div`
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-size: 1.1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: 1rem;
  display: flex;
  align-items: center;

  svg {
    margin-right: 0.5rem;
    color: ${({ theme }) => theme.colors.primary.main};
  }
`;

const InfoItem = styled.div`
  margin-bottom: 0.8rem;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${({ delay }) => delay || "0s"};
  animation-fill-mode: both;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: ${({ theme }) => theme.colors.text.secondary};
  display: block;
  margin-bottom: 0.2rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: 500;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
`;

const StatusBadge = styled.span`
  background: ${({ status, theme }) => {
    switch (status) {
      case "active":
        return theme.colors.success.light;
      case "inactive":
        return theme.colors.error.light;
      case "vacation":
        return theme.colors.warning.light;
      case "sick":
        return theme.colors.info.light;
      default:
        return theme.colors.grey[300];
    }
  }};
  color: ${({ status, theme }) => {
    switch (status) {
      case "active":
        return theme.colors.success.dark;
      case "inactive":
        return theme.colors.error.dark;
      case "vacation":
        return theme.colors.warning.dark;
      case "sick":
        return theme.colors.info.dark;
      default:
        return theme.colors.grey[800];
    }
  }};
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  display: inline-block;
  margin-left: 1rem;
`;

const EmployeeCard = ({ employee, onEdit, onClose }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      y: 50,
      transition: { duration: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Vérifier si l'employé est défini
  if (!employee) {
    return (
      <CardContainer>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p>Aucune donnée d'employé disponible</p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </CardContainer>
    );
  }

  // Get initials for avatar
  const getInitials = () => {
    const firstName = employee.first_name || "";
    const lastName = employee.last_name || "";
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Format status for display
  const formatStatus = (status) => {
    if (!status) return "Non défini";

    const statusMap = {
      active: "Actif",
      inactive: "Inactif",
      vacation: "En congé",
      sick: "En arrêt maladie",
    };

    return statusMap[status] || status;
  };

  return (
    <CardContainer
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      exit="exit"
      variants={containerVariants}
    >
      <CardHeader>
        <Avatar>{getInitials()}</Avatar>
        <div>
          <EmployeeName>
            {employee.first_name} {employee.last_name}
            <StatusBadge status={employee.status}>
              {formatStatus(employee.status)}
            </StatusBadge>
          </EmployeeName>
          <EmployeeRole>
            {employee.role || "Poste non défini"}{" "}
            {employee.department ? `• ${employee.department}` : ""}
          </EmployeeRole>
        </div>
      </CardHeader>

      <CardContent>
        <motion.div variants={itemVariants}>
          <InfoSection>
            <SectionTitle>
              <FaUser /> Informations personnelles
            </SectionTitle>
            <InfoItem delay="0.1s">
              <InfoLabel>Email</InfoLabel>
              <InfoValue>{employee.email || "Non renseigné"}</InfoValue>
            </InfoItem>
            <InfoItem delay="0.2s">
              <InfoLabel>Téléphone</InfoLabel>
              <InfoValue>{employee.phone || "Non renseigné"}</InfoValue>
            </InfoItem>
            <InfoItem delay="0.3s">
              <InfoLabel>Date de naissance</InfoLabel>
              <InfoValue>
                {employee.birthdate
                  ? formatDateForDisplay(employee.birthdate)
                  : "Non renseignée"}
              </InfoValue>
            </InfoItem>
          </InfoSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <InfoSection>
            <SectionTitle>
              <FaMapMarkerAlt /> Adresse
            </SectionTitle>
            <InfoItem delay="0.4s">
              <InfoLabel>Adresse</InfoLabel>
              <InfoValue>{employee.address || "Non renseignée"}</InfoValue>
            </InfoItem>
            <InfoItem delay="0.5s">
              <InfoLabel>Ville</InfoLabel>
              <InfoValue>{employee.city || "Non renseignée"}</InfoValue>
            </InfoItem>
            <InfoItem delay="0.6s">
              <InfoLabel>Code postal</InfoLabel>
              <InfoValue>{employee.zip_code || "Non renseigné"}</InfoValue>
            </InfoItem>
          </InfoSection>
        </motion.div>

        <motion.div variants={itemVariants}>
          <InfoSection>
            <SectionTitle>
              <FaBriefcase /> Informations professionnelles
            </SectionTitle>
            <InfoItem delay="0.7s">
              <InfoLabel>Date d'embauche</InfoLabel>
              <InfoValue>
                {employee.hire_date
                  ? formatDateForDisplay(employee.hire_date)
                  : "Non renseignée"}
              </InfoValue>
            </InfoItem>
            <InfoItem delay="0.8s">
              <InfoLabel>Heures contractuelles</InfoLabel>
              <InfoValue>
                {employee.contractHours || "0"} heures/semaine
              </InfoValue>
            </InfoItem>
            <InfoItem delay="0.9s">
              <InfoLabel>Solde d'heures</InfoLabel>
              <InfoValue>{employee.hour_balance || "0"} heures</InfoValue>
            </InfoItem>
          </InfoSection>
        </motion.div>
      </CardContent>

      <CardFooter>
        <Button variant="secondary" onClick={onClose}>
          Retour
        </Button>
        <Button variant="primary" onClick={onEdit}>
          Modifier
        </Button>
      </CardFooter>
    </CardContainer>
  );
};

export default EmployeeCard;
