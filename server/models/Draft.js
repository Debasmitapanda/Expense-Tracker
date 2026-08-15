import mongoose from 'mongoose';

const draftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  compositeKey: { type: String, required: true },
  date: { type: String, required: true },
  categoryId: { type: String, required: true },
  categoryName: { type: String, default: '' },
  amount: { type: mongoose.Schema.Types.Mixed, default: '' },
  paymentMode: { type: String, default: 'Online' },
  withdrawOption: { type: String, default: '' },
  note: { type: String, default: '' }
}, { timestamps: true });

// Ensure unique compositeKey per user
draftSchema.index({ userId: 1, compositeKey: 1 }, { unique: true });

export default mongoose.model('Draft', draftSchema);
