import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function GET() {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  await connectDB();
  const product = await Product.findOne({}).lean() as any;
  if (!product) return NextResponse.json({ success: true, product: null });

  return NextResponse.json({
    success: true,
    product: {
      _id:        product._id.toString(),
      name:       product.name,
      price:      product.price,
      pricePromo: product.pricePromo ?? null,
      stock:      product.stock,
      visible:    product.visible,
      variants:   (product.variants ?? []).map((v: any) => ({
        _id:       v._id?.toString(),
        colorName: v.colorName,
        colorCode: v.colorCode,
        textColor: v.textColor,
        image:     v.image,
      })),
    },
  });
}
