import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: { type: Number, unique: true, sparse: true },
    userId: { type: String, default: null },
    customer: {
      firstname: String,
      lastname: String,
      email: String,
      phone: String,
      city: String,
      address: String,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        quantity: Number,
      },
    ],
    total: Number,
    promoCode: { type: String, default: null },
    promoDiscount: { type: Number, default: 0 },
    payment: {
      type: String,
      enum: ["cash", "mobile_money", "card", "bank_transfer"],
      default: "cash",
    },
    delivery: {
  type: String,
  enum: ['standard', 'express', 'pickup', 'colissimo', 'relais'],
  default: 'colissimo',
},
    status: {
      type: String,
      enum: ["pending", "confirmed", "processing", "paid", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);