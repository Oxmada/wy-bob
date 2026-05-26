"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from '@/components/panier-context'
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../page.css";
import "./panier.css";

export default function Panier() {
  const { cartItems, removeFromCart, increaseQty, decreaseQty, cartTotal } = useCart();
  const router = useRouter();

  if (cartItems.length === 0) {
    return (
      <div className="container">
        <Navbar />
        <div className="cart-empty">
          <p>Votre panier est vide 🛒</p>
          <Link href="/">Retour à la boutique</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const tva = Math.round(cartTotal * 0.2);
  const totalTTC = cartTotal + tva;

  return (
    <div className="container">
      <Navbar />
      <div className="cart-page">

        {/* Bouton retour */}
        <button className="panierRetour" onClick={() => router.back()}>
          ← Retour
        </button>

        <div className="cart-wrapper">

          {/* GAUCHE */}
          <div className="cart-left">
            <h2 className="cart-title">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Mon panier
            </h2>

            <ul className="cart-list">
              {cartItems.map((item) => (
                <li key={item._id} className="cart-item">

                  <div className="cart-item-image">
                    {item.image ? (
                      <img src={item.image} alt={item.name} />
                    ) : null}
                  </div>

                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <p>Cette maille est vraiment trop cool</p>
                    {item.color && <p>Couleur : {item.color}</p>}
                    <div className="qty-controls">
                      <button onClick={() => decreaseQty(item._id)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => increaseQty(item._id)}>+</button>
                    </div>
                  </div>

                  <div className="cart-item-right">
                    <span className="cart-item-price">{item.price}€</span>
                    <button
                      className="cart-remove"
                      onClick={() => removeFromCart(item._id)}
                    >
                      🗑 Remove
                    </button>
                  </div>

                </li>
              ))}
            </ul>
          </div>

          {/* DROITE */}
          <div className="cart-right">

            <div className="cart-promo">
              <h3 className="cart-section-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Code promo
              </h3>
              <div className="promo-input-row">
                <input type="text" placeholder="Entre ton code promo" />
                <button>Appliquer</button>
              </div>
            </div>

            <div className="cart-summary">
              <h3 className="cart-section-title">Résumé de la commande</h3>
              <div className="summary-row">
                <span>Sous-total ({cartItems.length})</span>
                <span>{cartTotal}€</span>
              </div>
              <div className="summary-row">
                <span>TVA (20%)</span>
                <span>{tva}€</span>
              </div>
              <hr className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>{totalTTC}€</span>
              </div>
              <button
                className="checkout-btn"
                onClick={() => router.push("/commande")}
              >
                Procéder au paiement
              </button>
            </div>

          </div>

        </div>
      </div>
      <Footer />
    </div>
  );
}