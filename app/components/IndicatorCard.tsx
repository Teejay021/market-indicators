import Link from 'next/link';
import Image from 'next/image';

interface IndicatorCardProps {
  id: string;
  symbol: string;
  name: string;
  current_price?: number;
  market_cap_rank?: number;
  image?: string;
}

export default function IndicatorCard({ 
  id, 
  symbol, 
  name, 
  current_price, 
  market_cap_rank,
  image 
}: IndicatorCardProps) {
  return (
    <Link 
      href={`/indicators/${id}`}
      className="group block"
    >
      <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 p-6 shadow-sm hover:shadow-xl hover:border-blue-500 transition-all duration-300 ease-in-out transform hover:-translate-y-1">
        {/* Rank Badge */}
        {market_cap_rank && (
          <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
            #{market_cap_rank}
          </div>
        )}

        {/* Coin Icon and Info */}
        <div className="flex items-center gap-4">
          {/* Coin Image */}
          <div className="flex-shrink-0 w-16 h-16 relative">
            {image ? (
              <Image 
                src={image} 
                alt={name}
                width={64}
                height={64}
                className="rounded-full"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                {symbol.charAt(0)}
              </div>
            )}
          </div>

          {/* Coin Details */}
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <p className="text-sm text-gray-500 uppercase font-semibold">
              {symbol}
            </p>
          </div>
        </div>

        {/* Price */}
        {current_price !== undefined && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-2xl font-bold text-gray-900">
              ${current_price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-gray-500 mt-1">Current Price (USD)</p>
          </div>
        )}

        {/* Arrow indicator on hover */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}

