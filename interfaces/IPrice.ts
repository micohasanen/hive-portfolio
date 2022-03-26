interface Price {
  assetId: string;
  timestamp: Date;
  price: number;
  volume?: number;
  marketCap?: number;
}

export default Price;
