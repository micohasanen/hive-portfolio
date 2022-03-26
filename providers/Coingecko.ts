import axios from 'axios';

async function fetchLatest(id:string): Promise<any> {
  try {
    const params = new URLSearchParams([
      ['ids', id.toString()],
      ['vs_currencies', 'usd'],
      ['include_market_cap', 'true'],
      ['include_24hr_vol', 'true'],
      ['include_24hr_change', 'true'],
      ['include_last_updated_at', 'true'],
    ]);
    const query = params.toString();
    const price = await axios.get(`${process.env.COINGECKO_API}/simple/price?${query}`);

    return Promise.resolve(price.data[id]);
  } catch (error) {
    return Promise.reject(error);
  }
}

export default { fetchLatest };
