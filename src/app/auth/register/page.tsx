"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../../page.css";
import "./register.css";

/* ===== VALIDATION ===== */
function getPasswordStrength(pwd: string) {
  if (!pwd) return null;
  const hasUpper = /[A-Z]/.test(pwd);
  const hasLower = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSpecial = /[!@#$%^&*]/.test(pwd);
  const score = [hasUpper, hasLower, hasNumber, hasSpecial, pwd.length >= 8].filter(Boolean).length;
  if (score <= 2) return { label: "Faible", color: "#ef4444", width: "33%" };
  if (score <= 4) return { label: "Moyen", color: "#f59e0b", width: "66%" };
  return { label: "Fort", color: "#10b981", width: "100%" };
}

function validatePassword(pwd: string): string[] {
  const errors: string[] = [];
  if (pwd.length < 8) errors.push("Min 8 caractères");
  if (!/[A-Z]/.test(pwd)) errors.push("Min 1 majuscule");
  if (!/[a-z]/.test(pwd)) errors.push("Min 1 minuscule");
  if (!/[0-9]/.test(pwd)) errors.push("Min 1 chiffre");
  if (!/[!@#$%^&*]/.test(pwd)) errors.push("Min 1 caractère spécial (!@#$%^&*)");
  return errors;
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
  const router = useRouter();
  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (name.trim().length < 2 || name.trim().length > 50) {
      setMessageType("error");
      return setMessage("Le nom doit contenir entre 2 et 50 caractères");
    }

    if (!validateEmail(email)) {
      setMessageType("error");
      return setMessage("Adresse email invalide");
    }

    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setMessageType("error");
      return setMessage(pwdErrors.join(", "));
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      return setMessage("Les mots de passe ne correspondent pas");
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setMessageType("error");
        return setMessage(data.message || "Erreur");
      }

      setMessage("Compte créé ! Vérifiez votre email avant de vous connecter.");
      setMessageType("success");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch {
      setMessageType("error");
      setMessage("Erreur serveur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Navbar />

      <div className="register-Zone">
        <div className="register-card">

          <h1 className="register-Titre">Créer un compte</h1>

          <div className="register-inputs">

            {/* Nom */}
            <div className="register-field">
              <label>Nom complet</label>
              <div className="register-input-wrap">
                <span>👤</span>
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div className="register-field">
              <label>Adresse e-mail</label>
              <div className="register-input-wrap">
                <span>@</span>
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="register-field">
              <label>Mot de passe</label>
              <div className="register-input-wrap">
                <span>🔒</span>
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}>
                  {showPwd ? "🙈" : "👁"}
                </button>
              </div>
              {strength && (
                <div className="register-strength">
                  <div className="register-strength-bar">
                    <div style={{ width: strength.width, background: strength.color }} />
                  </div>
                  <span style={{ color: strength.color }}>{strength.label}</span>
                </div>
              )}
            </div>

            {/* Confirmer mot de passe */}
            <div className="register-field">
              <label>Confirmer le mot de passe</label>
              <div className="register-input-wrap">
                <span>🔒</span>
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)}>
                  {showConfirmPwd ? "🙈" : "👁"}
                </button>
              </div>
            </div>

          </div>

          {/* Message */}
          {message && (
            <p className={`register-message ${messageType}`}>{message}</p>
          )}

          {/* Bouton */}
          <button className="register-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? "Création..." : "Créer mon compte"}
          </button>

          {/* Footer */}
          <div className="register-footer">
            <p>Vous avez déjà un compte ?</p>
            <Link href="/auth/login">Se connecter</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}