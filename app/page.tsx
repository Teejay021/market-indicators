'use client';

import { useEffect, useState } from 'react';
import SearchBar from './components/SearchBar';
import IndicatorCard from './components/IndicatorCard';

interface Indicator {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  market_cap_rank?: number;
  image?: string;
}

export default function Home() {
  const [indicators, setIndicators] = useState<Indicator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/indicators')
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setIndicators(data.indicators || []);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-4xl font-bold text-gray-900">
            Market Indicators
          </h1>
          <p className="mt-2 text-gray-600">
            Track top cryptocurrencies with 30-day historical data
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Search Section */}
        <div className="mb-16">
          <SearchBar />
        </div>

        {/* Top Coins Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Top Market Cap Coins
          </h2>
          <p className="text-gray-600 mb-6">
            Click on any coin to view 30-day price history
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
            <p className="mt-4 text-gray-600">Loading indicators...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-800 font-semibold">Error: {error}</p>
            <p className="text-red-600 text-sm mt-2">
              Make sure your API key is set in .env.local
            </p>
          </div>
        )}

        {/* Indicators Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {indicators.map((indicator) => (
              <IndicatorCard
                key={indicator.id}
                id={indicator.id}
                symbol={indicator.symbol}
                name={indicator.name}
                current_price={indicator.current_price}
                market_cap_rank={indicator.market_cap_rank}
                image={indicator.image}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && indicators.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
            <p className="text-gray-600">No indicators found</p>
          </div>
        )}
      </div>
    </main>
  );
}
