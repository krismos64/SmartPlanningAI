const connectDB = require("../config/db");

/**
 * Modèle pour gérer les départements
 */
class Department {
  constructor(data) {
    // S'assurer que data est un objet
    data = data || {};

    // Initialisation des propriétés
    this.id = data.id;
    this.name = data.name || null;
    this.description = data.description || null;
    this.manager_id = data.manager_id || null;
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date();
  }

  /**
   * Récupère tous les départements
   * @returns {Promise<Array>} Liste des départements
   */
  static async find() {
    try {
      // Vérifier si la table departments existe
      const [tables] = await connectDB.query("SHOW TABLES LIKE 'departments'");

      // Si la table n'existe pas, on extrait les départements uniques des employés
      if (tables.length === 0) {
        const [departments] = await connectDB.query(
          "SELECT DISTINCT department FROM employees WHERE department IS NOT NULL"
        );

        // Transformer les résultats en objets Department
        return departments.map(
          (dept, index) =>
            new Department({
              id: index + 1,
              name: dept.department,
              description: `Département ${dept.department}`,
            })
        );
      }

      // Si la table existe, on récupère les départements
      const [rows] = await connectDB.query("SELECT * FROM departments");
      return rows.map((row) => new Department(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des départements:", error);
      throw error;
    }
  }

  /**
   * Récupère un département par son ID
   * @param {number} id - ID du département
   * @returns {Promise<Department|null>} Le département ou null s'il n'existe pas
   */
  static async findById(id) {
    try {
      // Vérifier si la table departments existe
      const [tables] = await connectDB.query("SHOW TABLES LIKE 'departments'");

      // Si la table n'existe pas, on extrait les départements uniques des employés
      if (tables.length === 0) {
        const departments = await this.find();
        return departments.find((dept) => dept.id === parseInt(id)) || null;
      }

      // Si la table existe, on récupère le département par son ID
      const [rows] = await connectDB.query(
        "SELECT * FROM departments WHERE id = ?",
        [id]
      );

      if (rows.length === 0) return null;
      return new Department(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du département ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupère un département par son nom
   * @param {string} name - Nom du département
   * @returns {Promise<Department|null>} Le département ou null s'il n'existe pas
   */
  static async findByName(name) {
    try {
      // Vérifier si la table departments existe
      const [tables] = await connectDB.query("SHOW TABLES LIKE 'departments'");

      // Si la table n'existe pas, on extrait les départements uniques des employés
      if (tables.length === 0) {
        const departments = await this.find();
        return departments.find((dept) => dept.name === name) || null;
      }

      // Si la table existe, on récupère le département par son nom
      const [rows] = await connectDB.query(
        "SELECT * FROM departments WHERE name = ?",
        [name]
      );

      if (rows.length === 0) return null;
      return new Department(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération du département ${name}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Récupère les employés d'un département
   * @param {number} departmentId - ID du département
   * @returns {Promise<Array>} Liste des employés du département
   */
  static async getEmployees(departmentId) {
    try {
      // Récupérer le département
      const department = await this.findById(departmentId);
      if (!department) {
        throw new Error(`Département avec l'ID ${departmentId} non trouvé`);
      }

      // Récupérer les employés du département
      const [employees] = await connectDB.query(
        "SELECT * FROM employees WHERE department = ?",
        [department.name]
      );

      return employees;
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des employés du département ${departmentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crée un nouveau département
   * @param {Object} departmentData - Données du département
   * @returns {Promise<Department>} Le département créé
   */
  static async create(departmentData) {
    try {
      const department = new Department(departmentData);
      return await department.save();
    } catch (error) {
      console.error("Erreur lors de la création du département:", error);
      throw error;
    }
  }

  /**
   * Enregistre le département dans la base de données
   * @returns {Promise<Department>} Le département enregistré
   */
  async save() {
    try {
      // Vérifier si la table departments existe
      const [tables] = await connectDB.query("SHOW TABLES LIKE 'departments'");

      // Si la table n'existe pas, on la crée
      if (tables.length === 0) {
        await connectDB.query(`
          CREATE TABLE departments (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) NOT NULL UNIQUE,
            description TEXT,
            manager_id INT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
          )
        `);
      }

      // Mettre à jour la date de modification
      this.updated_at = new Date();

      if (this.id) {
        // Mise à jour
        await connectDB.query(
          "UPDATE departments SET name = ?, description = ?, manager_id = ?, updated_at = ? WHERE id = ?",
          [
            this.name,
            this.description,
            this.manager_id,
            this.updated_at,
            this.id,
          ]
        );
      } else {
        // Création
        const [result] = await connectDB.query(
          "INSERT INTO departments (name, description, manager_id, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
          [
            this.name,
            this.description,
            this.manager_id,
            this.created_at,
            this.updated_at,
          ]
        );
        this.id = result.insertId;
      }

      return this;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement du département:", error);
      throw error;
    }
  }

  /**
   * Met à jour un département
   * @param {number} id - ID du département
   * @param {Object} updateData - Données à mettre à jour
   * @returns {Promise<Department|null>} Le département mis à jour ou null s'il n'existe pas
   */
  static async update(id, updateData) {
    try {
      const department = await this.findById(id);
      if (!department) return null;

      // Mettre à jour les propriétés
      Object.assign(department, updateData);

      // Enregistrer les modifications
      await department.save();

      return department;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour du département ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Supprime un département
   * @param {number} id - ID du département
   * @returns {Promise<boolean>} true si le département a été supprimé, false sinon
   */
  static async delete(id) {
    try {
      // Vérifier si la table departments existe
      const [tables] = await connectDB.query("SHOW TABLES LIKE 'departments'");

      // Si la table n'existe pas, on ne peut pas supprimer
      if (tables.length === 0) {
        return false;
      }

      // Supprimer le département
      const [result] = await connectDB.query(
        "DELETE FROM departments WHERE id = ?",
        [id]
      );

      return result.affectedRows > 0;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression du département ${id}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = Department;
