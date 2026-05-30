"use client";

import { useState } from "react";
import styles from "./products.module.css";

export default function StockManager({ initialProducts }) {
  const [products, setProducts] = useState(initialProducts);
  const [loading, setLoading] = useState({});
  const [error, setError] = useState(null);

  const updateStock = async (id, delta) => {
    setLoading((l) => ({ ...l, [id]: true }));
    try {
      const res = await fetch(`/api/admin/products/${id}/stock`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      const data = await res.json();
      if (res.ok) {
        setProducts((prev) =>
          prev.map((p) => (p._id === id ? { ...p, stock: data.stock } : p))
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading((l) => ({ ...l, [id]: false }));
    }
  };

  return (
    <div className={styles.grid}>
      {products.map((product) => {
        const isEmpty = product.stock === 0;
        const isLow   = product.stock > 0 && product.stock <= 3;
        const busy    = loading[product._id];

        return (
          <div
            key={product._id}
            className={`${styles.card} ${isEmpty ? styles.cardEmpty : ""}`}
          >
            {isEmpty && (
              <div className={styles.ruptureBanner}>Rupture de stock</div>
            )}

            <img
              src={product.image}
              alt={product.color}
              className={styles.image}
            />

            <div className={styles.info}>
              <h2 className={styles.color}>{product.color}</h2>
              <p className={styles.price}>{product.price} €</p>

              {/* Badge statut */}
              <div
                className={`${styles.stockBadge} ${
                  isEmpty ? styles.empty : isLow ? styles.low : styles.ok
                }`}
              >
                {isEmpty
                  ? "❌ Rupture de stock"
                  : isLow
                  ? `⚠️ Stock faible : ${product.stock}`
                  : `✅ En stock : ${product.stock}`}
              </div>

              {/* Contrôles stock */}
              <div className={styles.stockControls}>
                <button
                  className={styles.stockBtn}
                  onClick={() => updateStock(product._id, -1)}
                  disabled={busy || product.stock === 0}
                  aria-label="Diminuer le stock"
                >
                  −
                </button>
                <span className={styles.stockQty}>{product.stock}</span>
                <button
                  className={`${styles.stockBtn} ${styles.stockBtnAdd}`}
                  onClick={() => updateStock(product._id, 1)}
                  disabled={busy}
                  aria-label="Augmenter le stock"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
