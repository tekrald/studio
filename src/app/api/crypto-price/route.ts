
import { type NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';

/**
 * API route to fetch cryptocurrency price from CoinMarketCap.
 *
 * Query parameters:
 * - symbol: The cryptocurrency name (e.g., 'Bitcoin', 'Ethereum', 'Solana')
 * - date: The date of acquisition (e.g., 'YYYY-MM-DD')
 */

const SYMBOL_MAP: { [key: string]: string } = {
  'Bitcoin': 'BTC',
  'Ethereum': 'ETH',
  'Solana': 'SOL',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolName = searchParams.get('symbol');
  const dateString = searchParams.get('date'); // Expected YYYY-MM-DD format

  if (!symbolName || !dateString) {
    return NextResponse.json({ error: 'Símbolo da moeda e data são obrigatórios' }, { status: 400 });
  }

  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.error('COINMARKETCAP_API_KEY não está configurada no servidor.');
    return NextResponse.json({ error: 'Configuração da API do servidor incompleta.' }, { status: 500 });
  }

  const cmcSymbol = SYMBOL_MAP[symbolName];
  if (!cmcSymbol) {
    return NextResponse.json({ error: `Símbolo da moeda não mapeado: ${symbolName}` }, { status: 400 });
  }

  // Format date just to be sure, though it should come as YYYY-MM-DD
  let formattedDate;
  try {
    formattedDate = format(new Date(dateString + 'T00:00:00Z'), 'yyyy-MM-dd'); // Ensure UTC interpretation
  } catch (e) {
    return NextResponse.json({ error: 'Formato de data inválido.' }, { status: 400 });
  }

  // CoinMarketCap API URL for historical quotes
  // We aim for the closing price of the specified day.
  // CMC API needs the date for time_start or time_end.
  // Using interval=daily should give one quote for the day.
  const apiUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?symbol=${cmcSymbol}&time_start=${formattedDate}&time_end=${formattedDate}&count=1&interval=daily&convert=BRL`;
  
  try {
    const cmcResponse = await fetch(apiUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!cmcResponse.ok) {
      const errorData = await cmcResponse.json();
      console.error('Erro da API CoinMarketCap:', errorData);
      return NextResponse.json({ error: 'Falha ao buscar preço da API externa.', details: errorData.status?.error_message || 'Erro desconhecido da CMC' }, { status: cmcResponse.status });
    }

    const data = await cmcResponse.json();

    // Extract the price in BRL
    // The structure is data.data[SYMBOL].quotes[0].quote.BRL.price
    const quotes = data?.data?.[cmcSymbol]?.[0]?.quotes; // CMC v2 returns symbol in data object directly with array of quotes
    if (!quotes || quotes.length === 0) {
      console.error('Resposta da API CoinMarketCap não contém cotações:', data);
      return NextResponse.json({ error: 'Preço não encontrado para a data ou símbolo especificado na resposta da API.' }, { status: 404 });
    }
    
    // Assuming the first quote in the array is for the requested day
    const priceInBRL = quotes[0]?.quote?.BRL?.price;

    if (priceInBRL === undefined || priceInBRL === null) {
      console.error('Preço em BRL não encontrado na cotação:', quotes[0]);
      return NextResponse.json({ error: 'Preço em BRL não encontrado para a data ou símbolo especificado.' }, { status: 404 });
    }

    return NextResponse.json({ price: parseFloat(priceInBRL.toFixed(2)), currency: 'BRL' });

  } catch (error) {
    console.error('Erro ao buscar preço da CoinMarketCap:', error);
    // @ts-ignore
    return NextResponse.json({ error: 'Erro interno ao buscar preço.', details: error.message }, { status: 500 });
  }
}
