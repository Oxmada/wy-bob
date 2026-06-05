export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import PromoCode from "@/app/models/PromoCode";
import ReferralConfig from "@/app/models/ReferralConfig";

function generateReferralCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += chars[Math.floor(Math.random() * chars.length)];
  }
  return `REF-${suffix}`;
}

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Connexion requise" }, { status: 401 });
    }

    await connectDB();

    const config = await ReferralConfig.findOne();
    if (!config?.active) {
      return NextResponse.json({ message: "Le programme de parrainage n'est pas actif" }, { status: 403 });
    }

    let referralCode = await PromoCode.findOne({ isReferral: true, referrerId: session.user.id });

    if (!referralCode) {
      let code;
      let attempts = 0;
      do {
        code = generateReferralCode();
        attempts++;
      } while (attempts < 10 && (await PromoCode.exists({ code })));

      referralCode = await PromoCode.create({
        code,
        type: "percent",
        value: config.totalPercent,
        isReferral: true,
        referrerId: session.user.id,
        filleulPercent: 0,
        parrainPercent: config.totalPercent,
        active: true,
        maxUses: null,
      });
    }

    return NextResponse.json({
      success: true,
      referralCode: {
        code: referralCode.code,
        filleulPercent: referralCode.filleulPercent,
        parrainPercent: referralCode.parrainPercent,
        usedCount: referralCode.usedCount,
        totalPercent: config.totalPercent,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Connexion requise" }, { status: 401 });
    }

    await connectDB();

    const config = await ReferralConfig.findOne();
    if (!config?.active) {
      return NextResponse.json({ message: "Le programme de parrainage n'est pas actif" }, { status: 403 });
    }

    const { filleulPercent } = await req.json();

    if (filleulPercent === undefined || filleulPercent < 0 || filleulPercent > config.totalPercent) {
      return NextResponse.json(
        { message: `La part filleul doit être entre 0 et ${config.totalPercent}` },
        { status: 400 }
      );
    }

    const parrainPercent = config.totalPercent - filleulPercent;

    const referralCode = await PromoCode.findOneAndUpdate(
      { isReferral: true, referrerId: session.user.id },
      {
        $set: {
          filleulPercent,
          parrainPercent,
          value: filleulPercent,
        },
      },
      { new: true }
    );

    if (!referralCode) {
      return NextResponse.json({ message: "Code de parrainage introuvable" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      referralCode: {
        code: referralCode.code,
        filleulPercent: referralCode.filleulPercent,
        parrainPercent: referralCode.parrainPercent,
        usedCount: referralCode.usedCount,
        totalPercent: config.totalPercent,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
