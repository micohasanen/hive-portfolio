import { Schema, model } from 'mongoose';
import IHolding from '../interfaces/IHolding';

const RangeSchema = {
  low: Number,
  avg: Number,
  high: Number,
};

const HoldingSchema = new Schema<IHolding>({
  assetId: {
    type: String,
    required: true,
    index: true,
  },
  currentPrice: Number,
  currentValue: Number,
  initialValue: Number,
  quantity: Number,
  buyRange: RangeSchema,
  sellRange: RangeSchema,
  metrics: {
    type: Schema.Types.Mixed,
    index: true,
  },
  trades: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Trade',
    },
  ],
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

HoldingSchema.virtual('asset', {
  localField: 'assetId',
  foreignField: 'id',
  ref: 'Asset',
  justOne: true,
});

export default model<IHolding>('Holding', HoldingSchema);
