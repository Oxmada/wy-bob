"use client";

import { useState } from "react";
import "@/app/dashboard/dashboard.css";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AddressesClient({ initialAddresses }: { initialAddresses: any[] }) {
  const [addresses, setAddresses] = useState(
    Array.isArray(initialAddresses) ? initialAddresses : []
  );
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);
  const [form, setForm] = useState({
    label: "", fullName: "", street: "", zip: "", city: "", country: "",
  });

  const { t } = useLanguage();
  const a = t.dashboard.addresses;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!form.fullName || !form.street || !form.city || !form.country) return;
    setSaving(true);
    try {
      const res  = await fetch("/api/user/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.addresses) {
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

  const handleDelete = async (index: number) => {
    setDeleting(index);
    try {
      const res  = await fetch("/api/user/addresses", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ index }),
      });
      const data = await res.json();
      if (data.addresses) setAddresses(data.addresses);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <>
      <div>
        <h1 className="db-page-title">{a.title}</h1>
        <div className="db-wrapper">
          <div className="db-card">
            <p className="db-section-title">{a.sectionTitle}</p>

            <div className="db-addresses-grid">
              {addresses.length === 0 && (
                <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
                  {a.noAddresses}
                </p>
              )}

              {addresses.map((addr, i) => (
                <div className="db-address-block" key={i}>
                  <div className="db-address-label">
                    {addr.label || `${a.defaultLabel}${i + 1}`}
                    <button
                      className="db-delete-icon"
                      onClick={() => handleDelete(i)}
                      disabled={deleting === i}
                      aria-label="Supprimer cette adresse"
                    >
                      {deleting === i ? "…" : "✕"}
                    </button>
                  </div>
                  <p className="db-address-text">
                    {addr.fullName}<br />
                    {addr.street}<br />
                    {addr.zip} {addr.city}{addr.country ? `, ${addr.country}` : ""}
                  </p>
                </div>
              ))}

              <button className="db-add-address" onClick={() => setShowModal(true)}>
                <span>+</span>
                {a.addBtn.slice(2)}
              </button>
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="db-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>

            <button className="db-modal-close" onClick={() => setShowModal(false)} aria-label="Fermer">✕</button>
            <h3 className="db-modal-title">{a.modalTitle}</h3>

            <input
              className="db-modal-input"
              name="label"
              placeholder={a.labelPlaceholder}
              value={form.label}
              onChange={handleChange}
            />
            <input
              className="db-modal-input"
              name="fullName"
              placeholder={a.fullNamePlaceholder}
              value={form.fullName}
              onChange={handleChange}
            />
            <input
              className="db-modal-input"
              name="street"
              placeholder={a.streetPlaceholder}
              value={form.street}
              onChange={handleChange}
            />

            <div className="db-modal-row">
              <input
                className="db-modal-input"
                name="zip"
                placeholder={a.zipPlaceholder}
                value={form.zip}
                onChange={handleChange}
              />
              <input
                className="db-modal-input"
                name="city"
                placeholder={a.cityPlaceholder}
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
              <option value="">{a.countryPlaceholder}</option>
              <option value="Madagascar">Madagascar</option>
              <option value="France">France</option>
              <option value="Belgique">Belgique</option>
              <option value="Suisse">Suisse</option>
              <option value="Canada">Canada</option>
            </select>

            <button
              className="db-modal-btn"
              onClick={handleSave}
              disabled={saving || !form.fullName || !form.street || !form.city || !form.country}
            >
              {saving ? a.saving : a.save}
            </button>

          </div>
        </div>
      )}
    </>
  );
}
