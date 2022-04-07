import { Schema, model } from 'mongoose';

const TreasurySchema = new Schema({
  timestamp: Date,
  value: Number,
}, { timestamps: true });

export default model('Treasury', TreasurySchema);
