import DashboardStats from "./components/DashboardStats";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Dashboard Admin</h1>
      </div>

      <div className={styles.grid}>
        <a href="/admin/products" className={styles.card}>Produits & Stock</a>
        <a href="/admin/customers" className={styles.card}>Utilisateurs</a>
        <a href="/admin/orders" className={styles.card}>Commandes</a>
      </div>

      <DashboardStats />
    </div>
  );
}