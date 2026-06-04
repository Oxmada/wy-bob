export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import Order from "@/app/models/Order";
import Counter from "@/app/models/Counter";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Accès refusé" }, { status: 401 });
    }

    await connectDB();

    const orders = await Order.find({ orderNumber: { $exists: false } }).sort({ createdAt: 1 });

    if (orders.length === 0) {
      return NextResponse.json({ message: "Aucune commande à migrer.", migrated: 0 });
    }

    const counter = await Counter.findOne({ _id: "orderNumber" });
    let seq = counter?.seq ?? 0;

    for (const order of orders) {
      seq += 1;
      order.orderNumber = seq;
      await order.save();
    }

    await Counter.findOneAndUpdate(
      { _id: "orderNumber" },
      { seq },
      { upsert: true }
    );

    return NextResponse.json({ message: `Migration terminée.`, migrated: orders.length, lastNumber: seq });
  } catch (error) {
    console.error("MIGRATE ERROR:", error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
