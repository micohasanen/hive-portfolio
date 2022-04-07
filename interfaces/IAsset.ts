interface Asset {
  name: string;
  symbol: string;
  type?: string;
  description?: string;
  category?: string;
  id: string;
  yield?: number;
  isApy?: boolean;
  currentPrice?: number;
  marketCap?: number;
  change24h?: number;
  createdAt?: Date;
  updatedAt: Date;
}

export default Asset;
