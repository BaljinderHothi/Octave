//this file handles all the recommendation-related API calls between Nextjs
//and the deployed backend on Render (using Flask)

import { Recommendation, RecommendationResponse } from '../types/Recommendation';

// const RENDER_API_URL = 'https://api.cortex.cerebrium.ai/v4/p-f68c4a50/my-first-project';
// const RENDER_API_URL = 'http://127.0.0.1:5001'; //this is the local new model
const RENDER_API_URL = 'https://octavefinalhybrid.onrender.com';

interface UserPreferences {
  food?: string[];
  activities?: string[];
  places?: string[];
  custom?: string[];
  implicitCategories?: string[];
  additionalPreferences?: string[];
}

export async function getRecommendations(userId: string, preferences?: string[] | UserPreferences): Promise<Recommendation[]> {
  const token = localStorage.getItem('token');
  
  try {
    //get user's reviewed businesses first
    let reviewedBusinessIds: string[] = [];
    try {
      const reviewsResponse = await fetch('/api/reviews/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success && Array.isArray(reviewsData.data)) {
          reviewedBusinessIds = reviewsData.data.map((review: any) => review.businessId);
          console.log('Filtered out already reviewed businesses:', reviewedBusinessIds);
        }
      }
    } catch (error) {
      console.error('Error fetching user reviews:', error);
    }

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
    let implicitCategories: string[] = [];
    let additionalPrefs: string[] = [];
    
    //preferences is an object (UserPreferences) -> combine all categories
    if (preferences && !Array.isArray(preferences)) {
      const userPrefs = preferences as UserPreferences;
      if (Array.isArray(userPrefs.food)) combinedPreferences.push(...userPrefs.food);
      if (Array.isArray(userPrefs.activities)) combinedPreferences.push(...userPrefs.activities);
      if (Array.isArray(userPrefs.places)) combinedPreferences.push(...userPrefs.places);
      if (Array.isArray(userPrefs.custom)) combinedPreferences.push(...userPrefs.custom);
      
      if (Array.isArray(userPrefs.implicitCategories)) {
        implicitCategories = userPrefs.implicitCategories;
      }
      
      if (Array.isArray(userPrefs.additionalPreferences)) {
        additionalPrefs = userPrefs.additionalPreferences;
      }
    } else if (Array.isArray(preferences)) {
      combinedPreferences = preferences;
    }

    //fetch implicit categories from user profile
    try {
      const response = await fetch('/api/user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.data?.preferences?.implicitCategories && 
            Array.isArray(userData.data.preferences.implicitCategories)) {
          implicitCategories = userData.data.preferences.implicitCategories;
          console.log('Fetched implicit categories:', implicitCategories);
        }
        
        if (userData.data?.preferences?.additionalPreferences && 
            Array.isArray(userData.data.preferences.additionalPreferences)) {
          additionalPrefs = userData.data.preferences.additionalPreferences;
          console.log('Fetched additional preferences:', additionalPrefs);
        }
      }
    } catch (error) {
      console.error('Error fetching user preferences:', error);
    }

    //combine explicit preferences with implicit categories
    combinedPreferences = Array.from(new Set([...combinedPreferences, ...implicitCategories, ...additionalPrefs]));

    console.log('=== RECOMMENDATION REQUEST DEBUG ===');
    console.log('Request Parameters:', {
      userId,
      explicitPreferences: preferences,
      implicitCategories,
      additionalPreferences: additionalPrefs,
      combinedPreferences,
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
        'Accept': 'application/json',
        'Origin': 'http://localhost:3000'
      },
      credentials: 'include',
      mode: 'cors',
      body: JSON.stringify(requestBody)
    });

    console.log('Response Status:', response.status);
    
    if (!response.ok) {
      console.error('API response bad:', response.status);
      let errorMessage = 'Failed to fetch recommendations';
      try {
        const errorText = await response.text();
        console.error('Error response:', errorText);
        errorMessage = `Failed to fetch recommendations: ${errorText}`;
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      throw new Error(errorMessage);
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
    
    //make separate calls for each implicit category
    let implicitRecommendations: any[] = [];
    if (implicitCategories.length > 0) {      
      for (const category of implicitCategories) {
        try {
          const implicitResponse = await fetch(`${RENDER_API_URL}/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'omit',
            mode: 'cors',
            body: JSON.stringify({
              searchName: category
            })
          });
          
          if (implicitResponse.ok) {
            const implicitData = await implicitResponse.json();
            if (Array.isArray(implicitData) && implicitData.length > 0) {
              const processedImplicitData = implicitData.map((item: any) => ({
                ...item,
                matched_category: category,
                from_implicit: true
              }));
              
              //top 6 results for each implicit category
              implicitRecommendations.push(...processedImplicitData.slice(0, 6));
              console.log(`Added ${Math.min(6, processedImplicitData.length)} recommendations for implicit category: ${category}`);
            }
          }
        } catch (err) {
          console.error(`Error fetching recommendations for implicit category ${category}:`, err);
        }
      }
    }
    
    //make separate calls for each additional preference
    let additionalRecommendations: any[] = [];
    if (additionalPrefs.length > 0) {      
      for (const preference of additionalPrefs) {
        try {
          const additionalResponse = await fetch(`${RENDER_API_URL}/search`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json'
            },
            credentials: 'omit',
            mode: 'cors',
            body: JSON.stringify({
              searchName: preference
            })
          });
          
          if (additionalResponse.ok) {
            const additionalData = await additionalResponse.json();
            if (Array.isArray(additionalData) && additionalData.length > 0) {
              const processedAdditionalData = additionalData.map((item: any) => ({
                ...item,
                matched_category: preference,
                from_additional: true
              }));
              
              //top 6 results for each additional preference
              additionalRecommendations.push(...processedAdditionalData.slice(0, 6));
              console.log(`Added ${Math.min(6, processedAdditionalData.length)} recommendations for additional preference: ${preference}`);
            }
          }
        } catch (err) {
          console.error(`Error fetching recommendations for additional preference ${preference}:`, err);
        }
      }
    }
    
    //combine regular and implicit recommendations
    const allRecommendations = [...recommendations, ...implicitRecommendations, ...additionalRecommendations];
    console.log('Total recommendations after including implicit and additional preferences:', allRecommendations.length);
    
    //filter out businesses that the user has already reviewed
    const filteredRecommendations = allRecommendations.filter(rec => !reviewedBusinessIds.includes(rec.id));
    console.log(`Removed ${allRecommendations.length - filteredRecommendations.length} already reviewed businesses from recommendations`);
    
    //MAKE SURE each recommendation has the required fields
    const formattedRecommendations = await Promise.all(filteredRecommendations.map(async (rec: any): Promise<Recommendation> => {
      //get the image_url
      let imageUrl = rec.image_url || '/placeholder-restaurant.jpg';
      try {
        const response = await fetch(`/api/businesses/${rec.id}`);
        if (response.ok) {
          const businessData = await response.json();
          if (businessData.success && businessData.data.image_url) {
            imageUrl = businessData.data.image_url;
          }
        }
      } catch (error) {
        console.error('Error fetching business details:', error);
      }

      let explanation = '';
      if (rec.from_implicit) {
        explanation = `Based on your detected interest in ${rec.matched_category}\n\n${rec.rating}★ rating with ${rec.review_count || 0} reviews\n\nRecommendation score: ${
          rec.score ? `${(rec.score * 100).toFixed(1)}%` : 'N/A'
        }`;
      } else if (rec.from_additional) {
        explanation = `Based on your positive reviews for ${rec.matched_category}\n\n${rec.rating}★ rating with ${rec.review_count || 0} reviews\n\nRecommendation score: ${
          rec.score ? `${(rec.score * 100).toFixed(1)}%` : 'N/A'
        }`;
      } else {
        explanation = `Recommended ${rec.matched_category} restaurant with ${rec.rating}★ rating and ${rec.review_count || 0} reviews\n\nRecommendation score: ${
          rec.score ? `${(rec.score * 100).toFixed(1)}%` : 'N/A'
        }`;
      }

      return {
        id: rec.id || '',
        name: rec.name || 'Unknown Business',
        categories: rec.category_text ? [rec.category_text] : [],
        rating: typeof rec.rating === 'number' ? rec.rating : 0,
        location: rec.location?.address1 ? 
          `${rec.location.address1}, ${rec.location.city || 'New York'}, ${rec.location.state || 'NY'}` : 
          'New York',
        image_url: imageUrl,
        category_match: rec.matched_category || 'Other',
        explanation: explanation,
        score: typeof rec.score === 'number' ? rec.score : 0,
        from_implicit: !!rec.from_implicit,
        from_additional: !!rec.from_additional
      };
    }));

    //sort recommendations by score in descending order
    return formattedRecommendations
      .sort((a, b) => (b.score || 0) - (a.score || 0));
  } catch (error) {
    console.error('Error in getRecommendations:', error);
    return generateFallbackRecommendations(preferences);
  }
}

export async function getHealthCheck(): Promise<boolean> {
  const maxRetries = 2;
  const retryDelay = 3000; 
  const initialTimeout = 15000;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Health check attempt ${attempt + 1}/${maxRetries + 1}...`);
      
      const response = await fetch(`${RENDER_API_URL}/api/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Origin': 'http://localhost:3000'
        },
        credentials: 'include',
        mode: 'cors',
        signal: AbortSignal.timeout(initialTimeout + (attempt * 5000)), // Increase timeout with each retry
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
      if (error instanceof Error && error.name === 'TimeoutError') {
        console.log('Health check timeout - service might be waking up from sleep');
      } else {
        console.error(`Health check error (attempt ${attempt + 1}/${maxRetries + 1}):`, error);
      }
      
      if (attempt < maxRetries) {
        const nextDelay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`Retrying in ${nextDelay/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
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
        'Origin': 'http://localhost:3000'
      },
      credentials: 'include',
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
        'Origin': 'http://localhost:3000'
      },
      credentials: 'include',
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
  const baseTimeout = 15000; // Increased base timeout to 15 seconds
  
  for (let attempt = 0; attempt < 3; attempt++) {
    for (const endpoint of endpoints) {
      try {
        console.log(`Sending wake-up request to ${endpoint} (attempt ${attempt + 1}/3)...`);
        const response = await fetch(`${RENDER_API_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:3000'
          },
          credentials: 'include',
          mode: 'cors',
          signal: AbortSignal.timeout(baseTimeout + (attempt * 5000)) // Increase timeout with each attempt
        });
        
        if (response.ok) {
          console.log(`Wake-up request to ${endpoint} succeeded!`);
          success = true;
          break; 
        } else {
          console.log(`Wake-up request to ${endpoint} failed with status: ${response.status}`);
        }
      } catch (error) {
        if (error instanceof Error && error.name === 'TimeoutError') {
          console.log(`Wake-up request to ${endpoint} timed out - service might still be initializing`);
        } else {
          console.log(`Wake-up request to ${endpoint} failed with error: ${error}`);
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000)); 
    }
    
    if (success) break; 
    
    if (attempt < 2) { 
      const delay = 3000 * Math.pow(2, attempt); 
      console.log(`No endpoints responded. Waiting ${delay/1000} seconds before next attempt...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  if (success) {
    console.log('Successfully sent at least one wake-up request');
  } else {
    console.warn('All wake-up requests failed - service might need more time to initialize');
  }
  
  return success;
} 