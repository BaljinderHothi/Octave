//this file handles all the recommendation-related API calls between Nextjs
//and the deployed backend on Render (using Flask)

import { Recommendation, RecommendationResponse } from '../types/Recommendation';

const RENDER_API_URL = 'https://octavemodel.onrender.com';

interface UserPreferences {
  food?: string[];
  activities?: string[];
  places?: string[];
  custom?: string[];
}

export async function getRecommendations(userId: string, preferences?: string[] | UserPreferences): Promise<Recommendation[]> {
  const token = localStorage.getItem('token');
  
  try {
    let combinedPreferences: string[] = [];
    
    //preferences is an object (UserPreferences) -> combine all categories
    if (preferences && !Array.isArray(preferences)) {
      const userPrefs = preferences as UserPreferences;
      if (Array.isArray(userPrefs.food)) combinedPreferences.push(...userPrefs.food);
      if (Array.isArray(userPrefs.activities)) combinedPreferences.push(...userPrefs.activities);
      if (Array.isArray(userPrefs.places)) combinedPreferences.push(...userPrefs.places);
      if (Array.isArray(userPrefs.custom)) combinedPreferences.push(...userPrefs.custom);
    } else if (Array.isArray(preferences)) {
      combinedPreferences = preferences;
    }

    console.log('=== RECOMMENDATION REQUEST DEBUG ===');
    console.log('Request Parameters:', {
      userId,
      preferences: combinedPreferences,
      hasToken: !!token,
      apiUrl: RENDER_API_URL
    });

    const requestBody = {
      user_id: userId,
      preferences: combinedPreferences,
      top_n: 6
    };
    
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${RENDER_API_URL}/api/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Origin': window.location.origin
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });

    console.log('Response Status:', response.status);
    
    if (!response.ok) {
      console.error('API response bad:', response.status);
      const errorText = await response.text();
      console.error('Error response:', errorText);
      throw new Error('Failed to fetch recommendations');
    }

    const data = await response.json();
    console.log('=== RECOMMENDATION RESPONSE DEBUG ===');
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    console.log('Number of recommendations:', data.data?.length || 0);
    console.log('Categories shown:', 
      Array.from(new Set(data.data?.map((rec: any) => rec.category_match) || []))
    );

    if (!data.success) {
      console.error('API returned error:', data.message);
      throw new Error(data.message || 'Failed to get recommendations');
    }

    return data.data || [];
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    throw error;
  }
}

export async function getHealthCheck(): Promise<boolean> {
  try {
    const response = await fetch(`${RENDER_API_URL}/api/health`);
    const data = await response.json();
    return data.status === 'healthy' && data.recommender_initialized;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
} 
