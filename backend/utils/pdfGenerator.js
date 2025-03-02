const PDFDocument = require("pdfkit");
const fs = require("fs");

function generatePDF(planningData) {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream("planning.pdf"));

  doc.fontSize(20).text("Planning de la semaine", { align: "center" });

  planningData.schedules.forEach((day) => {
    doc.fontSize(14).text(`${day.date}`, { underline: true });
    day.shifts.forEach((shift) => {
      doc.text(`${shift.startTime} - ${shift.endTime}: ${shift.employee.name}`);
    });
  });

  doc.end();
}

function generateEmployeeReport(employees) {
  const doc = new PDFDocument();

  doc.fontSize(20).text("Rapport des Employés", { align: "center" });
  doc.moveDown();

  employees.forEach((employee) => {
    doc
      .fontSize(12)
      .text(`Nom: ${employee.name}`, { continued: true })
      .text(` | Rôle: ${employee.role}`, { continued: true })
      .text(` | Heures contractuelles: ${employee.contractHours}h`, {
        continued: true,
      })
      .text(` | Heures travaillées: ${employee.workedHours}h`);
    doc.moveDown();
  });

  doc.end();
  return doc;
}

module.exports = { generatePDF, generateEmployeeReport };
