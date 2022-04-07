// @ts-ignore
import Treasury from '../models/Treasury';
import Holding from '../models/Holding';

async function createSnapshot() {
  const holdings = await Holding.find({ quantity: { $gt: 0 } });
  let totalValue = 0;

  holdings.forEach((holding) => {
    if (!holding.currentValue) return;
    totalValue += holding.currentValue;
  });

  const snapshot = new Treasury({ timestamp: new Date(), value: totalValue });
  await snapshot.save();
}

export { createSnapshot };
