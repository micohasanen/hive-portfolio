interface Asset {
  name: string;
  symbol: string;
  type?: string;
  description?: string;
  category?: string;
  id: string;
  yield?: number;
  autoCompound?: boolean;
  currentPrice?: number;
  marketCap?: number;
  change24h?: number;
  createdAt?: Date;
  updatedAt: Date;
}

export default Asset;
