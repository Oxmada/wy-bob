"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./referral-admin.module.css";

export default function ReferralAdminPage() {
  const [config, setConfig]   = useState(null);
  const [stats, setStats]     = useState({ totalReferralCodes: 0, totalConversions: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const [form, setForm] = useState({
    totalPercent: 10,
    rewardValidityDays: 30,
    active: false,
  });

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch("/api/admin/referral/config");
        const data = await res.json();
        if (data.success) {
          setConfig(data.config);
          setStats(data.stats);
          setForm({
            totalPercent: data.config.totalPercent,
            rewardValidityDays: data.config.rewardValidityDays,
            active: data.config.active,
          });
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/referral/config", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalPercent: Number(form.totalPercent),
          rewardValidityDays: Number(form.rewardValidityDays),
          active: form.active,
        }),
      });
      const data = await res.json();
      if (!res.ok) { showToast(data.message || "Erreur", "error"); return; }
      setConfig(data.config);
      showToast("Configuration enregistrée !");
    } catch {
      showToast("Erreur serveur", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.page}>

      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.topbar}>
        <Link href="/admin/dashboard" className={styles.backBtn}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Dashboard
        </Link>
        <div>
          <h1 className={styles.topbarTitle}>Parrainage</h1>
          <p className={styles.topbarSub}>
            Programme actif&nbsp;:&nbsp;
            <span className={config?.active ? styles.badgeActive : styles.badgeInactive}>
              {config?.active ? "Oui" : "Non"}
            </span>
          </p>
        </div>
      </div>

      {loading ? (
        <p style={{ color: "#78716c" }}>Chargement…</p>
      ) : (
        <>
          <div className={styles.grid}>
            {/* Stats */}
            <div className={styles.card}>
              <p className={styles.cardTitle}>Statistiques</p>
              <div className={styles.statRow}>
                <div className={styles.statItem}>
                  <p className={styles.statValue}>{stats.totalReferralCodes}</p>
                  <p className={styles.statLabel}>Parrains actifs</p>
                </div>
                <div className={styles.statItem}>
                  <p className={styles.statValue}>{stats.totalConversions}</p>
                  <p className={styles.statLabel}>Filleuls convertis</p>
                </div>
              </div>
            </div>

            {/* Config */}
            <div className={styles.card}>
              <p className={styles.cardTitle}>Configuration</p>

              <div className={styles.toggleRow}>
                <div>
                  <p className={styles.toggleLabel}>Programme actif</p>
                  <p className={styles.toggleSub}>Les clients peuvent accéder à leur code de parrainage</p>
                </div>
                <label className={styles.toggle}>
                  <input
                    type="checkbox"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <span className={styles.toggleSlider} />
                </label>
              </div>

              <div className={styles.formGroup} style={{ marginTop: 16 }}>
                <label className={styles.label}>
                  Enveloppe totale <span className={styles.labelHint}>(% à distribuer entre parrain et filleul)</span>
                </label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  max="100"
                  value={form.totalPercent}
                  onChange={(e) => setForm({ ...form, totalPercent: e.target.value })}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>
                  Validité récompense parrain <span className={styles.labelHint}>(jours)</span>
                </label>
                <input
                  className={styles.input}
                  type="number"
                  min="1"
                  value={form.rewardValidityDays}
                  onChange={(e) => setForm({ ...form, rewardValidityDays: e.target.value })}
                />
              </div>

              <div className={styles.actions}>
                <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleSave} disabled={saving}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className={styles.card} style={{ maxWidth: 700 }}>
            <p className={styles.cardTitle}>Comment ça fonctionne</p>
            <p style={{ fontSize: 13.5, color: "#44403c", lineHeight: 1.7, margin: 0 }}>
              Chaque client connecté dispose d'un code de parrainage unique. Il peut choisir de garder tout le pourcentage pour lui-même
              (récompense différée) ou d'en offrir une partie à son filleul (réduction immédiate au checkout).
              Quand un filleul commande avec le code, le parrain reçoit automatiquement un bon de réduction à usage unique par email.
              L'enveloppe totale définit le plafond que vous accordez — ex: {form.totalPercent}% signifie que parrain + filleul ne peuvent pas dépasser {form.totalPercent}% au total.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
