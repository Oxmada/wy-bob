"use client";

import { useState, useRef } from "react";
import styles from "./products.module.css";

const CATEGORIES = ["Homme", "Femme", "Enfant", "Unisexe", "Pull-Lover", "Accessoire"];
const CLOUD_NAME = "dnm9txjhm";

export default function AddProductModal({ onClose, onSuccess }) {
  const [form, setForm] = useState({ name: "", color: "", description: "", price: "", pricePromo: "", stock: "" });
  const [imageFiles,  setImageFiles]  = useState([]);
  const [imageUrls,   setImageUrls]   = useState([]);
  const [uploading,   setUploading]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [error,       setError]       = useState(null);
  const fileRef = useRef(null);

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setImageFiles(files);
    setImageUrls([]);
    setError(null);

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!preset) return; // will show URL count as 0

    setUploading(true);
    const uploaded = [];
    try {
      for (const file of files) {
        const fd = new FormData();
        fd.append("file",           file);
        fd.append("upload_preset",  preset);
        fd.append("folder",         "products");
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
          method: "POST",
          body:   fd,
        });
        const data = await res.json();
        if (data.secure_url) uploaded.push(data.secure_url);
        else setError(`Upload échoué : ${data.error?.message || "erreur inconnue"}`);
      }
      setImageUrls(uploaded);
    } catch {
      setError("Erreur lors de l'upload des images");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.name.trim())            return setError("Le nom du produit est requis");
    if (!form.price || Number(form.price) <= 0) return setError("Un prix valide est requis");
    if (imageFiles.length > 0 && imageUrls.length === 0 && !uploading) {
      return setError("Veuillez patienter, l'upload est en cours…");
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/admin/products", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name:        form.name.trim(),
          color:       form.color,
          description: form.description.trim(),
          price:       Number(form.price),
          pricePromo:  form.pricePromo ? Number(form.pricePromo) : null,
          stock:       form.stock ? Number(form.stock) : 0,
          image:       imageUrls[0] || "",
        }),
      });
      const data = await res.json();
      if (data.success) {
        onSuccess(data.product);
        onClose();
      } else {
        setError(data.error || "Erreur lors de la création");
      }
    } catch {
      setError("Erreur serveur");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Ajouter un produit</h2>
          <button type="button" className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>

          {/* Nom */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>
              NOM DU PRODUIT <span className={styles.required}>*</span>
            </label>
            <input
              type="text"
              placeholder="Ex : Le Bob Marley"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className={styles.fieldInput}
            />
          </div>

          {/* Stock */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>STOCK</label>
            <input
              type="number"
              min="0"
              step="1"
              placeholder="Ex : 50"
              value={form.stock}
              onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
              className={styles.fieldInput}
            />
          </div>

          {/* Description */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>DESCRIPTION</label>
            <textarea
              placeholder="Décrivez le produit…"
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className={styles.fieldTextarea}
              rows={4}
            />
          </div>

          {/* Prix row */}
          <div className={styles.fieldRow}>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>
                PRIX <span className={styles.required}>*</span>
              </label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Ex : 45000"
                value={form.price}
                onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                className={styles.fieldInput}
              />
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>PRIX PROMO</label>
              <input
                type="number"
                min="0"
                step="1"
                placeholder="Optionnel"
                value={form.pricePromo}
                onChange={e => setForm(f => ({ ...f, pricePromo: e.target.value }))}
                className={styles.fieldInput}
              />
            </div>
          </div>

          {/* Catégorie */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>CATÉGORIE</label>
            <select
              value={form.color}
              onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              className={styles.fieldSelect}
            >
              <option value="">-- Choisir --</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Images */}
          <div className={styles.fieldGroup}>
            <label className={styles.fieldLabel}>IMAGES DU PRODUIT</label>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFiles}
              className={styles.fileInput}
            />
            <p className={styles.uploadStatus}>
              {uploading
                ? "Upload en cours…"
                : `${imageUrls.length} image${imageUrls.length !== 1 ? "s" : ""} sur Cloudinary${imageUrls.length > 0 ? " ✅" : ""}`
              }
            </p>
          </div>

          {/* Erreur */}
          {error && <p className={styles.errorMsg}>{error}</p>}

          {/* Actions */}
          <div className={styles.modalActions}>
            <button
              type="submit"
              className={styles.btnSubmit}
              disabled={submitting || uploading}
            >
              {submitting ? "Enregistrement…" : "Enregistrer"}
            </button>
            <button type="button" className={styles.btnCancelModal} onClick={onClose}>
              Annuler
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
