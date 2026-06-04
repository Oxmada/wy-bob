export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import PromoCode from "@/app/models/PromoCode";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { active } = body;

    const promo = await PromoCode.findByIdAndUpdate(
      params.id,
      { active },
      { new: true }
    );

    if (!promo) {
      return NextResponse.json({ message: "Code promo introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true, promo });
  } catch (error) {
    console.error("ADMIN PROMOS PATCH ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const promo = await PromoCode.findByIdAndDelete(params.id);

    if (!promo) {
      return NextResponse.json({ message: "Code promo introuvable" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("ADMIN PROMOS DELETE ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
