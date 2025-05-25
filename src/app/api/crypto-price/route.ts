
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch cryptocurrency price.
 * This is a placeholder and needs to be implemented with a real API call to CoinMarketCap.
 *
 * Query parameters:
 * - symbol: The cryptocurrency symbol (e.g., 'BTC', 'ETH', 'SOL')
 * - date: The date of acquisition (e.g., 'YYYY-MM-DD')
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbol = searchParams.get('symbol');
  const date = searchParams.get('date'); // YYYY-MM-DD format

  if (!symbol || !date) {
    return NextResponse.json({ error: 'Símbolo da moeda e data são obrigatórios' }, { status: 400 });
  }

  // TODO: Implement actual CoinMarketCap API call here
  // 1. Get your CoinMarketCap API Key (store it in .env as COINMARKETCAP_API_KEY)
  //    const apiKey = process.env.COINMARKETCAP_API_KEY;
  //    if (!apiKey) {
  //      return NextResponse.json({ error: 'Chave de API não configurada no servidor' }, { status: 500 });
  //    }
  //
  // 2. Choose the correct CoinMarketCap endpoint. For historical data, you might need a specific one.
  //    Example: /v1/cryptocurrency/quotes/historical (check CMC docs for exact endpoint and params)
  //    You'll likely need to convert the symbol (e.g., "Bitcoin") to its CMC ID or symbol (e.g., "BTC").
  //
  // 3. Make the fetch request to CoinMarketCap API:
  //    const cmcResponse = await fetch(`https://pro-api.coinmarketcap.com/v1/...&symbol=${symbol}&date=${date}&convert=BRL`, {
  //      headers: {
  //        'X-CMC_PRO_API_KEY': apiKey,
  //        'Accept': 'application/json',
  //      },
  //    });
  //    if (!cmcResponse.ok) {
  //       const errorData = await cmcResponse.json();
  //       console.error('Erro da API CoinMarketCap:', errorData);
  //       return NextResponse.json({ error: 'Falha ao buscar preço da API externa', details: errorData }, { status: cmcResponse.status });
  //    }
  //    const data = await cmcResponse.json();
  //    // Extract the price in BRL from the 'data' object based on CMC API response structure
  //    // const priceInBRL = data.data[symbol.toUpperCase()].quote.BRL.price; // This is an example, structure might vary

  // For now, returning a MOCK PRICE
  console.log(`[API MOCK] Solicitado preço para ${symbol} na data ${date}`);
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  let mockPrice = 0;
  const dayOfMonth = new Date(date).getDate() + 1; // Ensure dayOfMonth is not 0

  if (symbol.toLowerCase() === 'bitcoin') mockPrice = 350000 + (dayOfMonth * 100) - Math.random() * 5000;
  else if (symbol.toLowerCase() === 'ethereum') mockPrice = 18000 + (dayOfMonth * 50) - Math.random() * 1000;
  else if (symbol.toLowerCase() === 'solana') mockPrice = 700 + (dayOfMonth * 10) - Math.random() * 50;
  else mockPrice = Math.random() * 1000;

  return NextResponse.json({ price: parseFloat(mockPrice.toFixed(2)), currency: 'BRL' });
}
