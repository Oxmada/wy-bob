"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../../page.css";
import "../login/login.css";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Lien invalide. Veuillez refaire une demande de réinitialisation.");
    }
  }, [token]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");

    if (password !== confirm) {
      setStatus("error");
      setMessage("Les mots de passe ne correspondent pas.");
      return;
    }

    setStatus("loading");

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.message || "Une erreur est survenue");
      } else {
        setStatus("success");
        setMessage(data.message);
        setTimeout(() => router.push("/auth/login"), 2500);
      }
    } catch {
      setStatus("error");
      setMessage("Erreur réseau. Veuillez réessayer.");
    }
  }

  return (
    <div className="loginZone">
      <div className="login-card">

        <div style={{ textAlign: "center", marginBottom: "8px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#111", margin: 0 }}>
            Nouveau mot de passe
          </h2>
          <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
            Choisissez un nouveau mot de passe sécurisé.
          </p>
        </div>

        {status === "success" ? (
          <div style={{ textAlign: "center" }}>
            <p style={{ fontSize: "14px", color: "#2e7d32", lineHeight: 1.6 }}>
              {message}
            </p>
            <p style={{ fontSize: "13px", color: "#888", marginTop: "8px" }}>
              Redirection vers la connexion...
            </p>
          </div>
        ) : status === "error" && !token ? (
          <div style={{ textAlign: "center" }}>
            <p className="login-error">{message}</p>
            <Link
              href="/auth/forgot-password"
              style={{ display: "inline-block", marginTop: "16px", fontSize: "13px", color: "#667eea", textDecoration: "none" }}
            >
              Faire une nouvelle demande
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="login-inputs">
              <div className="login-field">
                <label>Nouveau mot de passe</label>
                <div className="login-input-wrap">
                  <span>🔒</span>
                  <input
                    type={showPwd ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    {showPwd ? "🙈" : "👁"}
                  </button>
                </div>
              </div>

              <div className="login-field">
                <label>Confirmer le mot de passe</label>
                <div className="login-input-wrap">
                  <span>🔒</span>
                  <input
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••••••"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} aria-label={showConfirm ? "Masquer le mot de passe" : "Afficher le mot de passe"}>
                    {showConfirm ? "🙈" : "👁"}
                  </button>
                </div>
              </div>
            </div>

            <p style={{ fontSize: "11px", color: "#aaa", marginTop: "8px" }}>
              Min. 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial (!@#$%^&*)
            </p>

            <div className="login-actions" style={{ marginTop: "16px" }}>
              {status === "error" && (
                <p className="login-error">{message}</p>
              )}

              <button
                type="submit"
                className="login-btn"
                disabled={status === "loading" || !password || !confirm}
              >
                {status === "loading" ? "Enregistrement..." : "Réinitialiser le mot de passe"}
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
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container">
      <Navbar />
      <Suspense fallback={<div className="loginZone"><div className="login-card">Chargement...</div></div>}>
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </div>
  );
}
