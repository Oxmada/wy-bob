import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import Product from "@/app/models/Product";

export async function GET(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const sort   = searchParams.get("sort")   || "createdAt";
  const order  = searchParams.get("order")  || "desc";

  await connectDB();

  const query: Record<string, unknown> = {};
  if (search) {
    query.$or = [
      { name:  { $regex: search, $options: "i" } },
      { color: { $regex: search, $options: "i" } },
    ];
  }
  if (status === "out") {
    query.stock = 0;
  } else if (status === "low") {
    query.stock = { $gt: 0, $lte: 3 };
  }

  const sortObj: Record<string, 1 | -1> = { [sort]: order === "asc" ? 1 : -1 };
  const products = await Product.find(query).sort(sortObj).lean();

  const allProducts = await Product.find({}).lean();
  const total     = allProducts.length;
  const lowStock  = allProducts.filter((p: any) => p.stock > 0 && p.stock <= 3).length;
  const outOfStock = allProducts.filter((p: any) => p.stock === 0).length;

  const serialized = products.map((p: any) => ({
    _id:       p._id.toString(),
    name:      p.name      ?? "",
    color:     p.color     ?? "",
    colorCode: p.colorCode ?? "",
    image:     p.image     ?? "",
    price:     p.price     ?? 0,
    stock:     p.stock     ?? 0,
    visible:   p.visible   ?? true,
    createdAt: p.createdAt,
  }));

  return NextResponse.json({
    success: true,
    products: serialized,
    stats: { total, lowStock, outOfStock },
  });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || (session.user as any).role !== "admin") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const body = await req.json();
  const { name, color, colorCode, image, price, pricePromo, stock, description } = body;

  if (!name?.trim()) return NextResponse.json({ error: "Nom requis" }, { status: 400 });
  if (!price || Number(price) <= 0) return NextResponse.json({ error: "Prix invalide" }, { status: 400 });

  await connectDB();

  const product = await Product.create({
    name:        name.trim(),
    color:       color       || "",
    colorCode:   colorCode   || "",
    image:       image       || "",
    price:       Number(price),
    pricePromo:  pricePromo ? Number(pricePromo) : null,
    stock:       Math.max(0, Number(stock) || 0),
    description: description || "",
    visible:     true,
  });

  return NextResponse.json({
    success: true,
    product: {
      _id:       product._id.toString(),
      name:      product.name,
      color:     product.color,
      colorCode: product.colorCode,
      image:     product.image,
      price:     product.price,
      pricePromo: product.pricePromo,
      stock:     product.stock,
      description: product.description,
      visible:   product.visible,
      createdAt: product.createdAt,
    },
  }, { status: 201 });
}
