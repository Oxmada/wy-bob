import dynamic from "next/dynamic";
import styles from "./dashboard.module.css";

const DashboardStats = dynamic(() => import("./components/DashboardStats"), {
  loading: () => <p style={{ padding: "2rem", color: "#9b9b9b" }}>Chargement du tableau de bord…</p>,
  ssr: false,
});

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <div className={styles.topbar}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Bonjour, voici un résumé de votre activité.</p>
        </div>
      </div>
      <DashboardStats />
    </div>
  );
}
