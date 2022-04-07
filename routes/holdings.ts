import { Router, Request, Response } from 'express';
import Holding from '../models/Holding';

import HoldingController from '../controllers/HoldingController';

const router = Router();

function calcYields(amount:number, apr:number) {
  const yearly = (amount / 100) * apr;
  const monthly = yearly / 12;
  const daily = yearly / 365;

  return {
    daily,
    monthly,
    yearly,
  };
}

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const size = Number(req.query.size) || 5;
    const sort = req.query.sort || 'name';

    const query = { quantity: { $gt: 0, $exists: true } };

    const total = await Holding.countDocuments(query);
    const highestPage = Math.ceil(total / size) - 1;

    const holdings = await Holding
      .find(query)
      .skip(page * size)
      .limit(size)
      .sort(sort)
      .select('-trades')
      .populate('asset')
      .lean()
      .exec();

    holdings.forEach((holding:any) => {
      if (!holding.asset) return;

      holding.currentValue = holding.quantity * holding.asset.currentPrice;

      if (holding.asset.yield) {
        holding.yields = calcYields(holding.currentValue, holding.asset.yield);
      }
    });

    return res.status(200).json({
      total,
      page,
      size,
      highestPage,
      results: holdings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
});

router.put('/:id/sync', async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    HoldingController.sync(req.params.id);
    return res.sendStatus(200);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
});

export default router;
