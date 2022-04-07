import { Types } from 'mongoose';

interface Trade {
  _id: Types.ObjectId;
  side: string;
  price: number;
  quantity: number;
  timestamp: Date;
  assetId: any;
  createdAt?: Date;
  updatedAt: Date;
}

export default Trade;
