const connectDB = require("../config/db");
const {
  createAndEmitNotification,
} = require("../services/notificationService");
const { pool } = require("../config/database");

class Employee {
  constructor(data) {
    // S'assurer que data est un objet
    data = data || {};

    // Initialisation des propriétés
    this.id = data.id;
    this.user_id = data.user_id || null; // ID de l'utilisateur qui a créé l'employé
    this.first_name = data.first_name || null;
    this.last_name = data.last_name || null;
    this.email = data.email || null;
    this.phone = data.phone || null;
    this.address = data.address || null;
    this.city = data.city || null;
    // Supporter les deux formats pour zip_code (snake_case et camelCase)
    this.zip_code = data.zip_code || data.zipCode || null;
    this.role = data.role || null;
    this.department = data.department || null;
    this.contractHours = data.contract_hours || data.contractHours || 35; // Support des deux formats
    this.birthdate = data.birthdate || null;
    this.hire_date = data.hire_date || null;
    this.status = data.status || "active";
    this.hour_balance = data.hour_balance || 0; // Ajout du solde d'heures
    this.manager_id = data.manager_id || null; // Ajout de l'ID du manager
    this.created_at = data.created_at || new Date();
    this.updated_at = data.updated_at || new Date(); // Ajout du champ updated_at
  }

  static async find() {
    try {
      const [rows] = await connectDB.execute("SELECT * FROM employees");
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error("Erreur lors de la récupération des employés:", error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await connectDB.execute(
        "SELECT * FROM employees WHERE id = ?",
        [id]
      );
      if (rows.length === 0) return null;
      return new Employee(rows[0]);
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de l'employé ${id}:`,
        error
      );
      throw error;
    }
  }

