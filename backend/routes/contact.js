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
      subject: "🤖 Merci pour votre message, on s’en occupe !",
      text: `
    Bonjour ${prenom} 👋,

    Un grand merci pour votre message ! 📨

    Voici un petit récap de ce que vous nous avez envoyé :
    "${message}"

    Notre équipe (composée de vrais humains 👨‍💻👩‍💻 et un peu d’IA 🤖) va prendre connaissance de votre demande très rapidement.

    En attendant, prenez soin de vous et profitez de votre journée ☀️

    Bien cordialement,

    L'équipe SmartPlanning 🧠📅
  `,
      html: `
    <p>Bonjour <strong>${prenom}</strong> 👋,</p>

    <p>Un grand merci pour votre message ! <span style="font-size: 1.2em;">📨</span></p>

    <p>Voici un petit récap de ce que vous nous avez envoyé :</p>
    <blockquote style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #00bcd4;">
      ${message.replace(/\n/g, "<br>")}
    </blockquote>

    <p>Notre équipe (composée de vrais humains 👨‍💻👩‍💻 et un soupçon d’intelligence artificielle 🤖) va prendre connaissance de votre message très rapidement.</p>

    <p>En attendant, prenez soin de vous et profitez de votre journée ☀️</p>

    <p style="margin-top: 20px;">
      Bien cordialement,<br>

      <strong>L'équipe SmartPlanning</strong> 🧠📅
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
