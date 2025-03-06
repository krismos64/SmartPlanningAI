import styled from "styled-components";
import { EmployeeName } from "../employees/EmployeeName";

const Grid = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
`;

const Th = styled.th`
  padding: 0.75rem;
  text-align: left;
  border-bottom: 2px solid #e5e7eb;
  background-color: #f9fafb;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e5e7eb;
`;

const ScheduleGrid = ({ employees, weekStart, scheduleData }) => {
  return (
    <Grid>
      <Table>
        <thead>
          <tr>
            <Th>Employé</Th>
            <Th>Lundi</Th>
            <Th>Mardi</Th>
            <Th>Mercredi</Th>
            <Th>Jeudi</Th>
            <Th>Vendredi</Th>
            <Th>Total</Th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee) => (
            <tr key={employee.id}>
              <Td>
                <EmployeeName employee={employee} withEmail={true} />
              </Td>
              {/* Ajouter les cellules pour chaque jour */}
            </tr>
          ))}
        </tbody>
      </Table>
    </Grid>
  );
};

export default ScheduleGrid;
