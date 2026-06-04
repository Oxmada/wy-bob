import { NextResponse } from "next/server";
import { connectDB } from "@/app/lib/db";
import Customer from "@/app/models/Customer";
import Order from "@/app/models/Order";
import User from "@/app/models/User";

/* =========================
   GET - Liste des clients
========================= */
export async function GET(req) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const vip    = searchParams.get("vip") || "";
    const sort   = searchParams.get("sort") || "createdAt";
    const order  = searchParams.get("order") || "desc";
    const page   = parseInt(searchParams.get("page")) || 1;
    const limit  = parseInt(searchParams.get("limit")) || 20;

    // Charge tous les Users et tous les Customers
    const [allUsers, allCustomers] = await Promise.all([
      User.find({}, { name: 1, email: 1, phone: 1, address: 1, createdAt: 1, role: 1 }),
      Customer.find({}),
    ]);

    // Index des Customers par email pour le merge
    const customerByEmail = {};
    for (const c of allCustomers) {
      customerByEmail[c.email.toLowerCase()] = c;
    }

    // Merge : un enregistrement par email
    const merged = allUsers.map((user) => {
      const email = user.email.toLowerCase();
      const customer = customerByEmail[email];

      const nameParts = (user.name || "").trim().split(" ");
      const firstname = nameParts[0] || "";
      const lastname  = nameParts.slice(1).join(" ") || "";

      return {
        _id:          customer?._id  ?? user._id,
        firstname:    customer?.firstname || firstname,
        lastname:     customer?.lastname  || lastname,
        email,
        phone:        customer?.phone || user.phone || "",
        city:         customer?.city  || user.address?.city || "",
        address:      customer?.address || user.address?.street || "",
        totalOrders:  customer?.totalOrders ?? 0,
        totalSpent:   customer?.totalSpent  ?? 0,
        lastOrderAt:  customer?.lastOrderAt ?? null,
        status:       customer?.status ?? "active",
        role:         user.role ?? "customer",
        createdAt:    customer?.createdAt ?? user.createdAt,
        updatedAt:    customer?.updatedAt ?? user.createdAt,
      };
    });

    // Filtre recherche
    let filtered = merged;
    if (search) {
      const re = new RegExp(search, "i");
      filtered = filtered.filter(c =>
        re.test(c.firstname) || re.test(c.lastname) ||
        re.test(c.email)     || re.test(c.phone)
      );
    }
    if (status) {
      filtered = filtered.filter(c => c.status === status);
    }
    if (vip === "true") {
      filtered = filtered.filter(c => (c.totalSpent || 0) >= 50000);
    }

    // Tri
    const dir = order === "desc" ? -1 : 1;
    filtered.sort((a, b) => {
      const av = a[sort] ?? 0;
      const bv = b[sort] ?? 0;
      if (av < bv) return -dir;
      if (av > bv) return dir;
      return 0;
    });

    // Pagination
    const total      = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const customers  = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      success: true,
      customers,
      pagination: { total, page, limit, totalPages },
    });
  } catch (error) {
    console.error("GET CUSTOMERS ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   POST - Create / Sync
========================= */
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    if (body.action === "sync") {
      return await syncCustomersFromOrders();
    }

    const { firstname, lastname, email, phone, city, address } = body;

    const exists = await Customer.findOne({ email: email.toLowerCase() });
    if (exists) {
      return NextResponse.json(
        { success: false, message: "Ce client existe déjà" },
        { status: 400 }
      );
    }

    const customer = await Customer.create({
      firstname,
      lastname,
      email: email.toLowerCase(),
      phone,
      city,
      address,
    });

    return NextResponse.json(
      { success: true, customer },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

/* =========================
   SYNC CLIENTS (PRO & SAFE)
========================= */
async function syncCustomersFromOrders() {
  try {
    await connectDB();

    const customersMap = {};

    // 1. Agrège les commandes par email
    const orders = await Order.find({
      "customer.email": { $exists: true },
    }).sort({ createdAt: -1 });

    for (const order of orders) {
      const email = order.customer.email.toLowerCase();

      if (!customersMap[email]) {
        customersMap[email] = {
          firstname: order.customer.firstname || "",
          lastname: order.customer.lastname || "",
          email,
          phone: order.customer.phone || "",
          city: order.customer.city || "",
          address: order.customer.address || "",
          totalOrders: 0,
          totalSpent: 0,
          lastOrderAt: order.createdAt,
        };
      }

      customersMap[email].totalOrders += 1;
      customersMap[email].totalSpent += order.total || 0;
    }

    // 2. Importe les utilisateurs inscrits sans commande
    const registeredUsers = await User.find(
      { role: { $ne: "admin" } },
      { name: 1, email: 1, phone: 1, address: 1, createdAt: 1 }
    );

    for (const user of registeredUsers) {
      const email = user.email.toLowerCase();
      if (customersMap[email]) continue; // déjà dans les commandes

      const nameParts = (user.name || "").trim().split(" ");
      const firstname = nameParts[0] || "";
      const lastname = nameParts.slice(1).join(" ") || "";

      customersMap[email] = {
        firstname,
        lastname,
        email,
        phone: user.phone || "",
        city: user.address?.city || "",
        address: user.address?.street || "",
        totalOrders: 0,
        totalSpent: 0,
        lastOrderAt: null,
      };
    }

    let created = 0;
    let updated = 0;

    for (const email in customersMap) {
      const data = customersMap[email];

      const before = await Customer.findOne({ email });
      await Customer.findOneAndUpdate(
        { email },
        { $set: data },
        { upsert: true, new: true }
      );

      if (!before) {
        created++;
      } else {
        updated++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Synchronisation terminée — ${created} créés, ${updated} mis à jour`,
      created,
      updated,
      total: created + updated,
    });
  } catch (error) {
    console.error("SYNC CUSTOMER ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}