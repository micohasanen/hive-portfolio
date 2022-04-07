import { Router } from 'express';

import Treasury from '../models/Treasury';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const snapshots = await Treasury
      .find()
      .sort('-timestamp')
      .limit(10)
      .exec();

    return res.status(200).json({ results: snapshots });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong.', error });
  }
});

export default router;
