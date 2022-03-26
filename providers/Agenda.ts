import { Agenda } from 'agenda';
import config from '../config';

// Models
import Asset from '../models/Asset';

// Providers
import Coingecko from './Coingecko';

// Controllers
import PriceController from '../controllers/PriceController';
import HoldingController from '../controllers/HoldingController';

const agenda = new Agenda({ db: { address: config.mongoConnection } });

agenda.define('fetch latest prices', async () => {
  const assets = await Asset.find();

  assets.forEach(async (asset) => {
    const marketData = await Coingecko.fetchLatest(asset.id);
    const price = marketData.usd;
    const marketCap = marketData.usd_market_cap;
    const volume = marketData.usd_24h_vol;

    asset.currentPrice = price;
    asset.marketCap = marketCap;
    asset.change24h = marketData.usd_24h_change;
    await asset.save();

    HoldingController.logPrice(asset.id, price);

    PriceController.logPrice({
      assetId: asset.id,
      timestamp: new Date(),
      price,
      marketCap,
      volume,
    });
  });
});

async function init() {
  await agenda.start();
  await agenda.every('1 minutes', 'fetch latest prices');

  console.log('✨ Agenda Inited');
}

export default init;
