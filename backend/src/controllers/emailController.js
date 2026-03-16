import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export class EmailController {
  /**
   * Envoi d'email de contact général
   */
  static async sendContactEmail(req, res) {
    try {
      const { prenom, nom, email, sujet, message } = req.body;

      if (!prenom || !nom || !email || !message) {
        return res.status(400).json({ error: "Tous les champs sont requis." });
      }

      // 1️⃣ Email à l'admin (vous recevez le message)
      const { data: adminData, error: adminError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "FICCON <onboarding@resend.dev>",
        to: [process.env.ADMIN_EMAIL || "delivered@resend.dev"],
        replyTo: email, // Permet de répondre directement au visiteur
        subject: `📧 Nouveau message FICCON — ${sujet || "Contact"}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2a9d6b; margin-bottom: 20px;">📧 Nouveau message de contact</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p style="margin: 10px 0;"><strong>De :</strong> ${prenom} ${nom}</p>
              <p style="margin: 10px 0;"><strong>Email :</strong> <a href="mailto:${email}">${email}</a></p>
              <p style="margin: 10px 0;"><strong>Sujet :</strong> ${sujet || "Contact général"}</p>
              <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 15px 0;">
              <p style="margin: 15px 0 10px; color: #666;">Message :</p>
              <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">
${message}
              </div>
            </div>
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              Répondez directement à cet email pour contacter ${prenom} ${nom}
            </p>
          </div>
        `,
      });

      if (adminError) {
        console.error("Erreur Resend (admin):", adminError);
        return res.status(400).json({ error: adminError.message });
      }

      // 2️⃣ Email de confirmation au visiteur
      const { data: confirmData, error: confirmError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "FICCON <onboarding@resend.dev>",
        to: [email],
        subject: "✅ Message reçu — Équipe FICCON",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2a9d6b;">Merci pour votre message !</h2>
            
            <p style="line-height: 1.6;">Bonjour <strong>${prenom}</strong>,</p>
            
            <p style="line-height: 1.6;">
              Nous avons bien reçu votre message concernant : <strong>${sujet || "Contact général"}</strong>
            </p>
            
            <p style="line-height: 1.6;">
              Notre équipe reviendra vers vous dans les <strong>48 heures</strong>.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 0; color: #666; font-size: 14px;">Votre message :</p>
              <p style="margin: 10px 0; color: #333; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="line-height: 1.6;">À très bientôt,</p>
            <p style="margin: 0;"><strong>L'équipe FICCON</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0 20px;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              FICCON — Foire Internationale de la Culture Congolaise<br>
              30 Mai - 1er Juin 2026 · Parc Floral de Paris
            </p>
          </div>
        `,
      });

      if (confirmError) {
        console.warn("Erreur confirmation visiteur:", confirmError);
      }

      res.status(200).json({
        success: true,
        message: "Email envoyé avec succès",
        adminEmailId: adminData?.id,
        confirmEmailId: confirmData?.id,
      });

    } catch (err) {
      console.error("Erreur sendContactEmail:", err);
      res.status(500).json({ error: "Erreur serveur lors de l'envoi." });
    }
  }

  /**
   * Envoi d'email pour candidature exposant
   */
  static async sendExposantApplication(req, res) {
    try {
      const { prenom, nom, email, telephone, entreprise, secteur, description, ville } = req.body;

      if (!prenom || !nom || !email || !entreprise || !secteur) {
        return res.status(400).json({ error: "Les champs principaux sont requis." });
      }

      // 1️⃣ Email à l'admin (vous recevez la candidature)
      const { data: adminData, error: adminError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "FICCON <onboarding@resend.dev>",
        to: [process.env.ADMIN_EMAIL || "delivered@resend.dev"],
        replyTo: email,
        subject: `🏪 Nouvelle candidature exposant — ${entreprise}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2a9d6b; margin-bottom: 20px;">🏪 Nouvelle candidature exposant</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h3 style="margin-top: 0; color: #333;">${entreprise}</h3>
              
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color: #666; width: 150px;"><strong>Nom complet</strong></td>
                  <td style="padding: 10px 0;">${prenom} ${nom}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color: #666;"><strong>Email</strong></td>
                  <td style="padding: 10px 0;"><a href="mailto:${email}">${email}</a></td>
                </tr>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color: #666;"><strong>Téléphone</strong></td>
                  <td style="padding: 10px 0;">${telephone || "Non renseigné"}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color: #666;"><strong>Secteur</strong></td>
                  <td style="padding: 10px 0;"><span style="background: #2a9d6b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 13px;">${secteur}</span></td>
                </tr>
                <tr style="border-bottom: 1px solid #f0f0f0;">
                  <td style="padding: 10px 0; color: #666;"><strong>Ville / Pays</strong></td>
                  <td style="padding: 10px 0;">${ville || "Non renseigné"}</td>
                </tr>
              </table>
              
              <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #f0f0f0;">
                <p style="margin: 0 0 10px; color: #666; font-weight: bold;">Description du projet :</p>
                <div style="background: #f5f5f5; padding: 15px; border-radius: 6px; white-space: pre-wrap; line-height: 1.6;">
${description || "Aucune description fournie"}
                </div>
              </div>
            </div>
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              Répondez directement à cet email pour contacter le candidat
            </p>
          </div>
        `,
      });

      if (adminError) {
        console.error("Erreur Resend (admin exposant):", adminError);
        return res.status(400).json({ error: adminError.message });
      }

      // 2️⃣ Email de confirmation au candidat
      const { data: confirmData, error: confirmError } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || "FICCON <onboarding@resend.dev>",
        to: [email],
        subject: "✅ Candidature reçue — FICCON Exposants",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9f9f9; border-radius: 8px;">
            <h2 style="color: #2a9d6b;">Candidature bien reçue !</h2>
            
            <p style="line-height: 1.6;">Bonjour <strong>${prenom}</strong>,</p>
            
            <p style="line-height: 1.6;">
              Nous avons bien reçu votre candidature pour devenir exposant à la <strong>FICCON 2026</strong>.
            </p>
            
            <div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 5px 0;"><strong>Entreprise :</strong> ${entreprise}</p>
              <p style="margin: 5px 0;"><strong>Secteur :</strong> ${secteur}</p>
              <p style="margin: 5px 0;"><strong>Ville :</strong> ${ville || "Non renseigné"}</p>
            </div>
            
            <p style="line-height: 1.6;">
              Notre équipe étudiera votre dossier et reviendra vers vous sous <strong>48 heures</strong> pour discuter des modalités de participation.
            </p>
            
            <p style="line-height: 1.6;">À très bientôt,</p>
            <p style="margin: 0;"><strong>L'équipe FICCON</strong></p>
            
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 30px 0 20px;">
            
            <p style="color: #999; font-size: 12px; text-align: center;">
              FICCON — Foire Internationale de la Culture Congolaise<br>
              30 Mai - 1er Juin 2026 · Parc Floral de Paris
            </p>
          </div>
        `,
      });

      if (confirmError) {
        console.warn("Erreur confirmation exposant:", confirmError);
      }

      res.status(200).json({
        success: true,
        message: "Candidature envoyée avec succès",
        adminEmailId: adminData?.id,
        confirmEmailId: confirmData?.id,
      });

    } catch (err) {
      console.error("Erreur sendExposantApplication:", err);
      res.status(500).json({ error: "Erreur serveur lors de l'envoi." });
    }
  }
}