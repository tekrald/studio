
import { type NextRequest, NextResponse } from 'next/server';

/**
 * API route to fetch cryptocurrency price.
 * THIS IS CURRENTLY A MOCK/SIMULATION.
 * For real-time accurate prices, implement a call to a live market API (e.g., CoinMarketCap)
 * using a secure backend proxy for your API key.
 *
 * Query parameters:
 * - symbol: The cryptocurrency symbol (e.g., 'Bitcoin', 'Ethereum', 'Solana')
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
  //    Example: /v1/cryptocurrency/quotes/historical or /v2/cryptocurrency/quotes/historical (check CMC docs)
  //    You'll likely need to convert the symbol (e.g., "Bitcoin") to its CMC ID or symbol (e.g., "BTC").
  //    And specify conversion to BRL. Example URL might look like:
  //    `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?symbol=${CMCSymbol}&time_start=${date}&time_end=${date}&convert=BRL`
  //
  // 3. Make the fetch request to CoinMarketCap API:
  //    const cmcResponse = await fetch(CMC_API_URL, {
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
  //    // The structure can be complex for historical data. You might get an array of quotes for the day.
  //    // Example (highly dependent on actual API response):
  //    // const priceInBRL = data.data[CMCSymbol]?.quotes?.[0]?.quote?.BRL?.price;
  //    // if (priceInBRL === undefined) {
  //    //   return NextResponse.json({ error: 'Preço não encontrado para a data ou símbolo especificado.' }, { status: 404 });
  //    // }
  //    // return NextResponse.json({ price: parseFloat(priceInBRL.toFixed(2)), currency: 'BRL' });


  // For now, returning a MOCK PRICE - ADJUSTED MAGNITUDE
  console.log(`[API MOCK] Solicitado preço para ${symbol} na data ${date}. Retornando valor simulado.`);
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

  let mockPrice = 0;
  // Using a part of the date to make the mock slightly variable but predictable for testing
  const dayOfMonth = new Date(date).getDate() || 1; // Ensure dayOfMonth is not 0

  if (symbol.toLowerCase() === 'bitcoin') {
    // Adjusted base to be closer to user's observed value for a more 'realistic' mock
    mockPrice = 600000 + (dayOfMonth * 150) - Math.random() * 10000;
  } else if (symbol.toLowerCase() === 'ethereum') {
    mockPrice = 18000 + (dayOfMonth * 50) - Math.random() * 1000;
  } else if (symbol.toLowerCase() === 'solana') {
    mockPrice = 700 + (dayOfMonth * 10) - Math.random() * 50;
  } else {
    mockPrice = (Math.random() * 1000) + 50; // Generic mock for other potential symbols
  }

  // Ensure the API returns a standard number (period for decimal separator)
  return NextResponse.json({ price: parseFloat(mockPrice.toFixed(2)), currency: 'BRL' });
}
