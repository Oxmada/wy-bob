export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import ReferralConfig from "@/app/models/ReferralConfig";
import PromoCode from "@/app/models/PromoCode";

async function getConfig() {
  let config = await ReferralConfig.findOne();
  if (!config) {
    config = await ReferralConfig.create({ totalPercent: 10, rewardValidityDays: 30, active: false });
  }
  return config;
}

export async function GET(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();
    const config = await getConfig();

    const totalReferralCodes = await PromoCode.countDocuments({ isReferral: true, referrerId: { $ne: null } });
    const conversions = await PromoCode.aggregate([
      { $match: { isReferral: true } },
      { $group: { _id: null, total: { $sum: "$usedCount" } } },
    ]);
    const totalConversions = conversions[0]?.total ?? 0;

    return NextResponse.json({ success: true, config, stats: { totalReferralCodes, totalConversions } });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();
    const body = await req.json();
    const { totalPercent, rewardValidityDays, active } = body;

    const update = {};
    if (totalPercent !== undefined) {
      if (totalPercent < 1 || totalPercent > 100) {
        return NextResponse.json({ message: "Le pourcentage doit être entre 1 et 100" }, { status: 400 });
      }
      update.totalPercent = totalPercent;
    }
    if (rewardValidityDays !== undefined) update.rewardValidityDays = rewardValidityDays;
    if (active !== undefined) update.active = active;

    const config = await ReferralConfig.findOneAndUpdate({}, { $set: update }, { new: true, upsert: true });
    return NextResponse.json({ success: true, config });
  } catch (error) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
