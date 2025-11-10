'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar() {
  
  const [search, setSearch] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      // First, try to find the coin by symbol/name
      const response = await fetch(`/api/search?q=${encodeURIComponent(search.trim())}`);
      
      if (response.ok) {
        const data = await response.json();
        // Navigate to the coin's detail page
        router.push(`/indicators/${data.id}`);
        setSearch('');
      } else {
        setError('Coin not found. Try another name or symbol.');
      }
    } catch (err) {
      setError('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-gray-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setError('');
          }}
          placeholder="Search by name or symbol (e.g., BTC, Bitcoin, Ethereum)..."
          className="block w-full pl-12 pr-4 py-4 text-lg border border-gray-300 rounded-2xl bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />

        <button
          type="submit"
          disabled={!search.trim() || isSearching}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500 text-center">{error}</p>
      )}
      {!error && (
        <p className="mt-3 text-sm text-gray-500 text-center">
          Search by name or symbol (e.g., BTC, Bitcoin, Ethereum)
        </p>
      )}
    </form>
  );
}

