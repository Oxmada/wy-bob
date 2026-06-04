import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json();

  await connectDB();
  const product = await Product.findById(id);
  if (!product) {
    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
  }

  if (typeof body.visible === "boolean") product.visible = body.visible;

  await product.save();
  return NextResponse.json({ success: true, visible: product.visible });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  await Product.findByIdAndDelete(id);
  return NextResponse.json({ success: true });
}
