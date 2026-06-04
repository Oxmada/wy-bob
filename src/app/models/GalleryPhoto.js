import mongoose from "mongoose";

const GalleryPhotoSchema = new mongoose.Schema({
  url:      { type: String, required: true },
  publicId: { type: String, default: null },
  order:    { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.models.GalleryPhoto || mongoose.model("GalleryPhoto", GalleryPhotoSchema);
