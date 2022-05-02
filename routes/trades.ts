import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';

import { syncPrices } from '../providers/Agenda';

// Models
import Trade from '../models/Trade';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 0;
    const size = Number(req.query.size) || 10;

    const total = await Trade.countDocuments();

    const trades = await Trade.find()
      .lean()
      .limit(size)
      .skip(page * size)
      .exec();

    return res.status(200).json({
      total,
      page,
      size,
      results: trades,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

router.post('/', [
  body('side').exists().notEmpty(),
  body('price').exists().notEmpty().custom((value) => !Number.isNaN(value) && value > 0),
  body('quantity').exists().notEmpty().custom((value) => !Number.isNaN(value) && value > 0),
  body('assetId').exists().notEmpty(),
], async (req: Request, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const timestamp = new Date(req.body.timestamp) || new Date();
    const trade = new Trade({ ...req.body, timestamp });
    await trade.save();

    syncPrices();

    return res.status(200).send(trade);
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.' });
  }
});

export default router;
