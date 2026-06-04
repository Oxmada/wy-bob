import mongoose from 'mongoose'

const CustomerSchema = new mongoose.Schema({
  firstname: { type: String, required: true },
  lastname: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, default: '' },
  city: { type: String, default: '' },
  address: { type: String, default: '' },
  totalOrders: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  lastOrderAt: { type: Date },
  status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active' },
}, {
  timestamps: true,
})

export default mongoose.models.Customer || mongoose.model('Customer', CustomerSchema)