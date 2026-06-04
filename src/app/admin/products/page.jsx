"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./products.module.css";
import AddProductModal from "./AddProductModal";

const LOW_STOCK_THRESHOLD = 3;

const STATUS_FILTERS = [
  { label: "Tous",        value: "all" },
  { label: "Stock faible", value: "low" },
  { label: "Rupture",     value: "out" },
];

export default function AdminProductsPage() {
  const [products,       setProducts]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter,   setStatusFilter]   = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort,           setSort]           = useState("createdAt");
  const [sortDir,        setSortDir]        = useState("desc");
  const [stats,          setStats]          = useState({ total: 0, lowStock: 0, outOfStock: 0 });
  const [categories,     setCategories]     = useState([]);
  const [busy,           setBusy]           = useState({});
  const [toast,          setToast]          = useState(null);
  const [confirmModal,   setConfirmModal]   = useState(null);
  const [exporting,      setExporting]      = useState(false);
  const [showAddModal,   setShowAddModal]   = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const askConfirm = (message, onConfirm, confirmLabel = "Confirmer") =>
    setConfirmModal({ message, onConfirm, confirmLabel });

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statusFilter, sort, sortDir]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (statusFilter !== "all") params.append("status", statusFilter);
      params.append("sort",  sort);
      params.append("order", sortDir);

      const res  = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setStats(data.stats);
        const cats = [...new Set(data.products.map(p => p.color).filter(Boolean))];
        setCategories(cats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sort === field) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSort(field); setSortDir("desc"); }
  };

  const toggleVisible = async (id, current) => {
    setBusy(b => ({ ...b, [id]: true }));
    try {
      const res = await fetch(`/api/admin/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visible: !current }),
      });
      if (res.ok) {
        setProducts(prev => prev.map(p => p._id === id ? { ...p, visible: !current } : p));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBusy(b => ({ ...b, [id]: false }));
    }
  };

  const deleteProduct = (id, name) => {
    askConfirm(
      `Supprimer le produit "${name}" définitivement ?`,
      async () => {
        try {
          const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
          if (res.ok) {
            setProducts(prev => prev.filter(p => p._id !== id));
            setStats(prev => ({ ...prev, total: prev.total - 1 }));
            showToast("Produit supprimé");
          } else {
            showToast("Erreur lors de la suppression", "error");
          }
        } catch {
          showToast("Erreur lors de la suppression", "error");
        }
      },
      "Supprimer"
    );
  };

  const exportCSV = async () => {
    setExporting(true);
    try {
      const res  = await fetch("/api/admin/products?sort=createdAt&order=desc");
      const data = await res.json();
      if (!data.success) return;

      const headers = ["Nom", "Catégorie", "Prix (€)", "Stock", "Visible", "Ajouté le"];
      const rows = data.products.map(p => [
        p.name,
        p.color || "—",
        p.price,
        p.stock,
        p.visible ? "Oui" : "Non",
        new Date(p.createdAt).toLocaleDateString("fr-FR"),
      ].join(";"));

      const csv  = [headers.join(";"), ...rows].join("\n");
      const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `produits_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const visibleProducts = categoryFilter === "all"
    ? products
    : products.filter(p => p.color === categoryFilter);

  const handleProductAdded = (newProduct) => {
    setProducts(prev => [newProduct, ...prev]);
    setStats(prev => ({ ...prev, total: prev.total + 1 }));
    showToast("Produit ajouté avec succès");
  };

  const getStatus = (stock) => {
    if (stock === 0) return { label: "Rupture",      cls: styles.statusOut };
    if (stock <= LOW_STOCK_THRESHOLD) return { label: "Stock faible", cls: styles.statusLow };
    return { label: "Disponible", cls: styles.statusOk };
  };

  return (
    <div className={styles.page}>

      {/* Modal ajout produit */}
      {showAddModal && (
        <AddProductModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleProductAdded}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${toast.type === "error" ? styles.toastError : styles.toastSuccess}`}>
          {toast.message}
        </div>
      )}

      {/* Modal confirmation */}
      {confirmModal && (
        <div className={styles.confirmOverlay} onClick={() => setConfirmModal(null)}>
          <div className={styles.confirmDialog} onClick={e => e.stopPropagation()}>
            <p className={styles.confirmMsg}>{confirmModal.message}</p>
            <div className={styles.confirmActions}>
              <button className={styles.confirmCancel} onClick={() => setConfirmModal(null)}>Annuler</button>
              <button
                className={styles.confirmOk}
                onClick={() => { confirmModal.onConfirm(); setConfirmModal(null); }}
              >
                {confirmModal.confirmLabel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Topbar */}
      <div className={styles.topbar}>
        <Link href="/admin/dashboard" className={styles.backBtn}>← Dashboard</Link>
        <h1 className={styles.topbarTitle}>Produits &amp; Stock</h1>
        <button className={styles.btnExport} onClick={exportCSV} disabled={exporting}>
          {exporting ? "Export…" : "↓ Export CSV"}
        </button>
        <button className={styles.btnAdd} onClick={() => setShowAddModal(true)}>
          + Ajouter un produit
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input
          type="text"
          placeholder="Rechercher un produit…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <div className={styles.divider} />
        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          className={styles.categorySelect}
        >
          <option value="all">Toutes catégories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <div className={styles.divider} />
        <div className={styles.filters}>
          {STATUS_FILTERS.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`${styles.filterBtn} ${statusFilter === f.value ? styles.filterBtnActive : ""}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className={styles.divider} />
        <button
          className={`${styles.sortBtn} ${sort === "createdAt" ? styles.sortBtnActive : ""}`}
          onClick={() => handleSort("createdAt")}
        >
          Date création {sort === "createdAt" ? (sortDir === "desc" ? "▼" : "▲") : ""}
        </button>
        <button className={styles.sortDirBtn} onClick={() => setSortDir(d => d === "desc" ? "asc" : "desc")}>
          {sortDir === "desc" ? "↓" : "↑"}
        </button>
        <div className={styles.divider} />
        <div className={styles.statsInline}>
          <div className={styles.statChip}>
            <span className={styles.statValue}>{stats.total}</span>
            <span className={styles.statLabel}>TOTAL</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.statChip}>
            <span className={`${styles.statValue} ${styles.statLow}`}>{stats.lowStock}</span>
            <span className={styles.statLabel}>FAIBLE</span>
          </div>
          <div className={styles.statSep} />
          <div className={styles.statChip}>
            <span className={`${styles.statValue} ${styles.statOut}`}>{stats.outOfStock}</span>
            <span className={styles.statLabel}>RUPTURE</span>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.stateEmpty}>
            <span className={styles.stateIcon}>⏳</span>
            Chargement…
          </div>
        ) : visibleProducts.length === 0 ? (
          <div className={styles.stateEmpty}>
            <span className={styles.stateIcon}>📦</span>
            Aucun produit trouvé
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PRODUIT</th>
                <th>CATÉGORIE</th>
                <th>PRIX</th>
                <th>STOCK PAR TAILLE</th>
                <th>STATUT</th>
                <th>VISIBLE</th>
                <th>AJOUTÉ LE</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {visibleProducts.map(product => {
                const status  = getStatus(product.stock);
                const isBusy  = busy[product._id];
                return (
                  <tr key={product._id}>

                    {/* Produit */}
                    <td>
                      <div className={styles.productCell}>
                        <div className={styles.productImgWrap}>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className={styles.productImg}
                            />
                          ) : (
                            <div className={styles.productImgPlaceholder} />
                          )}
                        </div>
                        <span className={styles.productName}>{product.name}</span>
                      </div>
                    </td>

                    {/* Catégorie */}
                    <td>
                      {product.color
                        ? <span className={styles.categoryBadge}>{product.color}</span>
                        : <span className={styles.emptyCell}>—</span>
                      }
                    </td>

                    {/* Prix */}
                    <td>
                      <span className={styles.priceCell}>
                        {product.price.toLocaleString("fr-FR")} €
                      </span>
                    </td>

                    {/* Stock */}
                    <td>
                      <div className={styles.stockSizes}>
                        <span className={styles.sizeBadge} title="Total stock">
                          <span className={styles.sizeLabel}>Qté</span>
                          <span className={styles.sizeQty}>{product.stock}</span>
                        </span>
                      </div>
                    </td>

                    {/* Statut */}
                    <td>
                      <span className={`${styles.statusBadge} ${status.cls}`}>
                        {status.label}
                      </span>
                    </td>

                    {/* Visible */}
                    <td>
                      <button
                        className={`${styles.toggleBtn} ${product.visible ? styles.toggleOn : styles.toggleOff}`}
                        onClick={() => toggleVisible(product._id, product.visible)}
                        disabled={isBusy}
                        aria-label={product.visible ? "Masquer" : "Afficher"}
                      >
                        <span className={styles.toggleThumb} />
                      </button>
                    </td>

                    {/* Date */}
                    <td>
                      <span className={styles.dateCell}>
                        {new Date(product.createdAt).toLocaleDateString("fr-FR", {
                          day:   "2-digit",
                          month: "short",
                          year:  "numeric",
                        })}
                      </span>
                    </td>

                    {/* Actions */}
                    <td>
                      <div className={styles.actions}>
                        <Link
                          href={`/admin/products/${product._id}`}
                          className={styles.btnView}
                          title="Voir"
                        >
                          ↗
                        </Link>
                        <Link
                          href={`/admin/products/${product._id}/edit`}
                          className={styles.btnEdit}
                        >
                          Modifier
                        </Link>
                        <button
                          className={styles.btnDelete}
                          onClick={() => deleteProduct(product._id, product.name)}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
