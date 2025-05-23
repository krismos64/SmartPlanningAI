const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

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
    this.isActive = data.isActive !== undefined ? data.isActive : true; // Par défaut, les comptes sont actifs
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute(
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
      console.log(`[User.findById] Recherche de l'utilisateur avec ID: ${id}`);

      // Vérifier le format de l'ID et le convertir en entier
      console.log(
        `[User.findById] Type de l'ID avant conversion: ${typeof id}`
      );

      // Convertir l'ID en entier
      const parsedId = parseInt(id, 10);
      console.log(`[User.findById] ID après conversion: ${parsedId}`);
      console.log(
        `[User.findById] Type de l'ID après conversion: ${typeof parsedId}`
      );

      // Vérifier si la conversion a réussi
      if (isNaN(parsedId)) {
        console.error(
          `[User.findById] Erreur: ID invalide, impossible de convertir "${id}" en entier`
        );
        return null;
      }

      // Vérifier que la base de données est bien sélectionnée
      const [dbCheck] = await connectDB.query("SELECT DATABASE() as db");
      console.log(
        `[User.findById] Base de données sélectionnée: ${dbCheck[0].db}`
      );

      // Exécuter la requête SQL avec l'ID converti en entier
      const sqlQuery =
        "SELECT id, email, password, role, first_name, last_name, created_at, profileImage, company, phone, jobTitle, isActive FROM users WHERE id = ?";
      console.log(
        `[User.findById] Exécution de la requête SQL préparée: ${sqlQuery}`
      );
      console.log(
        `[User.findById] Paramètre ID (converti en entier): ${parsedId}`
      );

      const [rows] = await connectDB.execute(sqlQuery, [parsedId]);

      console.log(`[User.findById] Nombre de résultats: ${rows.length}`);
      if (rows.length > 0) {
        console.log(`[User.findById] Utilisateur trouvé:`, {
          id: rows[0].id,
          email: rows[0].email,
          role: rows[0].role,
          first_name: rows[0].first_name,
          last_name: rows[0].last_name,
        });
      } else {
        console.log(
          `[User.findById] Aucun utilisateur trouvé avec l'ID: ${parsedId}`
        );
      }

      if (rows.length === 0) return null;
      return new User(rows[0]);
    } catch (error) {
      console.error(
        `[User.findById] Erreur lors de la récupération de l'utilisateur ${id}:`,
        error
      );
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      console.log(`Recherche de l'utilisateur avec l'email: ${email}`);

      // Vérifier que la base de données est bien sélectionnée
      const [dbCheck] = await connectDB.query("SELECT DATABASE() as db");
      console.log(`Base de données sélectionnée: ${dbCheck[0].db}`);

      const [rows] = await connectDB.execute(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

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
      const [rows] = await connectDB.execute(
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
      // Hash du mot de passe si celui-ci est fourni et a été modifié
      if (this.password && !this.password.startsWith("$2")) {
        const salt = await bcrypt.genSalt(8);
        this.password = await bcrypt.hash(this.password, salt);
      }

      // S'assurer que le rôle est 'admin'
      this.role = "admin";

      // S'assurer que isActive est défini (par défaut true)
      this.isActive = this.isActive !== undefined ? this.isActive : true;

      // Pour debug
      console.log(`Sauvegarde de l'utilisateur:`, {
        id: this.id,
        email: this.email,
        role: this.role,
        name: `${this.first_name} ${this.last_name}`,
        hasPassword: !!this.password,
        isActive: this.isActive,
      });

      // Préparer les paramètres en remplaçant undefined par null
      const prepareParam = (param) => (param === undefined ? null : param);

      // Si l'ID existe, mettre à jour l'utilisateur existant
      if (this.id) {
        const query = `UPDATE users SET 
          email = ?, 
          ${this.password ? "password = ?," : ""} 
          role = ?, 
          first_name = ?, 
          last_name = ?, 
          updated_at = NOW(),
          company = ?,
          phone = ?,
          jobTitle = ?,
          profileImage = ?,
          isActive = ?
          WHERE id = ?`;

        const params = [
          prepareParam(this.email),
          ...(this.password ? [prepareParam(this.password)] : []),
          prepareParam(this.role),
          prepareParam(this.first_name),
          prepareParam(this.last_name),
          prepareParam(this.company),
          prepareParam(this.phone),
          prepareParam(this.jobTitle),
          prepareParam(this.profileImage),
          prepareParam(this.isActive),
          this.id,
        ];

        await connectDB.execute(query, params);
        console.log(`Utilisateur ${this.id} mis à jour avec succès`);
        return this;
      } else {
        // Sinon, créer un nouvel utilisateur
        const query = `INSERT INTO users 
          (email, password, role, first_name, last_name, created_at, updated_at, company, phone, jobTitle, profileImage, isActive) 
          VALUES (?, ?, ?, ?, ?, NOW(), NOW(), ?, ?, ?, ?, ?)`;

        const params = [
          prepareParam(this.email),
          prepareParam(this.password),
          prepareParam(this.role),
          prepareParam(this.first_name),
          prepareParam(this.last_name),
          prepareParam(this.company),
          prepareParam(this.phone),
          prepareParam(this.jobTitle),
          prepareParam(this.profileImage),
          prepareParam(this.isActive),
        ];

        const [result] = await connectDB.execute(query, params);
        this.id = result.insertId;
        console.log(`Nouvel utilisateur créé avec l'ID ${this.id}`);
        return this;
      }
    } catch (error) {
      console.error("Erreur lors de la sauvegarde de l'utilisateur:", error);

      // Vérifier s'il s'agit d'une violation de contrainte d'unicité
      if (error.code === "ER_DUP_ENTRY") {
        if (error.sqlMessage.includes("email")) {
          throw new Error(
            "Cet email est déjà utilisé par un autre compte. Veuillez en choisir un autre."
          );
        }
      }

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
      await connectDB.execute("DELETE FROM users WHERE id = ?", [id]);
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

      // Nettoyer le candidatePassword (supprimer les espaces et points éventuels)
      const cleanCandidatePassword = candidatePassword.trim();

      // Vérifier si le mot de passe est au format bcrypt
      const isBcrypt =
        this.password.startsWith("$2b$") || this.password.startsWith("$2a$");

      // Log sécurisé (ne pas journaliser les mots de passe)
      console.log(`Vérification du mot de passe pour ${this.email}:`, {
        candidatePasswordLength: cleanCandidatePassword
          ? cleanCandidatePassword.length
          : 0,
        storedPasswordType: typeof this.password,
        storedPasswordFormat: isBcrypt ? "bcrypt" : "autre format",
        authenticationMethod: isBcrypt
          ? "bcrypt.compare"
          : "comparaison directe",
      });

      if (!isBcrypt) {
        console.warn(
          `⚠️ AVERTISSEMENT: Le mot de passe stocké pour ${this.email} n'est pas au format bcrypt. Une mise à jour est recommandée.`
        );

        // Comparaison directe si ce n'est pas un hash bcrypt (à utiliser uniquement en développement)
        return (
          process.env.NODE_ENV !== "production" &&
          this.password === cleanCandidatePassword
        );
      }

      // Utiliser bcrypt pour comparer le mot de passe
      const startTime = Date.now();
      const isMatch = await bcrypt.compare(
        cleanCandidatePassword,
        this.password
      );
      const duration = Date.now() - startTime;

      console.log(
        `Résultat de la comparaison bcrypt pour ${this.email}: ${
          isMatch ? "succès" : "échec"
        } (${duration}ms)`
      );

      return isMatch;
    } catch (error) {
      console.error("Erreur lors de la comparaison des mots de passe:", error);
      console.error("Stack trace:", error.stack);

      // Log plus détaillé pour faciliter le débogage
      console.error("Détails:", {
        userId: this.id,
        email: this.email,
        errorName: error.name,
        errorMessage: error.message,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}

module.exports = User;
