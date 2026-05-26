"use client";

import { useCart } from "@/components/panier-context";
import StripeWrapper from "./StripeWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import "../page.css";
import "./checkout.css";

export default function CheckoutPage() {
  const { cartTotal } = useCart();

  const TVA_RATE = 0.20;
  const tva = Math.round(cartTotal * TVA_RATE);
  const livraison = 25;
  const total = cartTotal + tva + livraison;

  return (
    <div className="container">
      <Navbar />
      <div className="checkoutZone">
        <StripeWrapper total={total} />
      </div>
      <Footer />
    </div>
  );
}