import { Recommendation } from '../types/Recommendation';

const API_BASE_URL = 'https://octavemodel.onrender.com';
// const API_BASE_URL = 'http://127.0.0.1:5001';


export async function searchRecommendations(query: string, userId?: string): Promise<Recommendation[]> {
  try {
    console.log(`Searching for: "${query}"`);
    
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        query,
        userId: userId || localStorage.getItem('userId'),
        top_n: 10
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search API error (${response.status}):`, errorText);
      throw new Error(`Error: ${response.status} - ${errorText || 'Unknown error'}`);
    }

    let data: any;
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Invalid response format from search API');
    }
    
    console.log('Search results:', data);
    
    if (!data.success) {
      throw new Error(data.message || 'Failed to get search results');
    }

    if (!data.recommendations || !Array.isArray(data.recommendations) || data.recommendations.length === 0) {
      console.log('No search results found');
      return [];
    }

    //check search type
    const searchType = data.search_type || 'unknown';
    console.log(`Search type: ${searchType}, found ${data.recommendations.length} recommendations`);
    
    //restaurant name search 
    if (searchType === 'restaurant_name' && data.recommendations.length > 0) {
      //first result should be the exact match
      const exactMatch = data.recommendations[0];
      if (exactMatch) {
        exactMatch.explanation = exactMatch.explanation || `Exact match for "${query}"`;
        if (!exactMatch.category_match && exactMatch.categories && exactMatch.categories.length > 0) {
          exactMatch.category_match = exactMatch.categories[0];
        }
      }
      
      //for similar restaurants - label them as similar 
      for (let i = 1; i < data.recommendations.length; i++) {
        const rec = data.recommendations[i];
        if (!rec.explanation?.includes('Similar')) {
          rec.explanation = `Similar to "${exactMatch.name}"` + (rec.explanation ? ` - ${rec.explanation}` : '');
        }
      }
    }
    
    //for partial category matches 
    if (searchType === 'partial_category' && data.matched_category) {
      for (const rec of data.recommendations) {
        if (!rec.explanation?.includes(data.matched_category)) {
          rec.explanation = `Category: ${data.matched_category} (from search: "${query}") - ${rec.explanation || ''}`;
        }
      }
    }

    return data.recommendations.map((rec: any) => ({
      id: rec.id || '',
      name: rec.name || 'Unknown',
      categories: Array.isArray(rec.categories) ? rec.categories : [],
      rating: typeof rec.rating === 'number' ? rec.rating : 0,
      location: rec.location || '',
      image_url: rec.image_url || '/placeholder-restaurant.jpg',
      category_match: rec.category_match || (rec.categories && rec.categories.length > 0 ? rec.categories[0] : 'Other'),
      explanation: rec.explanation || `Top rated ${rec.categories && rec.categories.length > 0 ? rec.categories[0] : 'establishment'} with ${rec.rating || 0}★ rating`,
      score: typeof rec.score === 'number' ? rec.score : 0
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}