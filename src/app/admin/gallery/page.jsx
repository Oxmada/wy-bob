"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import styles from "./gallery-admin.module.css";

const CLOUD_NAME = "dnm9txjhm";

export default function AdminGalleryPage() {
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [toast,     setToast]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const fileRef = useRef(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      const res  = await fetch("/api/admin/gallery");
      const data = await res.json();
      if (data.success) setPhotos(data.photos);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!preset) {
      showToast("Variable NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET manquante", "error");
      return;
    }

    setUploading(true);
    let added = 0;
    for (const file of files) {
      try {
        const fd = new FormData();
        fd.append("file",          file);
        fd.append("upload_preset", preset);
        fd.append("folder",        "galerie");
        const up   = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method: "POST", body: fd });
        const data = await up.json();
        if (data.secure_url) {
          await fetch("/api/admin/gallery", {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: data.secure_url, publicId: data.public_id }),
          });
          added++;
        }
      } catch {
        /* skip failed file */
      }
    }

    if (added > 0) {
      showToast(`${added} photo${added > 1 ? "s" : ""} ajoutée${added > 1 ? "s" : ""}`);
      await loadPhotos();
    } else {
      showToast("Échec de l'upload", "error");
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const askDelete = (photo) => {
    setConfirm({
      message: "Supprimer cette photo de la galerie ?",
      confirmLabel: "Supprimer",
      onConfirm: async () => {
        const res  = await fetch(`/api/admin/gallery/${photo._id}`, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          setPhotos(prev => prev.filter(p => p._id !== photo._id));
          showToast("Photo supprimée");
        } else {
          showToast("Erreur lors de la suppression", "error");
        }
      },
    });
  };

  return (
    <div className={styles.page}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {confirm && (
        <div className={styles.confirmOverlay} onClick={() => setConfirm(null)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmMsg}>{confirm.message}</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setConfirm(null)}>Annuler</button>
              <button
                className={styles.confirmOk}
                onClick={() => { confirm.onConfirm(); setConfirm(null); }}
              >
                {confirm.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className={styles.topbar}>
        <Link href="/admin/dashboard" className={styles.backBtn}>← Dashboard</Link>
        <h1 className={styles.topbarTitle}>Galerie photo</h1>
      </div>

      {/* Upload */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Ajouter des photos</h2>
        </div>
        <label className={`${styles.uploadLabel} ${uploading ? styles.uploadLabelDisabled : ""}`}>
          <span className={styles.uploadIcon}>+</span>
          <span>{uploading ? "Upload en cours…" : "Choisir des photos (plusieurs possibles)"}</span>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
            disabled={uploading}
            className={styles.hiddenInput}
          />
        </label>
        <p className={styles.uploadHint}>Formats acceptés : JPG, PNG, WebP — upload vers Cloudinary</p>
      </section>

      {/* Photos grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Photos ({photos.length})</h2>
        </div>

        {loading ? (
          <div className={styles.stateEmpty}>Chargement…</div>
        ) : photos.length === 0 ? (
          <div className={styles.stateEmpty}>Aucune photo — ajoutez-en via le bouton ci-dessus.</div>
        ) : (
          <div className={styles.photosGrid}>
            {photos.map((photo, i) => (
              <div key={photo._id} className={styles.photoCard}>
                <div className={styles.photoImgWrap}>
                  <img src={photo.url} alt={`Photo galerie ${i + 1}`} className={styles.photoImg} />
                </div>
                <div className={styles.photoActions}>
                  <button className={styles.btnDelete} onClick={() => askDelete(photo)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

    </div>
  );
}
