import { Schema, model, Types } from 'mongoose';
import ITrade from '../interfaces/ITrade';

// Controllers
import HoldingController from '../controllers/HoldingController';

const TradeSchema = new Schema<ITrade>({
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
    type: Types.ObjectId,
    ref: 'Asset',
    required: true,
  },
}, { timestamps: true });

/* eslint func-names: ["error", "never"] */
TradeSchema.post('save', function () {
  HoldingController.logTrade(this);
});

export default model<ITrade>('Trade', TradeSchema);
