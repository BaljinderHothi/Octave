/*
this is for the search feature for finding the restaurants and returning it to the homepage UI
the features this can do are:
- allow users to search restaurants by name, cuisine, or neighborhood
- provide real-time search results
- integrate with backend database search
what we need to add next is:
- implement backend search API endpoint
- connect to the mongodb cluster or db whatever its called
- add error handling and loading states
- Implement advanced search filtering logic if needed down the line past MVP
*/
import React, { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';

interface SearchProps {
  onSearch: (query: string) => void;
  isLoading?: boolean;
}

export const Search: React.FC<SearchProps> = ({ onSearch, isLoading = false }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  return (
    <div className="w-full max-w-[900px] mx-auto mb-8">
      <form onSubmit={handleSubmit} className="relative">
        <input
          type="text"
          placeholder="Search for restaurants by cuisine, name, or neighborhood"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
          disabled={isLoading || searchQuery.trim() === ''}
        >
          {isLoading ? (
            <span className="animate-spin">🔄</span>
          ) : (
            <SearchIcon size={24} />
          )}
        </button>
      </form>
    </div>
  );
};