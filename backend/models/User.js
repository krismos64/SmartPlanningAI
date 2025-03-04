const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const pool = require("../config/db");

class User {
  constructor(data) {
    this.id = data.id;
    this.username = data.username;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "admin"; // Tous les utilisateurs sont admin par défaut
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.created_at = data.created_at;
  }

  static async find() {
    try {
      const [rows] = await pool.execute(
        "SELECT id, username, email, role, firstName, lastName, created_at FROM users"
      );
      return rows.map((row) => new User(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.execute(
        "SELECT id, username, email, role, firstName, lastName, created_at FROM users WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      console.log(`Recherche de l'utilisateur avec l'email: ${email}`);

      // Vérifier que la base de données est bien sélectionnée
      const [dbCheck] = await pool.query("SELECT DATABASE() as db");
      console.log(`Base de données sélectionnée: ${dbCheck[0].db}`);

      const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [
        email,
      ]);

      console.log(
        `Résultat de la recherche: ${rows.length} utilisateur(s) trouvé(s)`
      );

      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur avec l'email ${email}:`,
        error
      );
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [rows] = await pool.execute(
        "SELECT * FROM users WHERE username = ?",
        [username]
      );
      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'utilisateur avec le nom d'utilisateur ${username}:`,
        error
      );
      throw error;
    }
  }

  async save() {
    try {
      // Si le mot de passe est en texte brut, le hacher
      if (
        this.password &&
        !this.password.startsWith("$2b$") &&
        !this.password.startsWith("$2a$")
      ) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
      }

      // Définir le rôle comme admin si non défini
      this.role = this.role || "admin";

      if (this.id) {
        // Mise à jour
        await pool.execute(
          "UPDATE users SET username = ?, email = ?, password = ?, role = ?, firstName = ?, lastName = ? WHERE id = ?",
          [
            this.username,
            this.email,
            this.password,
            this.role,
            this.firstName,
            this.lastName,
            this.id,
          ]
        );
        return this;
      } else {
        // Création
        const [result] = await pool.execute(
          "INSERT INTO users (username, email, password, role, firstName, lastName) VALUES (?, ?, ?, ?, ?, ?)",
          [
            this.username,
            this.email,
            this.password,
            this.role,
            this.firstName,
            this.lastName,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'utilisateur:", error);
      throw error;
    }
  }

  static async create(userData) {
    try {
      const user = new User(userData);
      return await user.save();
    } catch (error) {
      console.error("Erreur lors de la création de l'utilisateur:", error);
      throw error;
    }
  }

  static async findByIdAndUpdate(id, updateData) {
    try {
      const user = await this.findById(id);
      if (!user) return null;

      // Mettre à jour les propriétés
      Object.assign(user, updateData);

      // S'assurer que le rôle est admin
      user.role = user.role || "admin";

      // Enregistrer les modifications
      await user.save();

      return user;
    } catch (error) {
      console.error(
        `Erreur lors de la mise à jour de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  }

  static async delete(id) {
    try {
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
      return true;
    } catch (error) {
      console.error(
        `Erreur lors de la suppression de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  }

  async comparePassword(candidatePassword) {
    try {
      console.log(
        "Comparaison du mot de passe pour l'utilisateur:",
        this.email
      );
      console.log("Mot de passe haché stocké:", this.password);

      if (!candidatePassword) {
        console.error("Mot de passe candidat manquant");
        return false;
      }

      if (!this.password) {
        console.error(
          "Mot de passe haché manquant pour l'utilisateur:",
          this.email
        );
        return false;
      }

      // Vérifier si le mot de passe est au format bcrypt
      if (
        !this.password.startsWith("$2b$") &&
        !this.password.startsWith("$2a$")
      ) {
        console.error("Le mot de passe stocké n'est pas au format bcrypt");
        return false;
      }

      const isMatch = await bcrypt.compare(candidatePassword, this.password);
      console.log("Résultat de la comparaison:", isMatch);
      return isMatch;
    } catch (error) {
      console.error("Erreur lors de la comparaison des mots de passe:", error);
      console.error("Stack trace:", error.stack);
      throw error;
    }
  }
}

module.exports = User;
