import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";

const TIMELINE_STEPS = [
  { key: "pending",    label: "En attente"   },
  { key: "confirmed",  label: "Confirmée"    },
  { key: "processing", label: "Préparation"  },
  { key: "paid",       label: "Payée"        },
  { key: "shipped",    label: "Expédiée"     },
  { key: "delivered",  label: "Livrée"       },
];

const STEP_ORDER = TIMELINE_STEPS.map(s => s.key);

const STATUS_LABELS: Record<string, string> = {
  pending:    "En attente",
  confirmed:  "Confirmée",
  processing: "En préparation",
  paid:       "Payée",
  shipped:    "Expédiée",
  delivered:  "Livrée",
  cancelled:  "Annulée",
};

const STATUS_BADGE: Record<string, string> = {
  pending:    "db-badge db-badge-pending",
  confirmed:  "db-badge db-badge-confirmed",
  processing: "db-badge db-badge-processing",
  paid:       "db-badge db-badge-paid",
  shipped:    "db-badge db-badge-shipped",
  delivered:  "db-badge db-badge-delivered",
  cancelled:  "db-badge db-badge-cancelled",
};

const PAYMENT_LABELS: Record<string, string> = {
  cash:           "Espèces à la livraison",
  mobile_money:   "Mobile Money",
  card:           "Carte bancaire",
  bank_transfer:  "Virement bancaire",
};

const DELIVERY_LABELS: Record<string, string> = {
  standard: "Livraison standard",
  express:  "Livraison express",
  pickup:   "Retrait en magasin",
  colissimo:"Colissimo",
  relais:   "Point relais Colissimo",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/auth/login");

  await connectDB();

  const orders = await Order.find({
    $or: [
      { userId: session.user.id },
      { "customer.email": session.user.email.toLowerCase() },
    ],
  })
    .sort({ createdAt: -1 })
    .lean() as any[];

  return (
    <div>
      <h1 className="db-page-title">Mes commandes</h1>
      <div className="db-wrapper">

        {orders.length === 0 ? (
          <div className="db-card" style={{ textAlign: "center", padding: "40px 24px" }}>
            <p style={{ fontSize: 14, color: "#888", margin: "0 0 16px 0" }}>
              Aucune commande pour le moment.
            </p>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map((order) => {
              const cancelled = order.status === "cancelled";
              const currentIdx = STEP_ORDER.indexOf(order.status);
              const articleCount = order.products?.reduce(
                (s: number, p: any) => s + (Number(p.quantity) || 1), 0
              ) ?? 0;

              return (
                <div key={order._id.toString()} className="order-card">

                  {/* ── En-tête commande ── */}
                  <div className="order-card-header">
                    <div>
                      <span className="order-card-id">
                        #{order._id.toString().slice(-8).toUpperCase()}
                      </span>
                      <span className="order-card-date">
                        {new Date(order.createdAt).toLocaleDateString("fr-FR", {
                          day: "2-digit", month: "long", year: "numeric",
                        })}
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#1B1843" }}>
                        {Number(order.total).toLocaleString("fr-FR")} €
                      </span>
                      <span className={STATUS_BADGE[order.status] ?? "db-badge db-badge-pending"}>
                        {STATUS_LABELS[order.status] ?? order.status}
                      </span>
                    </div>
                  </div>

                  {/* ── Corps ── */}
                  <div className="order-card-body">

                    {cancelled ? (
                      <div className="order-cancelled-banner">
                        Cette commande a été annulée.
                      </div>
                    ) : (
                      <div className="order-timeline">
                        {TIMELINE_STEPS.map((step, i) => {
                          const done   = currentIdx >= i;
                          const active = currentIdx === i;
                          return (
                            <div key={step.key} className="timeline-step">
                              <div
                                className={`timeline-dot ${done ? "" : "timeline-dot-inactive"}`}
                                style={done ? { background: active ? "#F9C464" : "#1B1843" } : {}}
                              >
                                {done ? "✓" : ""}
                              </div>
                              {i < TIMELINE_STEPS.length - 1 && (
                                <div
                                  className="timeline-line"
                                  style={{ background: currentIdx > i ? "#1B1843" : "#e5e7eb" }}
                                />
                              )}
                              <span
                                className="timeline-label"
                                style={{
                                  color: done ? "#1B1843" : "#aaa",
                                  fontWeight: active ? 600 : 400,
                                }}
                              >
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* ── Détails ── */}
                    <div style={{ display: "flex", gap: 24, flexWrap: "wrap", fontSize: 13, color: "#555", marginTop: 14 }}>
                      <span>
                        <strong>Livraison :</strong>{" "}
                        {DELIVERY_LABELS[order.delivery] ?? order.delivery ?? "—"}
                      </span>
                      <span>
                        <strong>Paiement :</strong>{" "}
                        {PAYMENT_LABELS[order.payment] ?? order.payment ?? "—"}
                      </span>
                      <span>
                        <strong>Articles :</strong> {articleCount}
                      </span>
                    </div>

                    {order.customer?.address && (
                      <div style={{ marginTop: 8, fontSize: 13, color: "#888" }}>
                        <strong>Adresse :</strong>{" "}
                        {order.customer.address}, {order.customer.city}
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
