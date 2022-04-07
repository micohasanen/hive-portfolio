import { Types } from 'mongoose';

import Holding from '../models/Holding';
import ITrade from '../interfaces/ITrade';
import IAsset from '../interfaces/IAsset';

function calcRanges(array:Array<number>): any {
  if (!array.length) return { avg: 0, low: 0, high: 0 };

  const sum = array.reduce((prev, curr) => prev + curr, 0);
  const avg = sum / array.length || 0;

  const low = Math.min(...array);
  const high = Math.max(...array);

  return { avg, low, high };
}

function calculateYieldTotal(trades:Array<any>, apy:number): any {
  let totalYield = 0;
  trades.forEach((trade) => {
    if (!trade.daysHeld) return;
    const yearlyYield = (trade.quantity / 100) * apy;
    const dailyYield = yearlyYield / 365;

    trade.yielded = dailyYield * trade.daysHeld;
    totalYield += trade.yielded;
  });

  return totalYield;
}

function parseTradeLog(trades:Array<any>, asset:IAsset): any {
  const sorted = trades.sort((a, b) => {
    if (b.timestamp > a.timestamp) return -1;
    if (a.timestamp > b.timestamp) return 1;
    return 0;
  });

  let quantityTotal = 0;
  const buyPrices: Array<number> = [];
  const sellPrices: Array<number> = [];

  const metrics = {
    totalBought: 0,
    totalSold: 0,
    initialValue: 0,
    totalTrades: 0,
    totalYield: 0,
  };

  sorted.forEach((trade) => {
    metrics.totalTrades += 1;

    if (trade.side === 'buy') {
      quantityTotal += trade.quantity;
      buyPrices.push(trade.price);

      const buyTime = new Date(trade.timestamp).getTime();
      const now = new Date().getTime();
      const diff = now - buyTime;
      const days = Math.ceil(diff / (1000 * 3600 * 24));

      trade.daysHeld = days;

      metrics.totalBought += trade.quantity * trade.price;
    } else if (trade.side === 'sell') {
      quantityTotal -= trade.quantity;
      sellPrices.push(trade.price);

      // TO DO: subtract amount from previous buys

      metrics.totalSold += trade.quantity * trade.price;
    }
  });

  const buyRange = calcRanges(buyPrices);
  const sellRange = calcRanges(sellPrices);

  if (asset.yield) {
    const totalYield = calculateYieldTotal(sorted, asset.yield);
    metrics.totalYield = totalYield;
  }

  metrics.initialValue = metrics.totalBought - metrics.totalSold;

  return {
    quantityTotal,
    buyRange,
    sellRange,
    metrics,
  };
}

function calcGrowth(initial:number, current:number): any {
  const increase = current - initial;
  const percentage = (increase / initial) * 100;

  return {
    increase, percentage,
  };
}

async function sync(assetId:Types.ObjectId): Promise<any> {
  try {
    const holding = await Holding.findOne({ assetId }).populate('trades').populate('asset').exec();
    if (!holding) return Promise.resolve('No holding found');

    if (!holding.trades) holding.trades = [];
    // @ts-ignore
    const values = parseTradeLog(holding.trades, holding.asset);
    holding.quantity = values.quantityTotal;
    holding.buyRange = values.buyRange;
    holding.sellRange = values.sellRange;
    holding.metrics = values.metrics;
    // @ts-ignore
    holding.currentValue = (holding.quantity * holding.asset.currentPrice);
    // @ts-ignore
    holding.currentValue += values.metrics.totalYield * holding.asset.currentPrice;

    const growth = calcGrowth(holding.metrics?.initialValue || 0, holding.currentValue || 0);

    // @ts-ignore
    holding.metrics.growthPercentage = growth.percentage;
    // @ts-ignore
    holding.metrics.growthValue = growth.increase;

    holding.markModified('metrics');
    await holding.save();

    return Promise.resolve(holding);
  } catch (error) {
    return Promise.reject(error);
  }
}

async function logTrade(trade:ITrade): Promise<any> {
  const holding = await Holding.findOne({ assetId: trade.assetId }).populate('trades').populate('asset').exec()
  || new Holding({ assetId: trade.assetId });

  if (!holding.trades) holding.trades = [];
  holding.trades.push(trade._id);

  await holding.save();

  sync(holding.assetId);

  return Promise.resolve(holding);
}

async function logPrice(id:Types.ObjectId): Promise<any> {
  try {
    sync(id);

    return Promise.resolve(true);
  } catch (error) {
    return Promise.reject(error);
  }
}

export default { logTrade, logPrice, sync };
