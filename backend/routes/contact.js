const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

/**
 * @route POST /api/contact
 * @desc Envoie un email à partir du formulaire de contact
 * @access Public
 */
router.post("/", async (req, res) => {
  const { name, prenom, email, subject, message } = req.body;

  // Vérification des champs requis
  if (!name || !prenom || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Tous les champs sont obligatoires",
    });
  }

  try {
    // Configuration du transporteur nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true pour SSL (port 465)
      auth: {
        user: "contact@smartplanning.fr",
        pass: "supersonicM1.",
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMARTPLANNING_MAIL_USER,
      to: "contact@smartplanning.fr",
      subject: `📩 Nouveau message de ${name}`,
      text: `
        Nom: ${name}
        Prénom: ${prenom}
        Email: ${email}
        Sujet: ${subject || "Non spécifié"}
        
        Message:
        ${message}
      `,
      html: `
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Prénom:</strong> ${prenom}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject || "Non spécifié"}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

    // Configuration de l'email de confirmation pour l'utilisateur
    const confirmationMailOptions = {
      from: process.env.SMARTPLANNING_MAIL_USER,
      to: email,
      subject: "📬 Confirmation de réception de votre message",
      text: `
        Bonjour ${prenom},
        
        Nous vous remercions pour votre message.
        
        Nous avons bien reçu votre demande :
        "${message}"
        
        Notre équipe reviendra vers vous dans les plus brefs délais.
        
        Bien cordialement,
        L'équipe SmartPlanningAI
      `,
      html: `
        <p>Bonjour <strong>${prenom}</strong>,</p>
        
        <p>Nous vous remercions pour votre message.</p>
        
        <p>Nous avons bien reçu votre demande :</p>
        <blockquote>${message.replace(/\n/g, "<br>")}</blockquote>
        
        <p>Notre équipe reviendra vers vous dans les plus brefs délais.</p>
        
        <p>
        Bien cordialement,<br>
        <strong>L'équipe SmartPlanningAI</strong>
        </p>
      `,
    };

    // Envoi de l'email de confirmation
    await transporter.sendMail(confirmationMailOptions);

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    return res.status(500).json({
      success: false,
      error: "Échec de l'envoi du message",
    });
  }
});

module.exports = router;
