import { Types } from 'mongoose';

interface Range {
  low: number;
  average: number,
  high: number
}

interface Metrics {
  totalBought?: number;
  totalSold?: number;
  initialValue?: number;
  totalTrades?: number;
  yieldTotal?: number;
  growthPercentage?: number;
  growthValue?: number;
}

interface Holding {
  assetId: any;
  currentPrice?: number;
  quantity: number;
  buyRange?: Range;
  sellRange?: Range;
  currentValue?: number;
  initialValue?: number;
  trades?: Array<Types.ObjectId>;
  metrics?: Metrics;
}

export default Holding;
