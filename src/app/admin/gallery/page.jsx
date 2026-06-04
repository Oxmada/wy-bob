"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./gallery-admin.module.css";

const CLOUD_NAME = "dnm9txjhm";

/* ── Carte photo draggable ── */
function SortablePhoto({ photo, index, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    zIndex: isDragging ? 10 : "auto",
  };

  return (
    <div ref={setNodeRef} style={style} className={styles.photoCard}>
      {/* Poignée drag */}
      <div className={styles.dragHandle} {...attributes} {...listeners} title="Déplacer">
        <span className={styles.dragDots}>⠿</span>
      </div>
      <div className={styles.photoImgWrap}>
        <img src={photo.url} alt={`Photo galerie ${index + 1}`} className={styles.photoImg} />
      </div>
      <div className={styles.photoActions}>
        <button
          className={styles.btnDelete}
          onPointerDown={e => e.stopPropagation()}
          onClick={() => onDelete(photo)}
        >
          Supprimer
        </button>
      </div>
    </div>
  );
}

/* ── Page principale ── */
export default function AdminGalleryPage() {
  const [photos,    setPhotos]    = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving,    setSaving]    = useState(false);
  const [activeId,  setActiveId]  = useState(null);
  const [toast,     setToast]     = useState(null);
  const [confirm,   setConfirm]   = useState(null);
  const fileRef     = useRef(null);
  const saveTimeout = useRef(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

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

  /* Sauvegarde de l'ordre (auto après drag, avec debounce) */
  const saveOrder = useCallback(async (ordered) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(async () => {
      setSaving(true);
      try {
        await fetch("/api/admin/gallery", {
          method:  "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderedIds: ordered.map(p => p._id) }),
        });
        showToast("Ordre sauvegardé");
      } catch {
        showToast("Erreur lors de la sauvegarde", "error");
      } finally {
        setSaving(false);
      }
    }, 600);
  }, []);

  const handleDragStart = ({ active }) => setActiveId(active.id);

  const handleDragEnd = ({ active, over }) => {
    setActiveId(null);
    if (!over || active.id === over.id) return;
    setPhotos(prev => {
      const oldIndex = prev.findIndex(p => p._id === active.id);
      const newIndex = prev.findIndex(p => p._id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex);
      saveOrder(reordered);
      return reordered;
    });
  };

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (!preset) {
      showToast("Variable NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET manquante", "error");
      return;
    }

    const tooHeavy = files.filter(f => f.size > 500 * 1024);
    if (tooHeavy.length > 0) {
      const names = tooHeavy.map(f => `${f.name} (${(f.size / 1024).toFixed(0)} Ko)`).join(", ");
      showToast(`Image${tooHeavy.length > 1 ? "s" : ""} trop lourde${tooHeavy.length > 1 ? "s" : ""} — max 500 Ko : ${names}`, "error");
      if (fileRef.current) fileRef.current.value = "";
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

  const activePhoto = photos.find(p => p._id === activeId);

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
        {saving && <span className={styles.savingBadge}>Sauvegarde…</span>}
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

      {/* Photos grid avec drag-and-drop */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Photos ({photos.length})</h2>
          {photos.length > 1 && (
            <p className={styles.dragHint}>Glissez les photos pour réorganiser</p>
          )}
        </div>

        {loading ? (
          <div className={styles.stateEmpty}>Chargement…</div>
        ) : photos.length === 0 ? (
          <div className={styles.stateEmpty}>Aucune photo — ajoutez-en via le bouton ci-dessus.</div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={photos.map(p => p._id)} strategy={rectSortingStrategy}>
              <div className={styles.photosGrid}>
                {photos.map((photo, i) => (
                  <SortablePhoto
                    key={photo._id}
                    photo={photo}
                    index={i}
                    onDelete={askDelete}
                  />
                ))}
              </div>
            </SortableContext>

            {/* Aperçu flottant pendant le drag */}
            <DragOverlay>
              {activePhoto && (
                <div className={`${styles.photoCard} ${styles.photoCardDragging}`}>
                  <div className={styles.photoImgWrap}>
                    <img src={activePhoto.url} alt="" className={styles.photoImg} />
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </section>

    </div>
  );
}
