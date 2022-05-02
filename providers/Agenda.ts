import { Agenda } from 'agenda';
import { startSession } from 'mongoose';
import config from '../config';

// Models
import Asset from '../models/Asset';

// Providers
import Coingecko from './Coingecko';

// Controllers
import PriceController from '../controllers/PriceController';
import HoldingController from '../controllers/HoldingController';
// @ts-ignore
import { createSnapshot } from '../controllers/TreasuryController';

const agenda = new Agenda({ db: { address: config.mongoConnection } });

agenda.define('fetch latest prices', async () => {
  const session = await startSession();
  const assets = await Asset.find().session(session).exec();

  assets.forEach(async (asset) => {
    const marketData = await Coingecko.fetchLatest(asset.id);
    const price = marketData.usd;
    const marketCap = marketData.usd_market_cap;
    const volume = marketData.usd_24h_vol;

    asset.currentPrice = price;
    asset.marketCap = marketCap;
    asset.change24h = marketData.usd_24h_change;
    await asset.save();

    HoldingController.logPrice(asset._id);

    PriceController.logPrice({
      assetId: asset.id,
      timestamp: new Date(),
      price,
      marketCap,
      volume,
    });
  });

  session.endSession();
});

agenda.define('treasury snapshot', async () => {
  createSnapshot();
});

async function init() {
  await agenda.start();
  // await agenda.every('1 hours', 'fetch latest prices');
  await agenda.every('12 hours', 'treasury snapshot');
  await agenda.now('fetch latest prices', {});
  // await agenda.now('treasury snapshot', {});

  console.log('✨ Agenda Inited');
}

async function syncPrices() {
  await agenda.now('fetch latest prices', {});
  await agenda.now('treasury snapshot', {});
}

export { init, syncPrices };
