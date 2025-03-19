import mysql from "mysql2/promise";

// Configuration de la connexion MySQL (XAMPP)
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "SmartPlanningAI",
  port: 3306,
};

let connection;

/**
 * Retourne une connexion MySQL, en l'initialisant si nécessaire
 */
export async function getConnection() {
  if (!connection) {
    try {
      connection = await mysql.createConnection(dbConfig);
      console.log("Connexion MySQL établie avec succès");
    } catch (error) {
      console.error("Erreur de connexion MySQL:", error);
      throw error;
    }
  }
  return connection;
}

export default { getConnection };
