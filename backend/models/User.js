const bcrypt = require("bcrypt");
const pool = require("../config/db");

class User {
  constructor(data) {
    this.id = data.id;
    this.email = data.email;
    this.password = data.password;
    this.role = data.role || "admin"; // Tous les utilisateurs sont admin par défaut
    this.first_name = data.first_name;
    this.last_name = data.last_name;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
    this.profileImage = data.profileImage;
    this.company = data.company;
    this.phone = data.phone;
    this.jobTitle = data.jobTitle;
  }

  static async find() {
    try {
      const [rows] = await pool.execute(
        "SELECT id, email, role, first_name, last_name, created_at, company, phone, jobTitle FROM users"
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
        "SELECT id, email, password, role, first_name, last_name, created_at, profileImage, company, phone, jobTitle FROM users WHERE id = ?",
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

      // Remplacer les valeurs undefined par null pour éviter l'erreur MySQL
      // Utiliser des variables locales pour éviter de modifier directement les propriétés de l'objet
      const profileImage =
        this.profileImage === undefined ? null : this.profileImage;
      const company = this.company === undefined ? null : this.company;
      const phone = this.phone === undefined ? null : this.phone;
      const jobTitle = this.jobTitle === undefined ? null : this.jobTitle;
      const first_name = this.first_name === undefined ? null : this.first_name;
      const last_name = this.last_name === undefined ? null : this.last_name;
      const email = this.email === undefined ? null : this.email;
      const role = this.role === undefined ? "admin" : this.role;

      console.log("Sauvegarde de l'utilisateur avec les données:", {
        id: this.id,
        email,
        role,
        first_name,
        last_name,
        profileImageLength: profileImage ? profileImage.length : 0,
        company,
        phone,
        jobTitle,
      });

      if (this.id) {
        // Pour une mise à jour, si le mot de passe est null ou undefined, récupérer le mot de passe existant
        let password = this.password;

        if (password === undefined || password === null) {
          // Récupérer le mot de passe existant de la base de données
          const [rows] = await pool.execute(
            "SELECT password FROM users WHERE id = ?",
            [this.id]
          );

          if (rows.length > 0) {
            password = rows[0].password;
            console.log(
              "Utilisation du mot de passe existant pour la mise à jour"
            );
          } else {
            throw new Error(`Utilisateur avec l'ID ${this.id} non trouvé`);
          }
        }

        // Mise à jour avec updated_at = NOW()
        await pool.execute(
          "UPDATE users SET email = ?, password = ?, role = ?, first_name = ?, last_name = ?, profileImage = ?, company = ?, phone = ?, jobTitle = ?, updated_at = NOW() WHERE id = ?",
          [
            email,
            password,
            role,
            first_name,
            last_name,
            profileImage,
            company,
            phone,
            jobTitle,
            this.id,
          ]
        );
        return this;
      } else {
        // Création - le mot de passe est obligatoire
        if (!this.password) {
          throw new Error(
            "Le mot de passe est requis pour créer un utilisateur"
          );
        }

        // Création
        const [result] = await pool.execute(
          "INSERT INTO users (email, password, role, first_name, last_name, profileImage, company, phone, jobTitle, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
          [
            email,
            this.password,
            role,
            first_name,
            last_name,
            profileImage,
            company,
            phone,
            jobTitle,
          ]
        );
        this.id = result.insertId;
        return this;
      }
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'utilisateur:", error);
      console.error("Stack trace:", error.stack);
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
