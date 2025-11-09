import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, cacheKey } from "@/lib/cache";
import { guardPerMinute, guardPerDay } from "@/lib/rate";

const BASE = process.env.ALPHAVANTAGE_BASE!;

const KEY  = process.env.ALPHAVANTAGE_API_KEY!;

const TTL_SECONDS = 120;

export async function GET(
  req: NextRequest,
  { params }: { params: { symbol: string } }
) {
  if (!KEY) return NextResponse.json({ error: "Missing API key" }, { status: 500 });

  const symbol = params.symbol.toUpperCase();

  // Alpha Vantage crypto endpoint
  const upstream = `${BASE}?function=DIGITAL_CURRENCY_DAILY&symbol=${encodeURIComponent(symbol)}&market=USD&apikey=${KEY}`;

  const k = cacheKey(upstream);

  const cached = getCached(k);
  if (cached) {
    return NextResponse.json(cached, {
      headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
    });
  }

  if (!guardPerMinute(5)) return NextResponse.json({ error: "Per-minute guard" }, { status: 429 });
  if (!guardPerDay(25))   return NextResponse.json({ error: "Daily cap reached" }, { status: 429 });

  const res = await fetch(upstream, { next: { revalidate: TTL_SECONDS } });
  
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    return NextResponse.json({ error: "Upstream error", details: txt }, { status: res.status });
  }

  const raw = await res.json();

  // Crypto data is under "Time Series (Digital Currency Daily)"
  const series = raw?.["Time Series (Digital Currency Daily)"];

  if (!series) return NextResponse.json({ error: "Unexpected response format", raw }, { status: 502 });

  const points = Object.keys(series)
    .sort()                       // ascending by date
    .slice(-30)                   // last 30 days
    .map((d) => {
      const row = series[d];
      // Crypto uses "4a. close (USD)" field
      const closeUSD = row?.["4a. close (USD)"];
      return { time: d, value: closeUSD ? Number(closeUSD) : null };
    });

  const data = { symbol, data: points };
  setCached(k, data, TTL_SECONDS);

  return NextResponse.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
  });
}
