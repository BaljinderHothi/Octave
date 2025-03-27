/* 
This page is meant to show a list of popular restaurants and recommended ones as well as we use teh search bar on top to find different restaurants 
and we return the ones that are recommended and match their parameters
some things we need to keep in mind as we improve are :

- use React state for search results
- create search API endpoint
- implement error handling
- design responsive layout
*/

import type { FC } from 'react'
import { Soup } from 'lucide-react'
import { Search } from '../components/Search'
import { useState } from 'react'

interface Restaurant {
  name: string;
  categories: { title: string }[];
  rating: number;
  image_url: string;
  yelp_url: string;
}

export default function Home() {
  const [searchResults, setSearchResults] = useState<Restaurant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    if (query.trim() === '') return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/search?q=${query}`);
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setError('Unable to perform search. Please try again.');
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <section className="flex flex-col w-full mx-auto py-7 justify-center bg-white">
        <p className="text-center">
          Discover the hidden gems of NYC with personalized recommendations. Start exploring today →
        </p>
      </section>
      
      <Search onSearch={handleSearch} isLoading={isLoading} />

      {error && (
        <div className="w-full max-w-[900px] mx-auto mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      <div className="flex flex-col w-full mx-auto justify-center pt-20 pb-16 font-semibold leading-6 tracking-tight max-w-[900px]">
        <h1 className="text-5xl max-w-3xl">
          Octave.
          <span className="ml-4 text-gray-500">
            Get your personalized NYC now.
          </span>
        </h1>
      </div>
      
      <section className="flex flex-col w-full mx-auto py-8 max-w-[900px]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-6">Locations Database</h2>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p className="text-gray-500">Searching restaurants...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((restaurant, index) => (
                <div 
                  key={index} 
                  className="bg-gray-100 p-4 rounded-lg shadow-sm"
                >
                  <h3 className="font-semibold">{restaurant.name}</h3>
                  <p className="text-sm text-gray-600">
                    {restaurant.categories.map(cat => cat.title).join(', ')}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-yellow-500">★ {restaurant.rating}</span>
                    <a 
                      href={restaurant.yelp_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-500 text-sm hover:underline"
                    >
                      View on Yelp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-lg text-gray-500">Search for restaurants in NYC</p>
              <p className="mt-2 text-sm text-gray-400">Start typing to find your next meal</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}