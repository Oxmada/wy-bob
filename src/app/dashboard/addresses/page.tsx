import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/app/lib/db";
import User from "@/app/models/User";
import AddressesClient from "../components/AddressesClient";

export default async function AddressesPage() {
  const session = await auth();
  if (!session) redirect("/auth/login");

  await connectDB();
  const user = await User.findOne({ email: session.user.email }).lean() as any;

  const addresses = (user?.addresses ?? []).map((a: any) => ({
    label:    a.label    ?? "",
    fullName: a.fullName ?? "",
    street:   a.street   ?? "",
    zip:      a.zip      ?? "",
    city:     a.city     ?? "",
    country:  a.country  ?? "",
  }));

  return <AddressesClient initialAddresses={addresses} />;
}
