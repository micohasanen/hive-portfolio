import { Schema, model } from 'mongoose';
import ITrade from '../interfaces/ITrade';

// Controllers
import HoldingController from '../controllers/HoldingController';

const AssetSchema = new Schema<ITrade>({
  side: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  timestamp: Date,
  assetId: {
    type: String,
    required: true,
  },
}, { timestamps: true });

/* eslint func-names: ["error", "never"] */
AssetSchema.post('save', function () {
  HoldingController.logTrade(this);
});

export default model<ITrade>('Trade', AssetSchema);
