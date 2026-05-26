"use client";

import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import CheckoutForm from "./CheckoutForm";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function StripeWrapper({ total }: { total: number }) {
  return (
    <Elements stripe={stripePromise} options={{ mode: "payment", amount: Math.round(total * 100), currency: "eur" }}>
      <CheckoutForm total={total} />
    </Elements>
  );
}