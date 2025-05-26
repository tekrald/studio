
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

async function fetchPriceFromCMC(cmcSymbol: string, dateString: string, currency: 'BRL' | 'USD', apiKey: string) {
  const apiUrl = `https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/historical?symbol=${cmcSymbol}&time_start=${dateString}&time_end=${dateString}&count=1&interval=daily&convert=${currency}`;
  
  try {
    const cmcResponse = await fetch(apiUrl, {
      headers: {
        'X-CMC_PRO_API_KEY': apiKey,
        'Accept': 'application/json',
      },
    });

    if (!cmcResponse.ok) {
      const errorData = await cmcResponse.json().catch(() => ({ status: { error_message: 'Failed to parse error from CMC' } }));
      console.error(`CoinMarketCap API Error fetching in ${currency}:`, errorData);
      return { success: false, error: `Failed to fetch price (${currency}) from external API.`, details: errorData.status?.error_message || 'Unknown CMC error', status: cmcResponse.status };
    }

    const data = await cmcResponse.json();
    const quotes = data?.data?.[cmcSymbol]?.[0]?.quotes;
    
    if (!quotes || quotes.length === 0) {
      console.warn(`CoinMarketCap API response (for ${currency}) does not contain quotes:`, data);
      return { success: false, error: `Price in ${currency} not found for the date or symbol in API response.` , details: `No quotes found for ${cmcSymbol} on ${dateString} in ${currency}.`};
    }
    
    const priceInSelectedCurrency = quotes[0]?.quote?.[currency]?.price;

    if (priceInSelectedCurrency === undefined || priceInSelectedCurrency === null) {
      console.warn(`Price in ${currency} not found in quote:`, quotes[0]);
      return { success: false, error: `Price in ${currency} not found for the date or symbol.` };
    }

    return { success: true, price: parseFloat(priceInSelectedCurrency.toFixed(2)), currency };

  } catch (error) {
    console.error(`Error fetching price from CoinMarketCap (${currency}):`, error);
    // @ts-ignore
    return { success: false, error: `Internal error fetching price (${currency}).`, details: error.message, status: 500 };
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const symbolName = searchParams.get('symbol');
  const dateString = searchParams.get('date'); // Expected YYYY-MM-DD format

  if (!symbolName || !dateString) {
    return NextResponse.json({ error: 'Currency symbol and date are required' }, { status: 400 });
  }

  const apiKey = process.env.COINMARKETCAP_API_KEY;
  if (!apiKey) {
    console.error('COINMARKETCAP_API_KEY is not configured on the server.');
    return NextResponse.json({ error: 'Server API configuration incomplete.' }, { status: 500 });
  }

  const cmcSymbol = SYMBOL_MAP[symbolName];
  if (!cmcSymbol) {
    return NextResponse.json({ error: `Currency symbol not mapped: ${symbolName}` }, { status: 400 });
  }

  let formattedDate;
  try {
    // Ensure the date is treated as UTC to avoid timezone shifts when selecting "a day"
    const dateObj = new Date(dateString + 'T00:00:00Z');
    if (isNaN(dateObj.getTime())) throw new Error('Invalid date object');
    formattedDate = format(dateObj, 'yyyy-MM-dd');
  } catch (e) {
    console.error("Error formatting date:", e);
    return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
  }

  // Try fetching in BRL first
  let result = await fetchPriceFromCMC(cmcSymbol, formattedDate, 'BRL', apiKey);

  // If BRL fetch failed or didn't find a BRL price, try USD
  if (!result.success || result.price === undefined) {
    console.log(`Price in BRL not found for ${cmcSymbol} on ${formattedDate}. Trying USD.`);
    result = await fetchPriceFromCMC(cmcSymbol, formattedDate, 'USD', apiKey);
  }

  if (result.success && result.price !== undefined) {
    return NextResponse.json({ price: result.price, currency: result.currency });
  } else {
    // If both attempts fail, return the last error
    return NextResponse.json({ error: result.error, details: result.details }, { status: result.status || 500 });
  }
}
