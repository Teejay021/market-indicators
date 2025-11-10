'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const CandlestickChart = dynamic(() => import('@/app/components/CandlestickChart'), { ssr: false });

export default function IndicatorDetail() {

  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {

    if (!params.id) return;

    fetch(`/api/indicators/${params.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setData(data);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">Loading chart data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-8">
        <div className="container mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-6">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Error Loading Data</h2>
            <p className="text-red-600">{error}</p>
            <p className="text-red-500 text-sm mt-4">
              Make sure the cryptocurrency name is correct (e.g., bitcoin, ethereum, solana)
            </p>
            <button 
              onClick={() => router.push('/')}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Calculate price change from OHLC data
  const firstPrice = data?.starting_price || data?.data?.[0]?.open;
  const lastPrice = data?.current_price || data?.data?.[data.data.length - 1]?.close;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = ((priceChange / firstPrice) * 100).toFixed(2);
  const isPositive = priceChange >= 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-semibold mb-4">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 capitalize">
                {data?.id?.replace(/-/g, ' ')}
              </h1>
              <p className="text-xl text-gray-600 mt-1 uppercase font-semibold">
                {data?.symbol}
              </p>
            </div>
            
            {lastPrice && (
              <div className="text-right">
                <p className="text-3xl font-bold text-gray-900">
                  ${lastPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <div className={`flex items-center justify-end mt-2 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  <svg 
                    className={`w-5 h-5 mr-1 transform ${isPositive ? 'rotate-0' : 'rotate-180'}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M12 7a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 11-2 0V9.414l-3.293 3.293a1 1 0 01-1.414 0L9 10.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0L12 10.586V7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-semibold">
                    {isPositive ? '+' : ''}{priceChangePercent}% (30d)
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="container mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">30-Day Candlestick Chart</h2>
            <p className="text-gray-600 mt-1">OHLC (Open, High, Low, Close) price data</p>
            <div className="flex gap-4 mt-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span className="text-gray-600">Price Up</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-600">Price Down</span>
              </div>
            </div>
          </div>

          <CandlestickChart data={data?.data || []} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-200">
            <div>
              <p className="text-sm text-gray-500 mb-1">Starting Price</p>
              <p className="text-lg font-bold text-gray-900">
                ${firstPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Current Price</p>
              <p className="text-lg font-bold text-gray-900">
                ${lastPrice?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">30-Day Change</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}${Math.abs(priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Change %</p>
              <p className={`text-lg font-bold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{priceChangePercent}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


