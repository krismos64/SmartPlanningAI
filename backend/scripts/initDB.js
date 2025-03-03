const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

// Charger les variables d'environnement
dotenv.config({ path: "../.env" });

const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "SmartPlanningAI",
};

async function initDB() {
  let connection;

  try {
    // Connexion à MySQL sans spécifier de base de données
    connection = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
    });

    console.log("✅ Connexion à MySQL réussie");

    // Créer la base de données si elle n'existe pas
    await connection.query(
      `CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`
    );
    console.log(`✅ Base de données '${dbConfig.database}' créée ou existante`);

    // Utiliser la base de données
    await connection.query(`USE ${dbConfig.database}`);

    // Créer la table users si elle n'existe pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        email VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'manager', 'employee') DEFAULT 'employee',
        firstName VARCHAR(255),
        lastName VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'users' créée ou existante");

    // Créer la table employees si elle n'existe pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS employees (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(255) NOT NULL,
        lastName VARCHAR(255) NOT NULL,
        email VARCHAR(100) NOT NULL UNIQUE,
        phone VARCHAR(20),
        position VARCHAR(100),
        department VARCHAR(100),
        status ENUM('active', 'inactive', 'pending') DEFAULT 'active',
        hireDate DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'employees' créée ou existante");

    // Créer la table shifts si elle n'existe pas
    await connection.query(`
      CREATE TABLE IF NOT EXISTS shifts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        employee_id INT NOT NULL,
        startTime DATETIME NOT NULL,
        endTime DATETIME NOT NULL,
        notes TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_by INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);
    console.log("✅ Table 'shifts' créée ou existante");

    // Vérifier si l'utilisateur admin existe déjà
    const [adminUsers] = await connection.query(
      "SELECT * FROM users WHERE email = 'admin@admin.fr'"
    );

    // Créer l'utilisateur admin s'il n'existe pas
    if (adminUsers.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash("admin", salt);

      await connection.query(
        "INSERT INTO users (username, email, password, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)",
        ["admin", "admin@admin.fr", hashedPassword, "admin", "Admin", "User"]
      );
      console.log("✅ Utilisateur admin créé");
    } else {
      console.log("✅ Utilisateur admin existe déjà");
    }

    console.log("✅ Initialisation de la base de données terminée avec succès");
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'initialisation de la base de données:",
      error
    );
  } finally {
    if (connection) {
      await connection.end();
      console.log("✅ Connexion à la base de données fermée");
    }
  }
}

// Exécuter l'initialisation
initDB();
