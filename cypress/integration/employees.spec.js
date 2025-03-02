describe("Gestion des employés", () => {
  it("devrait afficher la liste des employés", () => {
    cy.visit("http://localhost:3000/employees");
    cy.contains("Liste des employés").should("be.visible");
  });

  it("devrait permettre d'ajouter un nouvel employé", () => {
    cy.visit("http://localhost:3000/employees");
    cy.get("button").contains("Ajouter un employé").click();
    cy.get("input[name='name']").type("John Doe");
    cy.get("input[name='role']").type("Développeur");
    cy.get("button").contains("Ajouter").click();
    cy.contains("John Doe").should("be.visible");
  });
});
