import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  color:       { type: String, default: "" },
  colorCode:   { type: String, default: "" },
  image:       { type: String, default: "" },
  price:       { type: Number, required: true, default: 85 },
  pricePromo:  { type: Number, default: null },
  stock:       { type: Number, required: true, default: 0 },
  description: { type: String, default: "" },
  visible:     { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