  async save() {
    try {
      // Debug complet des données reçues
      console.log(
        "Données complètes reçues dans save():",
        JSON.stringify(
          {
            id: this.id,
            user_id: this.user_id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            city: this.city,
            zip_code: this.zip_code,
            zipCode: this.zipCode, // Vérifier si cette propriété existe aussi
            role: this.role,
            department: this.department,
            contractHours: this.contractHours,
            birthdate: this.birthdate,
            hire_date: this.hire_date,
            status: this.status,
            hour_balance: this.hour_balance,
            manager_id: this.manager_id,
            created_at: this.created_at,
            updated_at: this.updated_at,
          },
          null,
          2
        )
      );

      // Log des données de l'employé pour le débogage
      console.log(
        "Données de l'employé à enregistrer:",
        JSON.stringify(
          {
            id: this.id,
            first_name: this.first_name,
            last_name: this.last_name,
            email: this.email,
            phone: this.phone,
            address: this.address,
            city: this.city,
            zip_code: this.zip_code,
            role: this.role,
            department: this.department,
            contractHours: this.contractHours,
            birthdate: this.birthdate,
            hire_date: this.hire_date,
            status: this.status,
            manager_id: this.manager_id,
          },
          null,
          2
        )
      );

      // Formater les dates pour MySQL
      const birth_date = this.birthdate
        ? new Date(this.birthdate).toISOString().split("T")[0]
        : null;
      const start_date = this.hire_date
        ? new Date(this.hire_date).toISOString().split("T")[0]
        : null;

      // Mettre à jour la date de modification
      this.updated_at = new Date();

      if (this.id) {
        // Mise à jour
        try {
          console.log("Mise à jour de l'employé existant - ID:", this.id);

          // S'assurer que contractHours est un nombre
          if (typeof this.contractHours === "string") {
            this.contractHours = parseFloat(this.contractHours) || 35;
          }
          this.contractHours = this.contractHours || 35;

          console.log(
            "contractHours après conversion:",
            this.contractHours,
            "type:",
            typeof this.contractHours
          );

          // S'assurer que toutes les valeurs sont correctement définies
          const params = [
            this.first_name || null,
            this.last_name || null,
            this.email,
            this.phone,
            this.address,
            this.city,
            this.zip_code,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            birth_date,
            start_date,
            this.status || "active",
            this.manager_id,
            this.user_id,
            this.updated_at,
            this.id,
          ];

          console.log(
            "Paramètres SQL pour la mise à jour:",
            JSON.stringify(params, null, 2)
          );

          // Requête SQL explicite sans hourlyRate
          const updateQuery = `
            UPDATE employees 
            SET first_name = ?, 
                last_name = ?, 
                email = ?, 
                phone = ?, 
                address = ?, 
                city = ?, 
                zip_code = ?, 
                role = ?, 
                department = ?, 
                contractHours = ?, 
                birthdate = ?, 
                hire_date = ?, 
                status = ?,
                manager_id = ?,
                user_id = ?,
                updated_at = ? 
            WHERE id = ?
          `;

          console.log("Requête SQL pour la mise à jour:", updateQuery);

          await connectDB.execute(updateQuery, params);

          // Créer une notification pour l'employé - avec gestion d'erreur robuste
          try {
            if (this.id && typeof createAndEmitNotification === "function") {
              // Ne pas essayer d'envoyer une notification à l'employé comme s'il était un utilisateur
              // L'ID d'un employé n'est pas forcément un ID d'utilisateur valide
              console.log(
                "Notification pour l'employé désactivée pour éviter les erreurs de contrainte"
              );
            }
          } catch (notifError) {
            console.warn(
              "Erreur non bloquante lors de la création de notification (mise à jour employé):",
              notifError
            );
            // Ne pas bloquer la mise à jour si la notification échoue
          }

          // Créer une notification pour le manager - avec gestion d'erreur robuste
          try {
            if (
              this.manager_id &&
              typeof createAndEmitNotification === "function"
            ) {
              await createAndEmitNotification(null, {
                user_id: this.manager_id,
                title: "Employé mis à jour",
                message: `Les informations de ${this.first_name} ${this.last_name} ont été mises à jour`,
                type: "info",
                link: `/employees/${this.id}`,
              });
            }
          } catch (notifError) {
            console.warn(
              "Erreur non bloquante lors de la création de notification manager (mise à jour employé):",
              notifError
            );
            // Ne pas bloquer la mise à jour si la notification échoue
          }
        } catch (updateError) {
          console.error(
            `Erreur SQL lors de la mise à jour de l'employé ID ${this.id}:`,
            updateError
          );
          throw updateError;
        }
        return this;
      } else {
        // Création
        try {
          console.log("Création d'un nouvel employé");

          // S'assurer que contractHours est un nombre
          if (typeof this.contractHours === "string") {
            this.contractHours = parseFloat(this.contractHours) || 35;
          }
          this.contractHours = this.contractHours || 35;

          console.log(
            "contractHours après conversion:",
            this.contractHours,
            "type:",
            typeof this.contractHours
          );

          console.log(
            "Données pour insertion:",
            JSON.stringify(
              {
                first_name: this.first_name,
                last_name: this.last_name,
                email: this.email,
                phone: this.phone,
                address: this.address,
                city: this.city,
                zip_code: this.zip_code,
                role: this.role,
                department: this.department,
                contractHours: this.contractHours,
                birthdate: birth_date,
                hire_date: start_date,
                status: this.status,
                manager_id: this.manager_id,
              },
              null,
              2
            )
          );

          const params = [
            this.first_name || null,
            this.last_name || null,
            this.email || null,
            this.phone || null,
            this.address || null,
            this.city || null,
            this.zip_code || null,
            this.role,
            this.department,
            this.contractHours !== undefined ? this.contractHours : 35,
            birth_date,
            start_date,
            this.status || "active",
            this.manager_id,
            this.user_id,
            this.created_at,
            this.updated_at,
          ];

          console.log(
            "Paramètres SQL pour l'insertion:",
            JSON.stringify(params, null, 2)
          );

          // Requête SQL explicite sans hourlyRate
          const insertQuery = `
            INSERT INTO employees (
              first_name, 
              last_name, 
              email, 
              phone, 
              address, 
              city, 
              zip_code, 
              role, 
              department, 
              contractHours, 
              birthdate, 
              hire_date, 
              status,
              manager_id,
              user_id,
              created_at, 
              updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `;

          console.log("Requête SQL pour l'insertion:", insertQuery);

          // Vérifier la correspondance entre les paramètres et les colonnes
          console.log("Nombre de valeurs paramétrées:", params.length);
          console.log(
            "Nombre de marqueurs de position (?) dans la requête:",
            (insertQuery.match(/\?/g) || []).length
          );

          // Vérifier la structure de la requête
          const colonnesRequete = insertQuery.match(
            /\(\s*([\w_, \n]+)\s*\)\s*VALUES/i
          );
          if (colonnesRequete && colonnesRequete[1]) {
            const colonnes = colonnesRequete[1]
              .split(",")
              .map((col) => col.trim());
            console.log("Colonnes dans la requête:", colonnes);
            console.log("Nombre de colonnes:", colonnes.length);
          }

          try {
            const [result] = await connectDB.execute(insertQuery, params);
            this.id = result.insertId;

            // Créer une notification pour l'employé - gestion des erreurs
            try {
              if (this.id && typeof createAndEmitNotification === "function") {
                // Ne pas essayer d'envoyer une notification à l'employé comme s'il était un utilisateur
                // L'ID d'un employé n'est pas forcément un ID d'utilisateur valide
                console.log(
                  "Notification pour l'employé désactivée pour éviter les erreurs de contrainte"
                );
              }
            } catch (notifError) {
              console.warn(
                "Erreur non bloquante lors de la création de notification:",
                notifError
              );
              // Ne pas bloquer la création d'employé si la notification échoue
            }

            // Créer une notification pour le manager - gestion des erreurs
            try {
              if (
                this.manager_id &&
                typeof createAndEmitNotification === "function"
              ) {
                await createAndEmitNotification(null, {
                  user_id: this.manager_id,
                  title: "Nouvel employé",
                  message: `${this.first_name} ${this.last_name} a été ajouté à votre équipe`,
                  type: "success",
                  link: `/employees/${this.id}`,
                });
              }
            } catch (notifError) {
              console.warn(
                "Erreur non bloquante lors de la création de notification manager:",
                notifError
              );
              // Ne pas bloquer la création d'employé si la notification échoue
            }

            return this;
          } catch (sqlError) {
            console.error("Erreur SQL détaillée:", sqlError);

            // Si l'erreur est liée à la colonne contractHours, essayer une requête alternative
            if (
              sqlError.code === "ER_BAD_FIELD_ERROR" &&
              sqlError.message.includes("contractHours")
            ) {
              console.log(
                "Tentative d'insertion sans la colonne contractHours"
              );

              // Requête alternative sans contractHours
              const alternativeInsertQuery = `
                INSERT INTO employees (
                  first_name, 
                  last_name, 
                  email, 
                  phone, 
                  address, 
                  city, 
                  zip_code, 
                  role, 
                  department, 
                  birthdate, 
                  hire_date, 
                  status,
                  manager_id,
                  user_id,
                  created_at, 
                  updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
              `;

              // Supprimer contractHours des paramètres
              const alternativeParams = [...params];
              alternativeParams.splice(9, 1); // Supprimer contractHours (10ème élément, index 9)

              console.log(
                "Requête SQL alternative pour l'insertion:",
                alternativeInsertQuery
              );
              console.log("Paramètres alternatifs:", alternativeParams);

              try {
                const [result] = await connectDB.execute(
                  alternativeInsertQuery,
                  alternativeParams
                );
                this.id = result.insertId;

                // Créer une notification pour l'employé - gestion des erreurs
                try {
                  if (
                    this.id &&
                    typeof createAndEmitNotification === "function"
                  ) {
                    // Ne pas essayer d'envoyer une notification à l'employé comme s'il était un utilisateur
                    // L'ID d'un employé n'est pas forcément un ID d'utilisateur valide
                    console.log(
                      "Notification pour l'employé désactivée pour éviter les erreurs de contrainte"
                    );
                  }
                } catch (notifError) {
                  console.warn(
                    "Erreur non bloquante lors de la création de notification:",
                    notifError
                  );
                  // Ne pas bloquer la création d'employé si la notification échoue
                }

                // Créer une notification pour le manager - gestion des erreurs
                try {
                  if (
                    this.manager_id &&
                    typeof createAndEmitNotification === "function"
                  ) {
                    await createAndEmitNotification(null, {
                      user_id: this.manager_id,
                      title: "Nouvel employé",
                      message: `${this.first_name} ${this.last_name} a été ajouté à votre équipe`,
                      type: "success",
                      link: `/employees/${this.id}`,
                    });
                  }
                } catch (notifError) {
                  console.warn(
                    "Erreur non bloquante lors de la création de notification manager:",
                    notifError
                  );
                  // Ne pas bloquer la création d'employé si la notification échoue
                }

                return this;
              } catch (alternativeError) {
                console.error(
                  "Erreur avec la requête alternative:",
                  alternativeError
                );
                throw alternativeError;
              }
            } else {
              // Diagnostic avancé pour détecter les problèmes de colonnes
              try {
                const [columns] = await connectDB.execute(
                  "SHOW COLUMNS FROM employees"
                );
                console.log(
                  "Colonnes existantes dans la table:",
                  columns.map((col) => col.Field)
                );
              } catch (showError) {
                console.error(
                  "Impossible de vérifier les colonnes:",
                  showError
                );
              }
              throw sqlError;
            }
          }
        } catch (insertError) {
          console.error(
            "Erreur SQL lors de l'insertion d'un nouvel employé:",
            insertError
          );
          console.error("Message d'erreur:", insertError.message);
          console.error("Code d'erreur:", insertError.code);
          console.error("Numéro d'erreur SQL:", insertError.errno);
          console.error("État SQL:", insertError.sqlState);
          throw insertError;
        }
      }
    } catch (error) {
      console.error(
        "Erreur détaillée lors de l'enregistrement de l'employé:",
        error
      );
      throw error;
    }
  }

