import { Schema, model } from 'mongoose';
import IPrice from '../interfaces/IPrice';

const PriceSchema = new Schema<IPrice>({
  assetId: {
    type: String,
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  volume: Number,
  marketCap: Number,
}, { timestamps: true });

export default model<IPrice>('Price', PriceSchema);
