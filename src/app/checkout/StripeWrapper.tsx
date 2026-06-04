"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

export default function StripeWrapper({ total }: { total: number }) {
  if (!stripeKey) {
    return (
      <div style={{ textAlign: "center", padding: "40px 20px", color: "#888" }}>
        <p>Le paiement en ligne sera disponible prochainement.</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ mode: "payment", amount: Math.round(total * 100), currency: "eur" }}>
      <CheckoutForm total={total} />
    </Elements>
  );
}