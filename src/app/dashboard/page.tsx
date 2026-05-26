import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import User from "@/models/User";
import AddressesClient from "./components/AddressesClient";
import Link from "next/link";
import Image from "next/image";
import "./dashboard.css";

export default async function DashboardOverview() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await connectDB();

 const allOrders = await Order.find({ "customer.email": session.user.email })
  .sort({ createdAt: -1 })
  .lean();

  const user = await User.findOne({ email: session.user.email }).lean();

  const addresses = (user?.addresses || []).map((a) => ({
    label: a.label || "",
    fullName: a.fullName || "",
    street: a.street || "",
    zip: a.zip || "",
    city: a.city || "",
    country: a.country || "",
  }));

  const statusLabels = {
    pending:    "En attente",
    confirmed:  "Confirmée",
    processing: "En préparation",
    paid:       "Payée",
    shipped:    "Expédiée",
    delivered:  "Livré",
    cancelled:  "Annulé",
  };

  return (
    <div className="db-wrapper">

      {/* ── Titre ── */}
      <h2 className="db-page-title">Dashboard</h2>

      {/* ════════════════════════════════
          CARTE PROFIL — 682 × 62px
      ════════════════════════════════ */}
      <div className="db-card db-card--profile">
        <div className="db-profile-row">

          {/* Nom */}
          <div className="db-profile-field">
            <span className="db-profile-field-value">{session.user.name}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier" />
          </div>

          {/* Email */}
          <div className="db-profile-field">
            <span className="db-profile-field-label">Mail :</span>
            <span className="db-profile-field-value">{session.user.email}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier" />
          </div>

          {/* Téléphone */}
          <div className="db-profile-field">
            <span className="db-profile-field-label">Tel :</span>
            <span className="db-profile-field-value">{user?.phone || "—"}</span>
            <Link href="/dashboard/profile" className="db-edit-icon" title="Modifier" />
          </div>

          {/* Avatar */}
          {session.user.image ? (
            <Image
              src={session.user.image}
              alt={session.user.name}
              width={44}
              height={44}
              className="db-profile-avatar"
            />
          ) : (
            <div className="db-profile-avatar-placeholder">
              {session.user.name?.[0]?.toUpperCase() || "?"}
            </div>
          )}

        </div>
      </div>

      {/* ════════════════════════════════
          CARTE HISTORIQUE — 682 × auto
      ════════════════════════════════ */}
      <div className="db-card db-card--orders">
        <h2 className="db-section-title">Historique de commande</h2>

        {allOrders.length === 0 ? (
          <p style={{ fontSize: 13, color: "#888", margin: 0 }}>
            Aucune commande pour le moment.{" "}
            <Link href="/boutique" style={{ color: "#c0616a" }}>
              Commencer mes achats
            </Link>
          </p>
        ) : (
          <table className="db-table">
            <thead>
              <tr>
                <th>Numéro</th>
                <th>Date</th>
                <th>Montant</th>
                <th>Quantité</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.map((order) => (
                <tr key={order._id}>
                  <td className="db-order-num">
                    #{order._id.toString().slice(-4).toUpperCase()}
                  </td>
                  <td>
                    {new Date(order.createdAt).toLocaleDateString("fr-FR")}
                  </td>
                  <td>{Number(order.total).toLocaleString()}€</td>
                  <td>
                    {order.items?.reduce((s, i) => s + (i.quantity || 1), 0) || 1}
                  </td>
                  <td className="db-status">
                    {statusLabels[order.status] || order.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ════════════════════════════════
          CARTE ADRESSES — 682 × 187px
      ════════════════════════════════ */}
      <div className="db-card db-card--addresses">
        <h2 className="db-section-title">Mes adresses</h2>
        <AddressesClient initialAddresses={addresses} />
      </div>

    </div>
  );
}