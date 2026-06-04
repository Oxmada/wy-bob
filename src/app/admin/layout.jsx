import { auth } from "@/auth";
import { redirect } from "next/navigation";
import DashboardHeader from "@/app/dashboard/components/DashboardHeader";
import DashboardFooter from "@/app/dashboard/components/DashboardFooter";
import "@/app/dashboard/dashboard.css";
import "./admin.css";

export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session) redirect("/auth/login");
  if (session.user.role !== "admin") redirect("/admin/unauthorized");

  return (
    <div className="admin-root">
      <DashboardHeader showLogout />
      <main className="admin-main">
        {children}
      </main>
      <DashboardFooter />
    </div>
  );
}
