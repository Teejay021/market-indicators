# Market Indicators

Cryptocurrency tracking application with 30-day candlestick charts, server-side caching, and rate limiting.

**Live Demo:** []

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- lightweight-charts
- CoinGecko API

## Setup

### Prerequisites
- Node.js 18+
- CoinGecko API key (free tier)

### Installation

1. Clone and install dependencies
```bash
git clone https://github.com/Teejay021/market-indicators.git
cd market-indicators
npm install
```

2. Create `.env.local` in root directory:
```env
COINGECKO_BASE=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=your_api_key_here
```

Get your API key at: https://www.coingecko.com/en/api

3. Run development server
```bash
npm run dev
```

Open http://localhost:3000

## Caching Strategy

### Implementation

**Server-side in-memory cache** (`lib/cache.ts`)
- TTL: 120 seconds
- Uses `Map<string, Entry>` with expiration timestamps
- Cache key: Full API URL including query params

**Flow:**
1. Request arrives → check cache for valid entry
2. If cached and not expired → return immediately
3. If missing or expired → fetch from CoinGecko API
4. Store response with 120s TTL → return to client

**HTTP Cache Headers:**
```
Cache-Control: public, s-maxage=120, stale-while-revalidate=30
```

### Benefits

| Metric | Without Cache | With Cache |
|--------|--------------|------------|
| API Calls | 1 per request | 1 per 120s |
| Response Time | 200-500ms | <10ms |
| Monthly Usage | ~50,000 | ~2,500 |

## Rate Limiting

Two-layer protection in `lib/rate.ts`:

**Per-Minute Limiting**
- Limit: 50 requests/minute
- Sliding window with timestamp tracking
- Auto-cleanup after 60 seconds

**Daily Limiting**
- Limit: 500 requests/day
- Resets at midnight
- Date-based counter

Both checks run before each external API call. Returns `429 Too Many Requests` if limits exceeded.

With 120s caching, actual API usage stays well under daily limits (~360 calls/hour max for 15 indicators).

## Project Structure

```
app/
├── api/
│   └── indicators/
│       ├── route.ts          # GET list of top 15 cryptos
│       └── [id]/route.ts     # GET 30-day OHLC data
├── components/
│   ├── CandlestickChart.tsx  # Chart rendering
│   ├── IndicatorCard.tsx     # Crypto card
│   └── SearchBar.tsx         # Search input
├── indicators/[id]/
│   └── page.jsx              # Detail page
└── page.tsx                  # Home page

lib/
├── cache.ts                   # Caching logic
└── rate.ts                    # Rate limiting
```

## API Endpoints

**GET /api/indicators**

Returns top 15 cryptocurrencies by market cap.

```json
{
  "indicators": [
    {
      "id": "bitcoin",
      "symbol": "BTC",
      "name": "Bitcoin",
      "current_price": 104378,
      "market_cap_rank": 1,
      "image": "https://..."
    }
  ],
  "timestamp": "2024-11-10T12:00:00.000Z"
}
```

**GET /api/indicators/:id**

Returns 30 days of OHLC data for candlestick chart.

```json
{
  "id": "bitcoin",
  "symbol": "BTC",
  "data": [
    {
      "time": 1699574400,
      "open": 35000,
      "high": 36000,
      "low": 34500,
      "close": 35800
    }
  ],
  "current_price": 104378,
  "starting_price": 98500
}
```

## Deployment

Optimized for Vercel:

1. Push to GitHub
2. Import repository in Vercel
3. Add environment variables
4. Deploy

Vercel auto-detects Next.js configuration.
