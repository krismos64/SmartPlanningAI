const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

/**
 * @route POST /api/contact
 * @desc Envoie un email à partir du formulaire de contact
 * @access Public
 */
router.post("/", async (req, res) => {
  const { name, email, message } = req.body;

  // Vérification des champs requis
  if (!name || !email || !message) {
    return res.status(400).json({
      success: false,
      error: "Tous les champs sont obligatoires",
    });
  }

  try {
    // Configuration du transporteur nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMARTPLANNING_MAIL_USER,
        pass: process.env.SMARTPLANNING_MAIL_PASSWORD,
      },
    });

    // Configuration de l'email
    const mailOptions = {
      from: process.env.SMARTPLANNING_MAIL_USER,
      to: "contact@smartplanning.fr",
      subject: `📩 Nouveau message de ${name}`,
      text: `
        Nom: ${name}
        Email: ${email}
        
        Message:
        ${message}
      `,
      html: `
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    };

    // Envoi de l'email
    await transporter.sendMail(mailOptions);

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
