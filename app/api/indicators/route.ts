import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, cacheKey } from "@/lib/cache";
import { guardPerMinute, guardPerDay } from "@/lib/rate";

const BASE = process.env.COINGECKO_BASE!;
const KEY = process.env.COINGECKO_API_KEY!;
const TTL_SECONDS = 120;

export async function GET(req: NextRequest) {

  if (!KEY) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const upstream = `${BASE}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=15&sparkline=false`;

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

  // CoinGecko returns an array of coin objects
  const indicators = raw.map((coin: any) => ({
    id: coin.id,
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    current_price: coin.current_price,
    market_cap_rank: coin.market_cap_rank,
    image: coin.image,
  }));

  const data = {

    indicators,
    
    timestamp: new Date().toISOString(),
  };

  setCached(k, data, TTL_SECONDS);

  return NextResponse.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
  });
}

