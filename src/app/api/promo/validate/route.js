export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import PromoCode from "@/app/models/PromoCode";

export async function POST(request) {
  try {
    await connectDB();

    const { code, cartTotal } = await request.json();

    if (!code) {
      return NextResponse.json({ message: "Code manquant" }, { status: 400 });
    }

    const promo = await PromoCode.findOne({ code: code.toUpperCase().trim() });

    if (!promo) {
      return NextResponse.json({ message: "Code promo invalide" }, { status: 404 });
    }
    if (!promo.active) {
      return NextResponse.json({ message: "Ce code promo est désactivé" }, { status: 400 });
    }
    if (promo.expiresAt && new Date(promo.expiresAt) < new Date()) {
      return NextResponse.json({ message: "Ce code promo a expiré" }, { status: 400 });
    }
    if (promo.maxUses !== null && promo.usedCount >= promo.maxUses) {
      return NextResponse.json({ message: "Ce code promo a atteint sa limite d'utilisation" }, { status: 400 });
    }
    if (cartTotal !== undefined && cartTotal < promo.minOrderAmount) {
      return NextResponse.json(
        { message: `Commande minimum requise : ${promo.minOrderAmount} €` },
        { status: 400 }
      );
    }

    const discount =
      promo.type === "percent"
        ? Math.round(cartTotal * (promo.value / 100) * 100) / 100
        : Math.min(promo.value, cartTotal);

    return NextResponse.json({
      success: true,
      promo: {
        _id: promo._id,
        code: promo.code,
        type: promo.type,
        value: promo.value,
      },
      discount,
    });
  } catch (error) {
    console.error("PROMO VALIDATE ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
