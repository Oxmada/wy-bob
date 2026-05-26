"use client";

import { useState } from "react";
import Link from "next/link";
import "@/app/dashboard/dashboard.css";

export default function AddressesClient({ initialAddresses }) {
  const [addresses, setAddresses] = useState(Array.isArray(initialAddresses) ? initialAddresses : []);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    label: "",
    fullName: "",
    street: "",
    zip: "",
    city: "",
    country: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.fullName || !form.street || !form.city) return;
    setSaving(true);
    try {
      const res = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setAddresses(data.addresses);
        setShowModal(false);
        setForm({ label: "", fullName: "", street: "", zip: "", city: "", country: "" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="db-addresses-grid">
        {addresses.length === 0 && (
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Aucune adresse enregistrée.
          </p>
        )}

        {addresses.map((addr, i) => (
          <div className="db-address-block" key={i}>
            <div className="db-address-label">
              Adresse n°{i + 1}
              {/* ← Pas d'emoji ici, l'icône crayon est générée via CSS ::before */}
              <Link
                href={`/dashboard/addresses?edit=${i}`}
                className="db-edit-icon"
                title="Modifier"
              />
            </div>
            <p className="db-address-text">
              {addr.fullName}<br />
              {addr.street}<br />
              {addr.zip} {addr.city}, {addr.country}
            </p>
          </div>
        ))}

        {/* Bouton ajouter */}
        <button className="db-add-address" onClick={() => setShowModal(true)}>
          <span className="db-add-address-plus">+</span>
          Ajouter une adresse
        </button>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <div className="db-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>

            <button className="db-modal-close" onClick={() => setShowModal(false)}>✕</button>
            <h3 className="db-modal-title">Ma nouvelle adresse</h3>

            <input
              className="db-modal-input"
              name="label"
              placeholder="Nom de l'adresse"
              value={form.label}
              onChange={handleChange}
            />
            <input
              className="db-modal-input"
              name="fullName"
              placeholder="Nom complet (prénom et nom)"
              value={form.fullName}
              onChange={handleChange}
            />
            <input
              className="db-modal-input"
              name="street"
              placeholder="Adresse (numéro et nom de rue)"
              value={form.street}
              onChange={handleChange}
            />
            <div className="db-modal-row">
              <input
                className="db-modal-input"
                name="zip"
                placeholder="Code postal"
                value={form.zip}
                onChange={handleChange}
              />
              <input
                className="db-modal-input"
                name="city"
                placeholder="Ville"
                value={form.city}
                onChange={handleChange}
              />
            </div>
            <select
              className="db-modal-input db-modal-select"
              name="country"
              value={form.country}
              onChange={handleChange}
            >
              <option value="">Pays</option>
              <option value="Madagascar">Madagascar</option>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>

            <button
              className="db-modal-btn"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Enregistrement..." : "Enregistrer"}
            </button>

          </div>
        </div>
      )}
    </>
  );
}