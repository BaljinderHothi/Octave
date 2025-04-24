//Rendering the homepage on _closed.tsx 
//once we figure out the routing situation then we can just render on index.tsx

//homepage shows recommendations based on user preferences from when they first signed up
//updates as they continue to put in more reviews -> gets fed into the model

import React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Recommendation } from '../types/Recommendation';
import { getRecommendations } from '../services/recommendationService';
import RecommendationCard from '../components/RecommendationCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Closed() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userPreferences, setUserPreferences] = useState<string[]>([]);

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

        //extract preferences from the correct path in the response
        const preferences = userData.data.preferences;
        
        //combine all preferences into a single array
        const allPreferences = [
          ...(preferences?.food || []),
          ...(preferences?.activities || []),
          ...(preferences?.places || []),
          ...(preferences?.custom || [])
        ];
        
        console.log('Combined preferences:', allPreferences);
        setUserPreferences(allPreferences);

        //get recommendations based on those preferences
        if (userId) {
          console.log('Fetching recommendations with preferences:', allPreferences);
          const recs = await getRecommendations(userId, {
            food: preferences?.food || [],
            activities: preferences?.activities || [],
            places: preferences?.places || [],
            custom: preferences?.custom || []
          });
          
          if (!recs || recs.length === 0) {
            console.log('No recommendations received');
            setRecommendations([]);
            return;
          }

          console.log('Received recommendations:', recs);
          
          //group recommendations by category
          const groupedRecs = recs.reduce((acc: { [key: string]: Recommendation[] }, rec) => {
            const category = rec.category_match || 'Other';
            if (!acc[category]) {
              acc[category] = [];
            }
            acc[category].push(rec);
            return acc;
          }, {});

          //flatten grouped recommendations back into an array
          const organizedRecs = Object.entries(groupedRecs).flatMap(([category, recs]) => 
            recs.map(rec => ({
              ...rec,
              category_match: category
            }))
          );

          console.log('Organized recommendations:', organizedRecs);
          setRecommendations(organizedRecs);
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load recommendations. Please try again later.');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex justify-center items-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="bg-white">
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
                    onClick={() => router.push('/register')}
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-black bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-100 py-12">
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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Recommendations</h1>
        
        {error ? (
          <div className="text-red-600 text-center">{error}</div>
        ) : Object.keys(groupedRecommendations).length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              No recommendations found. Try updating your preferences.
            </p>
            <button
              onClick={() => router.push('/userpreference')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Update Preferences
            </button>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(groupedRecommendations).map(([category, recs]) => (
              <div key={category} className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-800">
                  Because you liked {category}...
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recs.map((rec) => (
                    <RecommendationCard key={rec.id} recommendation={rec} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}