import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Sidebar from "./components/Sidebar";
import DashboardHeader from "./components/DashboardHeader";
import DashboardFooter from "./components/DashboardFooter";
import "./dashboard.css";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role === "admin") redirect("/admin");

  return (
    <div className="db-root">
      <DashboardHeader />
      <div className="db-layout">
        <Sidebar user={session.user} />
        <main className="db-main">
          {children}
        </main>
      </div>
      <DashboardFooter />
    </div>
  );
}
