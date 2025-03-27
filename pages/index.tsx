import type { FC } from 'react'
import { Search } from '../components/Search'
import { useState } from 'react'
// import { motion } from 'framer-motion' // added for potential future animations when we add those

interface Business {
  name: string;
  categories: { title: string }[];
  rating: number;
  image_url?: string;
  yelp_url?: string;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string, categories?: string) => {
    if (query.trim() === '') return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        q: query,
        ...(categories ? { categories } : {})
      });

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const { data, pagination } = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Unable to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 pt-10">
      <div className="w-full max-w-[900px] px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Octave
            <span className="text-gray-500 text-2xl ml-2">NYC Discoveries</span>
          </h1>
          {/* commented out welcome section for potential future animation 
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-gray-600 mb-6"
          >
            Discover the hidden gems of NYC with personalized recommendations. 
            Start exploring today →
          </motion.div>
          */}
        </div>

        <Search onSearch={handleSearch} isLoading={isLoading} />

        {error && (
          <div className="w-full mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        
        <section className="mt-8">
          <div className="bg-white p-8 rounded-lg shadow-md w-full">
            <h2 className="text-2xl font-semibold mb-6">Businesses Database</h2>
            
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Searching businesses...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {searchResults.map((business, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100 p-4 rounded-lg shadow-sm"
                  >
                    <h3 className="font-semibold">{business.name}</h3>
                    <p className="text-sm text-gray-600">
                      {business.categories.map(cat => cat.title).join(', ')}
                    </p>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-yellow-500">★ {business.rating}</span>
                      {business.yelp_url && (
                        <a 
                          href={business.yelp_url} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 text-sm hover:underline"
                        >
                          View Details
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                <p className="text-lg text-gray-500">Search for businesses in NYC</p>
                <p className="mt-2 text-sm text-gray-400">Start typing to find what you're looking for</p>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}