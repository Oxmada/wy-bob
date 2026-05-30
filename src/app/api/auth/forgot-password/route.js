import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import { sendEmail } from "@/app/lib/mailer";
import { getPasswordResetEmailTemplate } from "@/app/lib/emailTemplates";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req) {
  try {
    await connectDB();

    const { email } = await req.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ message: "Adresse email invalide" }, { status: 400 });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });

    // Toujours répondre 200 pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json(
        { message: "Si cet email existe, un lien de réinitialisation a été envoyé." },
        { status: 200 }
      );
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 heure

    user.resetToken = token;
    user.resetTokenExpiry = expiry;
    await user.save();

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${token}`;
    const html = getPasswordResetEmailTemplate(user.name, resetUrl);

    sendEmail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe WYBOB",
      html,
    }).catch(err => console.error("Erreur envoi email reset:", err));

    return NextResponse.json(
      { message: "Si cet email existe, un lien de réinitialisation a été envoyé." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Erreur forgot-password:", error);
    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}
