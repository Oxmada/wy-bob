import styles from "./dashboard.module.css";
import DashboardStatsClient from "./components/DashboardStatsClient";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bonjour, voici un résumé de votre activité.</p>
        </div>
      </div>
      <DashboardStatsClient />
    </div>
  );
}
