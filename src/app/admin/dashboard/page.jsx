import DashboardStats from "./components/DashboardStats";
import styles from "./dashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <h1 className={styles.title}>Dashboard Admin</h1>
      </div>
      <DashboardStats />
    </div>
  );
}