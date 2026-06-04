"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import "../../page.css";
import "./register.css";

function IconUser() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
}

function IconEmail() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  );
}

function IconLock() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
}

function IconEye() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
}

function IconEyeOff() {
  return (
    <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

function IconAlert() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}

function IconCheck() {
  return (
    <svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink: 0}}>
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
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
  const { t } = useLanguage();

  function getPasswordStrength(pwd: string) {
    if (!pwd) return null;
    const hasLetter = /[a-zA-Z]/.test(pwd);
    const hasNumber = /[0-9]/.test(pwd);
    const hasSpecial = /[!@#$%^&*]/.test(pwd);
    const score = [hasLetter, hasNumber, hasSpecial, pwd.length >= 8, pwd.length >= 12].filter(Boolean).length;
    if (score <= 2) return { label: t.register.strength.weak, color: "#ef4444", width: "33%" };
    if (score <= 3) return { label: t.register.strength.medium, color: "#f59e0b", width: "66%" };
    return { label: t.register.strength.strong, color: "#10b981", width: "100%" };
  }

  function validatePassword(pwd: string): string[] {
    const errors: string[] = [];
    if (pwd.length < 8) errors.push(t.register.validation.minChars);
    if (!/[a-zA-Z]/.test(pwd)) errors.push(t.register.validation.needLetter);
    if (!/[0-9]/.test(pwd)) errors.push(t.register.validation.needNumber);
    return errors;
  }

  function validateEmail(em: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
  }

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage("");

    if (name.trim().length < 2 || name.trim().length > 50) {
      setMessageType("error");
      return setMessage(t.register.errors.nameLength);
    }

    if (!validateEmail(email)) {
      setMessageType("error");
      return setMessage(t.register.errors.invalidEmail);
    }

    const pwdErrors = validatePassword(password);
    if (pwdErrors.length > 0) {
      setMessageType("error");
      return setMessage(pwdErrors.join(", "));
    }

    if (password !== confirmPassword) {
      setMessageType("error");
      return setMessage(t.register.errors.noMatch);
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
        return setMessage(data.message || t.register.errors.server);
      }

      setMessage(t.register.success);
      setMessageType("success");

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);

    } catch {
      setMessageType("error");
      setMessage(t.register.errors.server);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container">
      <Navbar />

      <div className="register-Zone">
        <div className="register-card">

          <div className="register-header">
            <div className="register-logo">WYBOB</div>
            <p className="register-welcome">{t.register.welcome}</p>
          </div>

          <div className="register-inputs">

            <div className="register-field">
              <label>{t.register.nameLabel}</label>
              <div className="register-input-wrap">
                <IconUser />
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label>{t.register.emailLabel}</label>
              <div className="register-input-wrap">
                <IconEmail />
                <input
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label>{t.register.passwordLabel}</label>
              <div className="register-input-wrap">
                <IconLock />
                <input
                  type={showPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? t.register.hide : t.register.show}>
                  {showPwd ? <IconEyeOff /> : <IconEye />}
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

            <div className="register-field">
              <label>{t.register.confirmLabel}</label>
              <div className="register-input-wrap">
                <IconLock />
                <input
                  type={showConfirmPwd ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} aria-label={showConfirmPwd ? t.register.hide : t.register.show}>
                  {showConfirmPwd ? <IconEyeOff /> : <IconEye />}
                </button>
              </div>
            </div>

          </div>

          {message && (
            <div className={`register-message ${messageType}`}>
              {messageType === "error" ? <IconAlert /> : <IconCheck />}
              <span>{message}</span>
            </div>
          )}

          <button className="register-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? t.register.loading : t.register.submit}
          </button>

          <div className="register-footer">
            <p>{t.register.hasAccount}</p>
            <Link href="/auth/login">{t.register.login}</Link>
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}
