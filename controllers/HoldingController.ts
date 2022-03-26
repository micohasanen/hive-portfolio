import Holding from '../models/Holding';
import ITrade from '../interfaces/ITrade';

function calcRanges(array:Array<number>): any {
  const sum = array.reduce((prev, curr) => prev + curr, 0);
  const avg = sum / array.length || 0;

  const low = Math.min(...array);
  const high = Math.max(...array);

  return { avg, low, high };
}

function parseTradeLog(trades:Array<any>): any {
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
  };

  sorted.forEach((trade) => {
    metrics.totalTrades += 1;

    if (trade.side === 'buy') {
      quantityTotal += trade.quantity;
      buyPrices.push(trade.price);

      metrics.totalBought += trade.quantity * trade.price;
    } else if (trade.side === 'sell') {
      quantityTotal -= trade.quantity;
      sellPrices.push(trade.price);

      metrics.totalSold += trade.quantity * trade.price;
    }
  });

  const buyRange = calcRanges(buyPrices);
  const sellRange = calcRanges(sellPrices);

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

async function sync(assetId:string): Promise<any> {
  try {
    const holding = await Holding.findOne({ assetId }).populate('trades').exec();
    if (!holding) throw new Error('No holding found');

    if (!holding.trades) holding.trades = [];
    const values = parseTradeLog(holding.trades);
    holding.quantity = values.quantityTotal;
    holding.buyRange = values.buyRange;
    holding.sellRange = values.sellRange;
    holding.metrics = values.metrics;

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
  const holding = await Holding.findOne({ assetId: trade.assetId }).populate('trades').exec()
  || new Holding({ assetId: trade.assetId });

  if (!holding.trades) holding.trades = [];
  holding.trades.push(trade._id);

  await holding.save();

  sync(holding.assetId);

  return Promise.resolve(holding);
}

async function logPrice(id:string, price:number): Promise<any> {
  try {
    const holding = await Holding.findOne({ assetId: id }).exec();
    if (!holding) throw new Error('No Holding found');

    holding.currentValue = holding.quantity * price;
    const growth = calcGrowth(holding.metrics?.initialValue || 0, holding.currentValue || 0);

    // @ts-ignore
    holding.metrics.growthPercentage = growth.percentage;
    // @ts-ignore
    holding.metrics.growthValue = growth.increase;

    await holding?.save();

    return Promise.resolve(holding);
  } catch (error) {
    return Promise.reject(error);
  }
}

export default { logTrade, logPrice, sync };
