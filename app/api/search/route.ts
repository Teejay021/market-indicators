import { NextRequest, NextResponse } from 'next/server';

const BASE = process.env.COINGECKO_BASE;
const KEY = process.env.COINGECKO_API_KEY;

export async function GET(req: NextRequest) {
  const query = req.nextUrl.searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  if (!BASE || !KEY) {
    return NextResponse.json({ error: 'Missing API configuration' }, { status: 500 });
  }

  try {
    // Try to find the coin by searching CoinGecko
    const url = `${BASE}/search?query=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'x-cg-demo-api-key': KEY,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'Search failed' }, { status: response.status });
    }

    const data = await response.json();
    
    // Return the first matching coin from the coins array
    if (data.coins && data.coins.length > 0) {
      const firstMatch = data.coins[0];
      return NextResponse.json({
        id: firstMatch.id,
        name: firstMatch.name,
        symbol: firstMatch.symbol,
      });
    }

    return NextResponse.json({ error: 'Coin not found' }, { status: 404 });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}

