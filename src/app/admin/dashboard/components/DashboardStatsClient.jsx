"use client";

import dynamic from "next/dynamic";

const DashboardStats = dynamic(() => import("./DashboardStats"), {
  loading: () => <p style={{ padding: "2rem", color: "#9b9b9b" }}>Chargement du tableau de bord…</p>,
  ssr: false,
});

export default function DashboardStatsClient() {
  return <DashboardStats />;
}
