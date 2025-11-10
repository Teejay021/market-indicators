import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, cacheKey } from "@/lib/cache";
import { guardPerMinute, guardPerDay } from "@/lib/rate";

const BASE = process.env.COINGECKO_BASE!;
const KEY = process.env.COINGECKO_API_KEY!;
const TTL_SECONDS = 120;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!KEY) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const { id } = await params;
  const coinId = id.toLowerCase();

  // CoinGecko OHLC endpoint for candlestick data (30 days)
  const upstream = `${BASE}/coins/${coinId}/ohlc?vs_currency=usd&days=30`;
  const k = cacheKey(upstream);

  const cached = getCached(k);
  
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
    });
  }

  if (!guardPerMinute(50)) return NextResponse.json({ error: "Per-minute guard" }, { status: 429 });

  if (!guardPerDay(500)) return NextResponse.json({ error: "Daily cap reached" }, { status: 429 });

  const res = await fetch(upstream, {
    headers: { 'x-cg-demo-api-key': KEY },
    next: { revalidate: TTL_SECONDS },
  });
  
  if (!res.ok) {
    
    const txt = await res.text().catch(() => "");

    return NextResponse.json({ error: "Upstream error", details: txt }, { status: res.status });
  }

  const raw = await res.json();

  // OHLC data format: [[timestamp, open, high, low, close], ...]
  if (!Array.isArray(raw) || raw.length === 0) {

    return NextResponse.json({ error: "Unexpected response format", raw }, { status: 502 });
  }

  // Transform to candlestick format
  const candlesticks = raw.map(([timestamp, open, high, low, close]: number[]) => ({
    // Convert to seconds for lightweight-charts
    time: Math.floor(timestamp / 1000),
    open,
    high,
    low,
    close,
  }));

  const data = { 
    id: coinId, 
    symbol: id.toUpperCase(),
    data: candlesticks,
    current_price: candlesticks[candlesticks.length - 1]?.close,
    starting_price: candlesticks[0]?.open,
  };
  
  setCached(k, data, TTL_SECONDS);

  return NextResponse.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
  });
}
