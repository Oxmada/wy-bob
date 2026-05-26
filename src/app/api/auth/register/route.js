import { connectDB } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mailer";
import { getVerificationEmailTemplate } from "@/lib/emailTemplates";

/* ===== RATE LIMITING ===== */
const registrationAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 5;
  if (!registrationAttempts.has(ip)) registrationAttempts.set(ip, []);
  const attempts = registrationAttempts.get(ip);
  const recentAttempts = attempts.filter(t => now - t < windowMs);
  registrationAttempts.set(ip, recentAttempts);
  if (recentAttempts.length >= maxAttempts) {
    const retryAfter = Math.ceil((recentAttempts[0] + windowMs - now) / 1000);
    return { allowed: false, retryAfter };
  }
  recentAttempts.push(now);
  return { allowed: true };
}

function sanitize(input) {
  if (typeof input !== "string") return input;
  return input.trim().replace(/[<>]/g, "").replace(/javascript:/gi, "").replace(/on\w+=/gi, "");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  const errors = [];
  if (password.length < 8) errors.push("Min 8 caractères");
  if (!/[A-Z]/.test(password)) errors.push("Min 1 majuscule");
  if (!/[a-z]/.test(password)) errors.push("Min 1 minuscule");
  if (!/[0-9]/.test(password)) errors.push("Min 1 chiffre");
  if (!/[!@#$%^&*]/.test(password)) errors.push("Min 1 caractère spécial");
  if (["password", "123456", "12345678"].some(c => password.toLowerCase().includes(c))) {
    errors.push("Mot de passe trop commun");
  }
  return { isValid: errors.length === 0, errors };
}

export async function POST(req) {
  try {
    await connectDB();

    const ip = req.headers.get("x-forwarded-for") || "unknown";

    const rateLimit = checkRateLimit(ip);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { message: `Trop de tentatives. Réessayez dans ${rateLimit.retryAfter} secondes.` },
        { status: 429 }
      );
    }

    const body = await req.json();
    let { name, email, password } = body;

    name = sanitize(name);
    email = sanitize(email)?.toLowerCase();

    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Tous les champs sont obligatoires" },
        { status: 400 }
      );
    }

    if (name.length < 2 || name.length > 50) {
      return NextResponse.json(
        { message: "Le nom doit contenir entre 2 et 50 caractères" },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { message: "Adresse email invalide" },
        { status: 400 }
      );
    }

    const pwdCheck = validatePassword(password);
    if (!pwdCheck.isValid) {
      return NextResponse.json(
        { message: pwdCheck.errors.join(", ") },
        { status: 400 }
      );
    }

    /* ✅ Vérification si email existe déjà */
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    /* Hash mot de passe */
    const hashedPassword = await bcrypt.hash(password, 12);

    /* Créer utilisateur — emailVerified: true direct */
    await User.create({
      name,
      email,
      password: hashedPassword,
      role: "customer",
      emailVerified: true,
    });

    /* 📧 Email de bienvenue en arrière-plan — ne bloque pas */
    const welcomeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`;
    const html = getVerificationEmailTemplate(name, welcomeUrl);

    sendEmail({
      to: email,
      subject: "Bienvenue sur WYBOB 🎩",
      html,
    }).catch(err => console.error("Erreur email bienvenue:", err));

    return NextResponse.json(
      { message: "Compte créé avec succès !" },
      { status: 201 }
    );

  } catch (error) {
    console.error("Erreur inscription:", error);

    if (error.code === 11000) {
      return NextResponse.json({ message: "Email déjà utilisé" }, { status: 400 });
    }

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map(e => e.message);
      return NextResponse.json({ message: messages.join(". ") }, { status: 400 });
    }

    return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
  }
}