import { NextRequest, NextResponse } from "next/server";
import { getCached, setCached, cacheKey } from "@/lib/cache";

const TTL_SECONDS = 120;

// Alpha Vantage doesn't have a "list all crypto" endpoint, so we hardcode popular ones
const CRYPTO_INDICATORS = [
  { id: "BTC", name: "Bitcoin", description: "Bitcoin (BTC) to USD" },
  { id: "ETH", name: "Ethereum", description: "Ethereum (ETH) to USD" },
  { id: "BNB", name: "Binance Coin", description: "Binance Coin (BNB) to USD" },
  { id: "SOL", name: "Solana", description: "Solana (SOL) to USD" },
  { id: "ADA", name: "Cardano", description: "Cardano (ADA) to USD" },
];

export async function GET(req: NextRequest) {

  const k = cacheKey("crypto-indicators-list");
  
  const cached = getCached(k);

  if (cached) {

    return NextResponse.json(cached, {

      headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
    });
  }

  
  const data = {

    indicators: CRYPTO_INDICATORS,

    timestamp: new Date().toISOString(),
  };

  setCached(k, data, TTL_SECONDS);

  return NextResponse.json(data, {
    headers: { "Cache-Control": `public, s-maxage=${TTL_SECONDS}, stale-while-revalidate=30` },
  });
}

