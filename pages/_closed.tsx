//Rendering the homepage on _closed.tsx 
//once we figure out the routing situation then we can just render on index.tsx

//homepage shows recommendations based on user preferences from when they first signed up
//updates as they continue to put in more reviews -> gets fed into the model

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { ChevronLeft, ChevronRight, RefreshCw, HelpCircle, Lightbulb, Globe, MessageSquare } from 'lucide-react';
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
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);
  const [isSearchResults, setIsSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState<{ [key: string]: number }>({});
  const [apiStatus, setApiStatus] = useState<'connected' | 'connecting' | 'down'>('connected');
  const [apiStatusMessage, setApiStatusMessage] = useState<string>('');
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    //debugging
    console.log('=== Authentication Debug ===');
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    
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

        //first get user preferences
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
        
        localStorage.setItem('userData', JSON.stringify(userData));

        //extract preferences from the correct path in the response
        const preferences = userData.data.preferences;
        const additionalPreferences = preferences?.additionalPreferences || [];
        const implicitCategories = preferences?.implicitCategories || [];
        
        //combine all preferences into a single array
        const allPreferences = [
          ...(preferences?.food || []),
          ...(preferences?.activities || []),
          ...(preferences?.places || []),
          ...(preferences?.custom || []),
          ...additionalPreferences,
          ...implicitCategories
        ];
        
        console.log('Combined preferences:', allPreferences);
        console.log('Additional preferences:', additionalPreferences);
        console.log('Implicit categories:', implicitCategories);
        setUserPreferences(allPreferences);

        //get recommendations based on those preferences
        if (userId) {
          console.log('Fetching recommendations with preferences:', allPreferences);
          const recs = await getRecommendations(userId, {
            food: preferences?.food || [],
            activities: preferences?.activities || [],
            places: preferences?.places || [],
            custom: preferences?.custom || [],
            additionalPreferences: additionalPreferences,
            implicitCategories: implicitCategories
          });
          
          if (!recs || recs.length === 0) {
            console.log('No recommendations received');
            setRecommendations([]);
            return;
          }

          console.log('Received recommendations:', recs);
          setRecommendations(recs);
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
  }, [router, refreshCount]);

  const handleRefresh = () => {
    setRefreshCount(prev => prev + 1);
  };

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
      const userData = JSON.parse(localStorage.getItem('userData') || '{}');
      const preferences = userData?.data?.preferences || {};
      
      getRecommendations(userId, {
        food: userPreferences.filter(p => p.startsWith('food:')),
        activities: userPreferences.filter(p => p.startsWith('activity:')),
        places: userPreferences.filter(p => p.startsWith('place:')),
        custom: userPreferences.filter(p => !p.includes(':')),
        additionalPreferences: userPreferences.filter(p => p.startsWith('additional:')),
        implicitCategories: preferences.implicitCategories || []
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
      <div className="min-h-screen flex flex-col justify-center items-center gap-4">
        <LoadingSpinner />
        <p className="text-gray-600 text-center max-w-md px-4">
          Our model is working hard to give you personalized recommendations - if they don't load properly the first time around, refresh the page after it has loaded for 60 seconds. Thank you for your patience!
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

        <div className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">Experience NYC in a Whole New Way</h2>
              <p className="mt-4 text-lg text-gray-600">Discover places that match your interests and preferences</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform transition duration-500 hover:scale-105">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-pink-100 text-pink-600 mb-4">
                  <Lightbulb className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Personalized Recommendations</h3>
                <p className="mt-3 text-gray-600">Get tailored suggestions based on your interests and preferences that evolve as you use the app</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform transition duration-500 hover:scale-105">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-blue-100 text-blue-600 mb-4">
                  <Globe className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Local Discoveries</h3>
                <p className="mt-3 text-gray-600">Explore the best of NYC's restaurants, activities, and attractions curated just for you</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-md text-center transform transition duration-500 hover:scale-105">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-4">
                  <MessageSquare className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">User Reviews</h3>
                <p className="mt-3 text-gray-600">Read authentic reviews from fellow explorers and share your own experiences</p>
              </div>
            </div>
          </div>
        </div>
        <div className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-extrabold text-gray-900">How OCTAVE Works</h2>
              <p className="mt-4 text-lg text-gray-600">Three simple steps to your perfect NYC experience</p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pink-500 text-white text-xl font-bold mb-4">1</div>
                <h3 className="text-xl font-semibold text-gray-900">Create Your Profile</h3>
                <p className="mt-2 text-gray-600">Tell us about your preferences and interests</p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pink-500 text-white text-xl font-bold mb-4">2</div>
                <h3 className="text-xl font-semibold text-gray-900">Get Recommendations</h3>
                <p className="mt-2 text-gray-600">Receive personalized suggestions based on your profile</p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-pink-500 text-white text-xl font-bold mb-4">3</div>
                <h3 className="text-xl font-semibold text-gray-900">Plan Your Adventure</h3>
                <p className="mt-2 text-gray-600">Create itineraries and explore NYC like never before</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-pink-500 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-extrabold text-white">Ready to explore NYC?</h2>
              <p className="mt-4 text-xl text-pink-100">Join OCTAVE today and discover your perfect New York experience</p>
              <div className="mt-8">
                <button
                  onClick={() => router.push('/signup')}
                  className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-pink-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-all"
                >
                  Get Started
                </button>
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
    //get additional preferences from user data
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    const additionalPrefs = userData?.data?.preferences?.additionalPreferences || [];
    const implicitPrefs = userData?.data?.preferences?.implicitCategories || [];
    const explicitPrefs = [
      ...(userData?.data?.preferences?.food || []),
      ...(userData?.data?.preferences?.activities || []),
      ...(userData?.data?.preferences?.places || []),
      ...(userData?.data?.preferences?.custom || [])
    ];
    
    const isAdditionalPreference = additionalPrefs.some((pref: string) => 
      category.toLowerCase() === pref.toLowerCase()
    );

    const isImplicitPreference = implicitPrefs.some((pref: string) => 
      category.toLowerCase() === pref.toLowerCase()
    );
    
    //if the category exists in both explicit and additional preferences,
    //use the recommendation's source to determine which group it belongs to
    const isExplicitPreference = explicitPrefs.some((pref: string) => 
      category.toLowerCase() === pref.toLowerCase()
    );
    
    let groupKey = category;
    if (isAdditionalPreference && !isExplicitPreference) {
      groupKey = `${category} (Additional)`;
    } else if (isImplicitPreference && !isExplicitPreference && !isAdditionalPreference) {
      groupKey = `${category} (Implicit)`;
    } else if ((isAdditionalPreference || isImplicitPreference) && isExplicitPreference) {
      //if it's in both, check if this specific recommendation came from additional preferences
      const isFromAdditional = rec.isAdditionalPreference;
      const isFromImplicit = rec.isImplicitPreference;
      if (isFromAdditional) {
        groupKey = `${category} (Additional)`;
      } else if (isFromImplicit) {
        groupKey = `${category} (Implicit)`;
      }
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(rec);
    return groups;
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

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold">{isSearchResults ? 'Search Results' : 'Your Recommendations'}</h1>
            {!isSearchResults && (
              <div className="group relative">
                <HelpCircle size={20} className="text-gray-400 hover:text-gray-600 cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 w-72 p-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                  The recommendation score is how likely we think you'll enjoy this business - it is calculated considering the overall rating of the business, how popular it is on Google, and how similar it is to your preferences.
                  <div className="absolute left-1/2 -translate-x-1/2 -top-1 w-2 h-2 bg-gray-900 rotate-45"></div>
                </div>
              </div>
            )}
          </div>
          <div className="w-full md:w-auto flex items-center gap-4">
            <SearchBar onSearch={handleSearch} />
            {!isSearchResults && (
              <button
                onClick={handleRefresh}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <RefreshCw size={18} />
                <span>Refresh</span>
              </button>
            )}
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
{/* pagination for recommendations */}
            {Object.entries(groupedRecommendations)
              .sort(([categoryA], [categoryB]) => {
                //sort additional and implicit preferences first
                const isAdditionalA = categoryA.includes('(Additional)');
                const isAdditionalB = categoryB.includes('(Additional)');
                const isImplicitA = categoryA.includes('(Implicit)');
                const isImplicitB = categoryB.includes('(Implicit)');
                
                if (isAdditionalA && !isAdditionalB) return -1;
                if (!isAdditionalA && isAdditionalB) return 1;
                if (isImplicitA && !isImplicitB) return -1;
                if (!isImplicitA && isImplicitB) return 1;
                return 0;
              })
              .map(([category, recs]) => {
              const pageIndex = currentPage[category] || 0;
              const itemsPerPage = isSearchResults ? 4 : 3; 
              const totalPages = Math.ceil(recs.length / itemsPerPage);
              const displayedRecs = recs.slice(pageIndex * itemsPerPage, pageIndex * itemsPerPage + itemsPerPage);

              return (
                <div key={category} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-semibold text-gray-800">
                        {isSearchResults 
                          ? `${category} Recommendations` 
                          : category.includes('(Additional)')
                            ? `Because you recently reviewed a/an ${category.replace(' (Additional)', '')} business positively...`
                            : category.includes('(Implicit)')
                              ? `We thought you might like these ${category.replace(' (Implicit)', '')} businesses...`
                              : `Because you said you like ${category}...`}
                      </h2>
                      {!isSearchResults && (
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          category.includes('(Additional)')
                            ? 'bg-blue-100 text-blue-800'
                            : category.includes('(Implicit)')
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-green-100 text-green-800'
                        }`}>
                          {category.includes('(Additional)')
                            ? 'Based on your recent positive reviews'
                            : category.includes('(Implicit)')
                              ? 'Based on your preferences analysis'
                              : 'Based on your explicit preferences'}
                        </span>
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
      
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => router.push('/itinerary')}
          className="bg-pink-500 hover:bg-pink-600 text-white rounded-full py-4 px-6 shadow-xl flex items-center gap-3 transition-all hover:scale-105 text-lg font-medium"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"></path>
          </svg>
          <span>Create Itinerary</span>
        </button>
      </div>
    </div>
  );
}