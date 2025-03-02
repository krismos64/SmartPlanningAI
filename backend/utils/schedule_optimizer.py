import sys
import json
from ortools.sat.python import cp_model

def optimize_schedule(employees, shifts, requirements):
    model = cp_model.CpModel()

    # Variables
    schedule = {}
    for e in employees:
        for s in shifts:
            schedule[(e, s)] = model.NewBoolVar(f'schedule_{e}_{s}')

    # Contraintes
    for s in shifts:
        model.Add(sum(schedule[(e, s)] for e in employees) == requirements[s])

    for e in employees:
        model.Add(sum(schedule[(e, s)] for s in shifts) <= employees[e]['max_hours'])

    # Fonction objectif (minimiser les heures supplémentaires, par exemple)
    model.Minimize(sum(schedule[(e, s)] * employees[e]['overtime_cost'] for e in employees for s in shifts))

    # Résolution
    solver = cp_model.CpSolver()
    status = solver.Solve(model)

    if status == cp_model.OPTIMAL:
        return {"status": "success", "schedule": {(e, s): solver.Value(schedule[(e, s)]) for e in employees for s in shifts}}
    else:
        return {"status": "failure", "schedule": None}

if __name__ == "__main__":
    employees = json.loads(sys.argv[1])
    shifts = json.loads(sys.argv[2])
    requirements = json.loads(sys.argv[3])
    result = optimize_schedule(employees, shifts, requirements)
    print(json.dumps(result))

# Exemple d'utilisation
employees = {
    'Alice': {'max_hours': 40, 'overtime_cost': 1.5},
    'Bob': {'max_hours': 40, 'overtime_cost': 1.2},
}

shifts = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
requirements = {'Monday': 1, 'Tuesday': 1, 'Wednesday': 1, 'Thursday': 1, 'Friday': 1}

optimal_schedule = optimize_schedule(employees, shifts, requirements)
print(optimal_schedule) 