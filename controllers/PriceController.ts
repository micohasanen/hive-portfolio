import Price from '../models/Price';
import IPrice from '../interfaces/IPrice';

async function logPrice(data:IPrice): Promise<any> {
  const price = new Price({ ...data });
  await price.save();

  return Promise.resolve();
}

export default { logPrice };