  static async create(employeeData) {
    try {
      const employee = new Employee(employeeData);
      return await employee.save();
    } catch (error) {
      console.error("Erreur lors de la création de l'employé:", error);
      throw error;
    }
  }

  /**
   * Met à jour un employé existant par son ID
   * @param {number} id - ID de l'employé à mettre à jour
   * @param {Object} data - Données à mettre à jour
   * @returns {Promise<Object>} L'employé mis à jour
   */
  static async findByIdAndUpdate(id, data) {
    try {
      // Convertir id en nombre si c'est une chaîne
      if (typeof id === "string") {
        id = parseInt(id, 10);
      }

      console.log(`Début findByIdAndUpdate - ID: ${id} - Type: ${typeof id}`);
      console.log(
        "Données brutes reçues pour la mise à jour:",
        JSON.stringify(data, null, 2)
      );

      // Vérifier si l'employé existe
      const [employees] = await pool.query(
        "SELECT * FROM employees WHERE id = ?",
        [id]
      );

      if (employees.length === 0) {
        console.error(`Aucun employé trouvé avec l'ID: ${id}`);
        return null;
      }

      const employee = employees[0];
      console.log(
        "Employé avant mise à jour:",
        JSON.stringify(employee, null, 2)
      );

      // Création d'un objet de données nettoyé
      const cleanedData = {
        ...data,
        // Convertir zipCode en zip_code si présent
        ...(data.zipCode && { zip_code: data.zipCode }),
        // S'assurer que contractHours est un nombre si présent
        ...(data.contractHours && {
          contractHours:
            typeof data.contractHours === "string"
              ? parseFloat(data.contractHours)
              : data.contractHours,
        }),
        updated_at: new Date().toISOString(),
      };

      // Formater les dates si elles sont présentes
      try {
        if (cleanedData.birthdate) {
          // Gérer le cas où birthdate est déjà un objet Date
          if (cleanedData.birthdate instanceof Date) {
            cleanedData.birthdate = cleanedData.birthdate
              .toISOString()
              .split("T")[0];
          }
          // Gérer le cas où birthdate est une chaîne ISO
          else if (typeof cleanedData.birthdate === "string") {
            const date = new Date(cleanedData.birthdate);
            if (!isNaN(date.getTime())) {
              cleanedData.birthdate = date.toISOString().split("T")[0];
            }
          }
        }
      } catch (error) {
        console.error("Erreur de formatage de birthdate:", error);
      }

      try {
        if (cleanedData.hire_date) {
          // Gérer le cas où hire_date est déjà un objet Date
          if (cleanedData.hire_date instanceof Date) {
            cleanedData.hire_date = cleanedData.hire_date
              .toISOString()
              .split("T")[0];
          }
          // Gérer le cas où hire_date est une chaîne ISO
          else if (typeof cleanedData.hire_date === "string") {
            const date = new Date(cleanedData.hire_date);
            if (!isNaN(date.getTime())) {
              cleanedData.hire_date = date.toISOString().split("T")[0];
            }
          }
        }
      } catch (error) {
        console.error("Erreur de formatage de hire_date:", error);
      }

      console.log(
        "Données nettoyées pour la mise à jour:",
        JSON.stringify(cleanedData, null, 2)
      );

      // Créer une nouvelle instance d'employé avec les données mises à jour
      const updatedEmployee = new Employee({ id, ...employee, ...cleanedData });

      // Vérifier que l'ID de l'utilisateur et du manager sont définis
      if (!updatedEmployee.user_id && employee.user_id) {
        updatedEmployee.user_id = employee.user_id;
      }

      if (!updatedEmployee.manager_id && employee.manager_id) {
        updatedEmployee.manager_id = employee.manager_id;
      }

      console.log(
        "Employee après Object.assign:",
        JSON.stringify(updatedEmployee, null, 2)
      );

      // Sauvegarder les modifications
      console.log("Tentative de sauvegarde des modifications...");
      await updatedEmployee.save();

      console.log(
        "Employé après mise à jour:",
        JSON.stringify(employee, null, 2)
      );

      return updatedEmployee;
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'employé:", error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      // Récupérer les informations de l'employé avant la suppression
      const [rows] = await connectDB.execute(
        "SELECT first_name, last_name, manager_id FROM employees WHERE id = ?",
        [id]
      );

      if (rows.length === 0) {
        throw new Error("Employé non trouvé");
      }

      const { first_name, last_name, manager_id } = rows[0];

      // Supprimer l'employé
      await connectDB.execute("DELETE FROM employees WHERE id = ?", [id]);

      // Créer une notification pour le manager - avec gestion d'erreur
      try {
        if (manager_id && typeof createAndEmitNotification === "function") {
          await createAndEmitNotification(null, {
            user_id: manager_id,
            title: "Employé supprimé",
            message: `${first_name} ${last_name} a été supprimé de votre équipe`,
            type: "warning",
            link: "/employees",
          });
        }
      } catch (notifError) {
        console.warn(
          "Erreur non bloquante lors de la création de notification de suppression:",
          notifError
        );
        // Ne pas bloquer la suppression si la notification échoue
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'employé ${id}:`, error);
      throw error;
    }
  }

  static async updateHourBalance(employeeId) {
    try {
      console.log(`Mise à jour du solde d'heures pour l'employé ${employeeId}`);

      // Calculer la somme des balances des heures de travail
      const [result] = await connectDB.query(
        `SELECT SUM(balance) AS total_balance 
         FROM work_hours WHERE employee_id = ?`,
        [employeeId]
      );

      const totalBalance = result[0]?.total_balance || 0;
      console.log(`Nouveau solde calculé: ${totalBalance}`);

      // Mettre à jour le solde dans la table employees en utilisant query au lieu de execute
      await connectDB.query(
        "UPDATE employees SET hour_balance = ? WHERE id = ?",
        [totalBalance, employeeId]
      );

      console.log(
        `Solde d'heures mis à jour avec succès pour l'employé ${employeeId}`
      );
      return totalBalance;
    } catch (error) {
      console.error(
        "Erreur lors de la mise à jour du compteur horaire :",
        error
      );
      throw error;
    }
  }

  static async findByManager(managerId) {
    try {
      console.log(`Récupération des employés pour le manager ID: ${managerId}`);
      const [rows] = await connectDB.execute(
        "SELECT * FROM employees WHERE manager_id = ?",
        [managerId]
      );
      console.log(
        `${rows.length} employés trouvés pour le manager ID: ${managerId}`
      );
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des employés pour le manager ${managerId}:`,
        error
      );
      throw error;
    }
  }

  static async findByUserId(userId) {
    try {
      console.log(`Récupération des employés pour l'utilisateur ID: ${userId}`);
      const [rows] = await connectDB.execute(
        "SELECT * FROM employees WHERE user_id = ?",
        [userId]
      );
      console.log(
        `${rows.length} employés trouvés pour l'utilisateur ID: ${userId}`
      );
      return rows.map((row) => new Employee(row));
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des employés pour l'utilisateur ${userId}:`,
        error
      );
      throw error;
    }
  }
}

module.exports = Employee;
