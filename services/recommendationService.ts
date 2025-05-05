//this file handles all the recommendation-related API calls between Nextjs
//and the deployed backend on Render (using Flask)

import { Recommendation, RecommendationResponse } from '../types/Recommendation';

// const RENDER_API_URL = 'https://octavemodel.onrender.com';
// const RENDER_API_URL = 'http://127.0.0.1:5000'; //this is the local new model
const RENDER_API_URL = 'https://octavefinalhybrid.onrender.com';

interface UserPreferences {
  food?: string[];
  activities?: string[];
  places?: string[];
  custom?: string[];
}

export async function getRecommendations(userId: string, preferences?: string[] | UserPreferences): Promise<Recommendation[]> {
  const token = localStorage.getItem('token');
  
  try {
    //api health check
    const isHealthy = await getHealthCheck();
    if (!isHealthy) {
      console.error('Recommendation API is not healthy!!!!');
      //direct API test as a last resort
      const isConnected = await checkApiConnectivity();
      if (isConnected) {
        console.log('API connectivity test passed but failed health check.');
      } else {
        console.error('API connectivity test ALSO failed. Waking up the service:');
        
        const wakeupSuccessful = await wakeupRenderService();
        
        if (wakeupSuccessful) {
          console.log('Wake-up attempt was partially successful, service might need more time to fully initialize.');
        } else {
          console.error('Wake-up attempt failed, unable to connect to recommendation service.');
        }
        
        return generateFallbackRecommendations(preferences);
      }
    }
    
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
      userId: userId,
      preferences: combinedPreferences
    };
    
    console.log('Request Body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${RENDER_API_URL}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json'
      },
      credentials: 'omit',
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

    let data;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Invalid response format from recommendations API');
    }
    
    console.log('=== RECOMMENDATION RESPONSE DEBUG ===');
    console.log('Raw API response:', JSON.stringify(data, null, 2));
    
    if (!data || !Array.isArray(data)) {
      console.error('API returned invalid data format');
      throw new Error('Invalid data format from recommendations API');
    }
    
    const recommendations = data;
    
    console.log('Number of recommendations:', recommendations.length);
    console.log('Categories shown:', 
      Array.from(new Set(recommendations.map((rec: any) => rec.matched_category || 'Unknown')))
    );
    
    //MAKE SURE each recommendation has the required fields
    const formattedRecommendations = recommendations.map((rec: any): Recommendation => ({
      id: rec.id || '',
      name: rec.name || 'Unknown Business',
      categories: rec.category_text ? [rec.category_text] : [],
      rating: typeof rec.rating === 'number' ? rec.rating : 0,
      location: rec.location?.address1 ? 
        `${rec.location.address1}, ${rec.location.city || 'New York'}, ${rec.location.state || 'NY'}` : 
        'New York',
      image_url: rec.image_url || '/placeholder-restaurant.jpg',
      category_match: rec.matched_category || 'Other',
      explanation: `Recommended ${rec.matched_category} restaurant with ${rec.rating}★ rating and ${rec.review_count} reviews`,
      score: typeof rec.score === 'number' ? rec.score : 0
    }));

    return formattedRecommendations;
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return generateFallbackRecommendations(preferences);
  }
}

export async function getHealthCheck(): Promise<boolean> {
  //retry logic for sleeping instances because it keeps sleeping..
  const maxRetries = 2;
  const retryDelay = 3000; 
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Health check attempt ${attempt + 1}/${maxRetries + 1}...`);
      
      const response = await fetch(`${RENDER_API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors',
        credentials: 'omit',
        signal: AbortSignal.timeout(5000), 
      });
      
      if (!response.ok) {
        console.warn(`Health check failed with status: ${response.status}`);
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay/1000} seconds...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          continue;
        }
        return false;
      }
      
      const data = await response.json();
      const isHealthy = data.status === 'healthy' && data.recommender_initialized;
      console.log(`Health check result: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      
      if (!isHealthy && attempt < maxRetries) {
        console.log(`API not fully initialized. Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      return isHealthy;
    } catch (error) {
      console.error(`Health check error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      
      if (attempt < maxRetries) {
        console.log(`Retrying in ${retryDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      } else {
        return false;
      }
    }
  }
  
  return false;
}

