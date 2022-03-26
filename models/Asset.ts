import { Schema, model } from 'mongoose';
import IAsset from '../interfaces/IAsset';

const AssetSchema = new Schema<IAsset>({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  type: String,
  description: String,
  category: String,
  id: {
    type: String,
    required: true,
    index: true,
  },
  currentPrice: Number,
  marketCap: Number,
  change24h: Number,
  yield: Number,
  autoCompound: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

export default model<IAsset>('Asset', AssetSchema);
