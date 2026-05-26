export function getVerificationEmailTemplate(name, dashboardUrl) {
  return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; background: #f9f9f9; border-radius: 16px;">
      
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1B1843; font-size: 28px; font-weight: 700;">WYBOB 🎩</h1>
      </div>

      <h2 style="color: #1B1843; font-size: 22px; text-align: center;">
        Bienvenue ${name} ! 🎉
      </h2>

      <p style="color: #444; font-size: 16px; line-height: 1.6; text-align: center; margin: 20px 0;">
        Votre compte WYBOB a été créé avec succès. Vous pouvez maintenant accéder à votre espace personnel.
      </p>

      <div style="text-align: center; margin: 32px 0;">
        <a href="${dashboardUrl}" style="
          background-color: #F9C464;
          color: #1B1843;
          padding: 14px 40px;
          border-radius: 50px;
          text-decoration: none;
          font-weight: 700;
          font-size: 16px;
          display: inline-block;
        ">
          Accéder à mon compte
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />

      <p style="color: #888; font-size: 12px; text-align: center;">
        © 2026 WYBOB — Créé avec âme. Porté avec lumière.
      </p>

    </div>
  `;
}