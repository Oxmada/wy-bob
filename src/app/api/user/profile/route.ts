import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ message: "Non autorisé" }, { status: 401 });

  const body = await req.json();
  const { name, phone, currentPassword, newPassword } = body;

  await connectDB();

  const user = await User.findOne({ email: session.user.email });
  if (!user) return NextResponse.json({ message: "Utilisateur introuvable" }, { status: 404 });

  // Mise à jour nom/téléphone
  if (name && name.trim()) user.name = name.trim();
  if (phone !== undefined && newPassword === undefined) user.phone = phone;

  // Changement mot de passe
  if (currentPassword && newPassword) {
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ message: "Mot de passe actuel incorrect" }, { status: 400 });
    }
    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  return NextResponse.json({ success: true });
}