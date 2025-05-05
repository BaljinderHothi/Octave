//Rendering the homepage on _closed.tsx 
//once we figure out the routing situation then we can just render on index.tsx

//homepage shows recommendations based on user preferences from when they first signed up
//updates as they continue to put in more reviews -> gets fed into the model

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Recommendation } from '../types/Recommendation';
import { getRecommendations, wakeupRenderService } from '../services/recommendationService';
import { searchRecommendations } from '../services/searchService';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SearchBar from '../components/SearchBar';

export default function Closed() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTime, setLoadingTime] = useState<number>(0);
  const [loadingStartTime, setLoadingStartTime] = useState<number>(Date.now());
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [implicitCategories, setImplicitCategories] = useState<string[]>([]);
  const [additionalPreferences, setAdditionalPreferences] = useState<string[]>([]);
  const [isSearchResults, setIsSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'down'>('connected');
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('');
  const [refreshCount, setRefreshCount] = useState<number>(0);

  //show new recommendations every 2 refreshes
  useEffect(() => {
    const count = parseInt(localStorage.getItem('refreshCount') || '0');
    const newCount = count + 1;
    if (newCount >= 2) {
      localStorage.setItem('refreshCount', '0');
      localStorage.removeItem('storedRecommendations');
      setRefreshCount(0);
    } else {
      localStorage.setItem('refreshCount', newCount.toString());
      setRefreshCount(newCount);
    }
  }, []);

  //fetch random but still top recommendations for the refresh
  const getRandomItems = (array: any[], n: number) => {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, n);
  };

  const processRecommendations = (recs: Recommendation[]) => {
    const storedRecsString = localStorage.getItem('storedRecommendations');
    if (storedRecsString && refreshCount < 2) {
      return JSON.parse(storedRecsString);
    }
    const groupedRecs = recs.reduce((acc: { [key: string]: Recommendation[] }, rec) => {
      const category = rec.category_match || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(rec);
      return acc;
    }, {});

    //for each category, we'll display 6 random recommendations from the top scored ones
    const processedGroupedRecs = Object.entries(groupedRecs).reduce((acc: { [key: string]: Recommendation[] }, [category, categoryRecs]) => {
      //sort recommendations by score from highest to lowest
      const sortedRecs = categoryRecs.sort((a, b) => (b.score || 0) - (a.score || 0));
      //take top 20 recommendations and then randomly select 6 from those
      const topRecs = sortedRecs.slice(0, Math.min(20, sortedRecs.length));
      acc[category] = getRandomItems(topRecs, 6);
      return acc;
    }, {});

    const processedRecs = Object.entries(processedGroupedRecs).flatMap(([category, recs]) => 
      recs.sort((a, b) => (b.score || 0) - (a.score || 0))
        .map(rec => ({
          ...rec,
          category_match: category
        }))
    );

    localStorage.setItem('storedRecommendations', JSON.stringify(processedRecs));
    return processedRecs;
  };

  //stopwatch for loading screen
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (loading) {
      interval = setInterval(() => {
        setLoadingTime((Date.now() - loadingStartTime) / 1000);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
      if (!loading) {
        setLoadingTime((Date.now() - loadingStartTime) / 1000);
      }
    };
  }, [loading, loadingStartTime]);

  useEffect(() => {
    //debugging
    console.log('=== Authentication Debug ===');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
    setLoadingStartTime(Date.now());
    setLoadingTime(0);

    console.log('Token:', token ? 'exists' : 'missing');
    console.log('Token value:', token);
    console.log('UserId:', userId ? 'exists' : 'missing');
    console.log('UserId value:', userId);
    
    if (!token || !userId) {
      console.log('Not authenticated - missing token or userId');
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    //fetch user data and recommendations
    async function fetchUserData() {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user preferences');
        }
        
        const userData = await response.json();
        console.log('User data received:', userData);

        const preferences = userData.data.preferences;
        
        const allPreferences = [
          ...(preferences?.food || []),
          ...(preferences?.activities || []),
          ...(preferences?.places || []),
          ...(preferences?.custom || [])
        ];
        
        const implicitCategories = preferences?.implicitCategories || [];
        const additionalPrefs = preferences?.additionalPreferences || [];
        console.log('Implicit categories:', implicitCategories);
        console.log('Additional preferences:', additionalPrefs);
        console.log('Combined preferences:', [...allPreferences, ...implicitCategories, ...additionalPrefs]);
        
        setUserPreferences([...allPreferences, ...implicitCategories, ...additionalPrefs]);
        setImplicitCategories(implicitCategories);
        setAdditionalPreferences(additionalPrefs);

        const userId = localStorage.getItem('userId');
        if (userId) {
          console.log('Fetching recommendations with preferences:', allPreferences);
          console.log('Including implicit categories:', implicitCategories);
          console.log('Including additional preferences:', additionalPrefs);
          const recs = await getRecommendations(userId, {
            food: preferences?.food || [],
            activities: preferences?.activities || [],
            places: preferences?.places || [],
            custom: preferences?.custom || [],
            implicitCategories: implicitCategories,
            additionalPreferences: additionalPrefs
          });
          
          if (!recs || recs.length === 0) {
            console.log('No recommendations received');
            setRecommendations([]);
            return;
          }

          console.log('Received recommendations:', recs);
          
          const processedRecs = processRecommendations(recs);
          setRecommendations(processedRecs);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load recommendations. Please try again later.');
        
        if (err instanceof Error && 
            (err.message.includes('API is not healthy') || 
             err.message.includes('Failed to fetch'))) {
          setApiStatus('down');
          setApiStatusMessage('The recommendation service is currently unavailable, might be in sleep mode');
        }
      } finally {
        setLoading(false);
      }
    }

    //test API call for validating token
    async function verifyAuth() {
      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          console.log('Token verification failed:', response.status);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
          setIsAuthenticated(false);
          return;
        }

        console.log('Token verified successfully');
        setIsAuthenticated(true);
        await fetchUserData();
      } catch (err) {
        console.error('Error verifying authentication:', err);
        setError('Failed to verify authentication. Please try again later.');
        setLoading(false);
      }
    }

    verifyAuth();
  }, [router]);

  //search functionality itself
  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    try {
      setSearching(true);
      setSearchQuery(query);
      setIsSearchResults(true);
      
      const searchResults = await searchRecommendations(query);
      
      if (searchResults.length === 0) {
        setError('No results found for your search.');
        setRecommendations([]);
      } else {
        setError(null);
        setRecommendations(searchResults);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search. Please try again later.');
    } finally {
      setSearching(false);
    }
  };

  //clear the results and return to recommendations
  const clearSearch = () => {
    setIsSearchResults(false);
    setSearchQuery('');
    
    //reload original recommendations
    const userId = localStorage.getItem('userId');
    if (userId) {
      setLoading(true);
      getRecommendations(userId, {
        food: userPreferences.filter(p => p.startsWith('food:')),
        activities: userPreferences.filter(p => p.startsWith('activity:')),
        places: userPreferences.filter(p => p.startsWith('place:')),
        custom: userPreferences.filter(p => !p.includes(':')),
        implicitCategories: implicitCategories,
        additionalPreferences: additionalPreferences
      }).then(recs => {
        setRecommendations(recs);
        setLoading(false);
      }).catch(err => {
        console.error('Error reloading recommendations:', err);
        setError('Failed to reload recommendations.');
        setLoading(false);
      });
    }
  };

  //function to handle API reconnection attempts
  const handleReconnectApi = async () => {
    setApiStatus('connecting');
    setApiStatusMessage('Attempting to wake up the recommendation service:');
    
    const success = await wakeupRenderService();
    
    if (success) {
      setApiStatusMessage('Wake-up signal sent');
      setTimeout(() => {
        setApiStatus('connected');
        clearSearch();
      }, 5000);
    } else {
      setApiStatus('down');
      setApiStatusMessage('Unable to connect to the recommendation service. Please try again later.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center">
        <LoadingSpinner />
        <p className="mt-4 text-gray-600 text-center max-w-md px-4">
          Our model is working hard to give you personalized recommendations - if they don't load properly the first time around, refresh the page after it has loaded for 60 seconds. Thank you for your patience!
        </p>
        <p className="mt-2 text-sm text-gray-500">
          Loading time: {loadingTime.toFixed(1)} seconds
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen">
        <div className="">
          <div className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                <span className="block">Welcome to</span>
                <span className="block text-pink-500">OCTAVE</span>
              </h1>
              <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
                Discover personalized recommendations for activities, restaurants, and more in New York City.
              </p>
              <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
                <div className="rounded-md shadow">
                  <button
                    onClick={() => router.push('/login')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-black hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                  >
                    Login
                  </button>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <button
                    onClick={() => router.push('/signup')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Personalized Recommendations</h3>
                <p className="mt-2 text-gray-600">Get tailored suggestions based on your interests and preferences</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">Local Discoveries</h3>
                <p className="mt-2 text-gray-600">Explore the best of NYC's restaurants, activities, and attractions</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900">User Reviews</h3>
                <p className="mt-2 text-gray-600">Read authentic reviews from fellow explorers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  //group recommendations by category
  const groupedRecommendations = recommendations.reduce((groups: { [key: string]: Recommendation[] }, rec) => {
    const category = rec.category_match || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(rec);
    return groups;
  }, {});

  //separate implicit categories recommendations for special highlighting
  const implicitCategoryRecommendations = Object.entries(groupedRecommendations)
    .filter(([category]) => recommendations.some(rec => rec.category_match === category && rec.from_implicit))
    .reduce((result: { [key: string]: Recommendation[] }, [category, recs]) => {
      result[category] = recs.filter(rec => rec.from_implicit);
      return result;
    }, {});

  //additional preferences recommendations
  const additionalPreferenceRecommendations = Object.entries(groupedRecommendations)
    .filter(([category]) => recommendations.some(rec => rec.category_match === category && rec.from_additional))
    .reduce((result: { [key: string]: Recommendation[] }, [category, recs]) => {
      result[category] = recs.filter(rec => rec.from_additional);
      return result;
    }, {});

  //explicit preferences recommendations (exclude implicit categories and additional preferences to avoid duplication)
  const explicitCategoryRecommendations = Object.entries(groupedRecommendations)
    .filter(([category]) => 
      (!Object.keys(implicitCategoryRecommendations).includes(category) && 
       !Object.keys(additionalPreferenceRecommendations).includes(category)) || 
      recommendations.some(rec => rec.category_match === category && !rec.from_implicit && !rec.from_additional)
    )
    .reduce((result: { [key: string]: Recommendation[] }, [category, recs]) => {
      if (!Object.keys(implicitCategoryRecommendations).includes(category) && 
          !Object.keys(additionalPreferenceRecommendations).includes(category)) {
        result[category] = recs;
      } else {
        result[category] = recs.filter(rec => !rec.from_implicit && !rec.from_additional);
      }
      return result;
    }, {});

  //functions to do pagination for the recommendations
  const handleNextPage = (category: string) => {
    const itemsPerPage = isSearchResults ? 4 : 3; // Same value as in the render section
    setCurrentPage(prev => ({
      ...prev,
      [category]: Math.min(
        (prev[category] || 0) + 1, 
        Math.floor((groupedRecommendations[category]?.length - 1) / itemsPerPage)
      )
    }));
  };
  
  const handlePrevPage = (category: string) => {
    setCurrentPage(prev => ({
      ...prev,
      [category]: Math.max((prev[category] || 0) - 1, 0)
    }));
  };

  if (error) {
    return (
      <div className="text-red-600 text-center p-4 bg-white rounded-lg shadow">
        <p>{error}</p>
        <p className="mt-2 text-sm text-gray-500">
          Time elapsed: {loadingTime.toFixed(1)} seconds
        </p>
        {isSearchResults && (
          <button 
            onClick={clearSearch}
            className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
          >
            Back to recommendations
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center">
            <h1 className="text-3xl font-bold">{isSearchResults ? 'Search Results' : 'Your Recommendations'}</h1>
            <div className="relative ml-2 group">
              <div className="cursor-help">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div className="absolute left-0 w-72 p-2 bg-black text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
                The recommendation score is calculated with the average rating and how popular the business is on Google Maps, and how similar the category of the business is to your preferences.
              </div>
            </div>
          </div>
          <div className="w-full md:w-auto">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        
        {searching && (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        )}
        
        {isSearchResults && !searching && (
          <div className="mb-6 flex items-center">
            <span className="text-gray-600">Results for: <span className="font-medium">{searchQuery}</span></span>
            <button 
              onClick={clearSearch}
              className="ml-4 text-blue-600 hover:text-blue-800 text-sm underline"
            >
              Back to recommendations
            </button>
          </div>
        )}
        
        {error ? (
          <div className="text-red-600 text-center p-4 bg-white rounded-lg shadow">
            <p>{error}</p>
            {isSearchResults && (
              <button 
                onClick={clearSearch}
                className="mt-4 text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Back to recommendations
              </button>
            )}
          </div>
        ) : Object.keys(groupedRecommendations).length === 0 ? (
          <div className="text-center p-8 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">
              {isSearchResults ? 'No results found for your search.' : 'No recommendations found. Try updating your preferences.'}
            </p>
            {isSearchResults ? (
              <button
                onClick={clearSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Back to recommendations
              </button>
            ) : (
              <button
                onClick={() => router.push('/userpreference')}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update Preferences
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-12">

{/* Additional preferences recommendations */}
            {Object.keys(additionalPreferenceRecommendations).length > 0 && (
              <>
                {Object.entries(additionalPreferenceRecommendations).map(([category, recs]) => {
                  const pageIndex = currentPage[category] || 0;
                  const itemsPerPage = isSearchResults ? 4 : 3;
                  const totalPages = Math.ceil(recs.length / itemsPerPage);
                  const displayedRecs = recs.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage);

                  return (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-semibold text-gray-800">
                            {`Because you loved ${category}...`}
                          </h2>
                          {!isSearchResults && (
                            <div className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                              Based on your recent positive reviews
                            </div>
                          )}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePrevPage(category)}
                              disabled={pageIndex === 0}
                              className={`p-2 rounded-full ${
                                pageIndex === 0 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {pageIndex + 1} of {totalPages}
                            </span>
                            <button
                              onClick={() => handleNextPage(category)}
                              disabled={pageIndex >= totalPages - 1}
                              className={`p-2 rounded-full ${
                                pageIndex >= totalPages - 1
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={`grid ${isSearchResults ? 'grid-cols-1 md:grid-cols-4 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                        {displayedRecs.map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

{/* Explicit/checkbox preferences recs */}
{Object.keys(explicitCategoryRecommendations).length > 0 && (
              <>
                {Object.entries(explicitCategoryRecommendations).map(([category, recs]) => {
                  const pageIndex = currentPage[category] || 0;
                  const itemsPerPage = isSearchResults ? 4 : 3; 
                  const totalPages = Math.ceil(recs.length / itemsPerPage);
                  const displayedRecs = recs.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage);

                  return (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-semibold text-gray-800">
                            {isSearchResults 
                              ? `${category} Recommendations` 
                              : `Because you liked ${category}...`}
                          </h2>
                          {!isSearchResults && (
                            <div className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                              Based on your explicit preferences
                            </div>
                          )}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePrevPage(category)}
                              disabled={pageIndex === 0}
                              className={`p-2 rounded-full ${
                                pageIndex === 0 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {pageIndex + 1} of {totalPages}
                            </span>
                            <button
                              onClick={() => handleNextPage(category)}
                              disabled={pageIndex >= totalPages - 1}
                              className={`p-2 rounded-full ${
                                pageIndex >= totalPages - 1
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={`grid ${isSearchResults ? 'grid-cols-1 md:grid-cols-4 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                        {displayedRecs.map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}

{/* Implicit categories from Tell Us More recommendations */}
            {Object.keys(implicitCategoryRecommendations).length > 0 && (
              <>
                {Object.entries(implicitCategoryRecommendations).map(([category, recs]) => {
                  const pageIndex = currentPage[category] || 0;
                  const itemsPerPage = isSearchResults ? 4 : 3;
                  const totalPages = Math.ceil(recs.length / itemsPerPage);
                  const displayedRecs = recs.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage);

                  return (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <h2 className="text-2xl font-semibold text-gray-800">
                            {`Because we noticed you like ${category}...`}
                          </h2>
                          {!isSearchResults && (
                            <div className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                              Based on your detected preferences
                            </div>
                          )}
                        </div>
                        {totalPages > 1 && (
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => handlePrevPage(category)}
                              disabled={pageIndex === 0}
                              className={`p-2 rounded-full ${
                                pageIndex === 0 
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronLeft className="h-6 w-6" />
                            </button>
                            <span className="text-sm text-gray-600">
                              {pageIndex + 1} of {totalPages}
                            </span>
                            <button
                              onClick={() => handleNextPage(category)}
                              disabled={pageIndex >= totalPages - 1}
                              className={`p-2 rounded-full ${
                                pageIndex >= totalPages - 1
                                  ? 'text-gray-400 cursor-not-allowed' 
                                  : 'text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              <ChevronRight className="h-6 w-6" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className={`grid ${isSearchResults ? 'grid-cols-1 md:grid-cols-4 gap-4' : 'grid-cols-1 md:grid-cols-3 gap-6'}`}>
                        {displayedRecs.map((rec) => (
                          <RecommendationCard key={rec.id} recommendation={rec} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
        


        {apiStatus !== 'connected' && (
          <div className="w-full px-4 py-3 mb-6 rounded-lg bg-amber-50 border border-amber-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-amber-800">
                  {apiStatus === 'connecting' ? 'Connecting to API...' : 'API Connection Issue'}
                </h3>
                <p className="text-sm text-amber-700">{apiStatusMessage}</p>
              </div>
              {apiStatus === 'down' && (
                <button
                  onClick={handleReconnectApi}
                  className="px-3 py-1.5 text-sm font-medium text-white bg-amber-600 rounded hover:bg-amber-700"
                >
                  Wake Up API
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}