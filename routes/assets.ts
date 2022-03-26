import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
// Models
import Asset from '../models/Asset';

const router = Router();

router.post('/', [
  body('name').notEmpty().exists(),
  body('symbol').notEmpty().exists(),
  body('id').notEmpty().exists(),
], async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const asset = new Asset({ ...req.body });
  await asset.save();

  return res.status(200).send(asset);
});

export default router;