//testing for CORS and API connectivity before searching
//maybe can delete
export async function testCors(): Promise<{ success: boolean, message: string }> {
  try {
    const getResponse = await fetch(`${RENDER_API_URL}/api/cors-test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      mode: 'cors',
    });
    
    if (!getResponse.ok) {
      return { 
        success: false, 
        message: `GET request failed with status ${getResponse.status}: ${getResponse.statusText}` 
      };
    }
    
    const postResponse = await fetch(`${RENDER_API_URL}/api/cors-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'omit',
      mode: 'cors',
      body: JSON.stringify({ test: true })
    });
    
    if (!postResponse.ok) {
      return { 
        success: false, 
        message: `POST request failed with status ${postResponse.status}: ${postResponse.statusText}` 
      };
    }
    
    return { success: true, message: 'CORS test passed for both GET and POST requests' };
  } catch (error) {
    console.error('CORS test failed:', error);
    return { 
      success: false, 
      message: `CORS test failed with error: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

//check API connectivity
export async function checkApiConnectivity(): Promise<boolean> {
  
  try {

    console.log(`Testing API connectivity to ${RENDER_API_URL}/api/test...`);
    const testResponse = await fetch(`${RENDER_API_URL}/api/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: AbortSignal.timeout(5000)
    });
    
    if (testResponse.ok) {
      console.log('Basic API connectivity test passed');
      return true;
    }
    console.warn(`API test endpoint returned status: ${testResponse.status}`);
    console.log('Testing CORS configuration...');
    const corsResult = await testCors();
    
    if (corsResult.success) {
      console.log('CORS test passed, API might be partially available');
      return true;
    }
    
    console.error('All API connectivity tests failed');

    
    return false;
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('Network error: API is unreachable');
    } else {
      console.error('API connectivity check failed with error:', error);
    }
    return false;
  }
}

//helper function for fallback recommendations in case the api isnt working
function generateFallbackRecommendations(preferences?: string[] | UserPreferences): Recommendation[] {
  console.log('Generating fallback recommendations while API is unavailable');
  
  // Extract categories from preferences
  let categories: string[] = [];
  if (preferences) {
    if (Array.isArray(preferences)) {
      categories = preferences;
    } else {
      const userPrefs = preferences as UserPreferences;
      if (Array.isArray(userPrefs.food)) categories.push(...userPrefs.food);
      if (Array.isArray(userPrefs.activities)) categories.push(...userPrefs.activities);
      if (Array.isArray(userPrefs.places)) categories.push(...userPrefs.places);
      if (Array.isArray(userPrefs.custom)) categories.push(...userPrefs.custom);
    }
  }
  
  //if no categories, give generic categories
  if (categories.length === 0) {
    categories = ['Restaurant', 'Coffee Shop', 'Park'];
  }
  
  //basic recommendation for each category
  return categories.slice(0, 6).map((category, index) => ({
    id: `fallback-${index}`,
    name: `${category} Recommendation`,
    categories: [category],
    rating: 4.5,
    location: 'New York',
    image_url: '/placeholder-restaurant.jpg',
    category_match: category,
    explanation: `Fallback recommendation for ${category} while API is reconnecting. Please try again later.`,
    score: 0.8
  }));
}

/**
 * Function to up a sleeping Render url
 * makes multiple requests to the API to help wake it up
 */
export async function wakeupRenderService(): Promise<boolean> {
  console.log('Attempting to wake up Render service...');
  
  const endpoints = [
    '/api/test',
    '/api/health',
    '/api/cors-test'
  ];
  
  let success = false;
  
  for (const endpoint of endpoints) {
    try {
      console.log(`Sending wake-up request to ${endpoint}...`);
      const response = await fetch(`${RENDER_API_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(8000) 
      });
      
      if (response.ok) {
        console.log(`Wake-up request to ${endpoint} succeeded!`);
        success = true;
      } else {
        console.log(`Wake-up request to ${endpoint} failed with status: ${response.status}`);
      }
    } catch (error) {
      console.log(`Wake-up request to ${endpoint} failed with error: ${error}`);
    }
    
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  if (success) {
    console.log('Successfully sent at least one wake-up request');
  } else {
    console.warn('All wake-up requests failed');
  }
  
  return success;
} 