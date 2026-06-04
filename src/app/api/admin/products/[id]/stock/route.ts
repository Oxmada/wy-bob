import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { delta } = await req.json();
    if (typeof delta !== "number") {
      return NextResponse.json({ error: "delta manquant" }, { status: 400 });
    }

    const { id } = await params;

    await connectDB();
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
    }

    product.stock = Math.max(0, product.stock + delta);
    await product.save();

    return NextResponse.json({ stock: product.stock });
  } catch (err) {
    console.error("[stock PATCH]", err);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
