interface Price {
  assetId: any;
  timestamp: Date;
  price: number;
  volume?: number;
  marketCap?: number;
}

export default Price;
