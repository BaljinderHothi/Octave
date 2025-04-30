import React, { useState, useRef, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onSearch, 
  placeholder = "Search for activities, restaurants, and more..." 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); //it waits for the animation to complete itself
    }
  };

  //handles the clicks outside to collapse the search bar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExpanded]);

  return (
    <div 
      ref={searchContainerRef}
      className={`transition-all duration-300 ease-in-out flex items-center rounded-full border border-gray-300 bg-white shadow-sm ${
        isExpanded ? 'w-full md:w-96' : 'w-10 md:w-12 cursor-pointer'
      }`}
      onClick={() => !isExpanded && toggleExpand()}
    >
      <div className="flex items-center justify-center p-2">
        <Search 
          size={20} 
          className="text-gray-500" 
          onClick={() => isExpanded && handleSearch()}
        />
      </div>
      
      <input
        ref={inputRef}
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`${
          isExpanded ? 'w-full opacity-100' : 'w-0 opacity-0'
        } transition-all duration-300 ease-in-out outline-none text-gray-700 bg-transparent`}
        aria-label="Search"
      />
      
      {isExpanded && searchQuery && (
        <button
          onClick={handleSearch}
          className="px-3 py-1 mr-2 bg-blue-600 text-white text-sm rounded-full hover:bg-blue-700 transition-colors"
        >
          Search
        </button>
      )}
    </div>
  );
};

export default SearchBar;