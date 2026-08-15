import mongoose from 'mongoose';

const historyEntrySchema = new mongoose.Schema({
  categoryId: { type: String, required: true },
  categoryName: { type: String, default: '' },
  amount: { type: mongoose.Schema.Types.Mixed, required: true },
  date: { type: String, required: true },
  paymentMode: { type: String, default: 'Online' },
  withdrawOption: { type: String, default: '' },
  note: { type: String, default: '' },
  isCashWithdraw: { type: Boolean, default: false }
}, { _id: false });

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  totalAmount: { type: Number, default: 0 },
  onlineTotal: { type: Number, default: 0 },
  cashTotal: { type: Number, default: 0 },
  withdrawTotal: { type: Number, default: 0 },
  itemCount: { type: Number, default: 0 },
  entries: [historyEntrySchema],
  savedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure unique date per user
historySchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model('History', historySchema);
