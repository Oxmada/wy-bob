import mongoose from "mongoose";

const ReferralConfigSchema = new mongoose.Schema(
  {
    totalPercent: { type: Number, required: true, min: 1, max: 100, default: 10 },
    rewardValidityDays: { type: Number, default: 30 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.models.ReferralConfig ||
  mongoose.model("ReferralConfig", ReferralConfigSchema);
