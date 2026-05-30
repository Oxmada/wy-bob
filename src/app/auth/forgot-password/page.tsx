"use client";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../../page.css";
import "../login/login.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      let data: { message?: string } = {};
      try { data = await res.json(); } catch { /* réponse non-JSON */ }

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Une erreur est survenue");
      } else {
        setStatus("success");
        setMessage(data.message || "Si cet email existe, un lien a été envoyé.");
      }
    } catch {
      setStatus("error");
      setMessage("Impossible de contacter le serveur. Vérifiez votre connexion.");
    }
  }

  return (
    <div className="container">
      <Navbar />

      <div className="loginZone">
        <div className="login-card">

          <div style={{ textAlign: "center", marginBottom: "8px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", margin: 0 }}>
              Mot de passe oublié
            </h2>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
              Entrez votre adresse email pour recevoir un lien de réinitialisation.
            </p>
          </div>

          {status === "success" ? (
            <div style={{ textAlign: "center" }}>
              <p style={{ fontSize: "14px", color: "#2e7d32", lineHeight: 1.6 }}>
                {message}
              </p>
              <Link
                href="/auth/login"
                style={{
                  display: "inline-block",
                  marginTop: "20px",
                  fontSize: "13px",
                  color: "#667eea",
                  textDecoration: "none",
                }}
              >
                Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="login-inputs">
                <div className="login-field">
                  <label>Adresse e-mail</label>
                  <div className="login-input-wrap">
                    <span>@</span>
                    <input
                      type="email"
                      placeholder="Tom.exemple@gmail.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="login-actions" style={{ marginTop: "20px" }}>
                {status === "error" && (
                  <p className="login-error">{message}</p>
                )}

                <button
                  type="submit"
                  className="login-btn"
                  disabled={status === "loading" || !email}
                >
                  {status === "loading" ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </div>
            </form>
          )}

          <div className="login-footer">
            <p>Vous vous souvenez ?</p>
            <Link href="/auth/login">Se connecter</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
