import 'dotenv/config';

import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';

import config from './config';
import { init } from './providers/Agenda';

// Routes
import assetRouter from './routes/assets';
import tradesRouter from './routes/trades';
import holdingsRouter from './routes/holdings';
import treasuryRouter from './routes/treasury';

const PORT = process.env.PORT || 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan('dev'));

mongoose
  .connect(config.mongoConnection);

app.get(`/${config.apiPrefix}`, (req: Request, res: Response) => {
  res.status(200).send('Hive Portfolio API');
});

app.use(`/${config.apiPrefix}/assets`, assetRouter);
app.use(`/${config.apiPrefix}/trades`, tradesRouter);
app.use(`/${config.apiPrefix}/holdings`, holdingsRouter);
app.use(`/${config.apiPrefix}/treasury`, treasuryRouter);

app.listen(PORT, () => {
  init();
  console.log('🚀 Hive Portfolio running on port', PORT);
});

export default app;
