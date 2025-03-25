import EmployeeForm from "../employees/EmployeeForm";
import { Modal } from "../ui";

const EmployeeFormModal = ({
  isOpen = false,
  onClose,
  employee = null,
  onSubmit,
  onDelete,
  title = "Ajouter un employé",
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="large">
      <EmployeeForm
        employee={employee}
        onSubmit={onSubmit}
        onDelete={onDelete}
      />
    </Modal>
  );
};

export default EmployeeFormModal;
