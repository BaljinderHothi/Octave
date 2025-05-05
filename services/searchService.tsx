import { Recommendation } from '../types/Recommendation';

// const API_BASE_URL = 'https://api.cortex.cerebrium.ai/v4/p-f68c4a50/my-first-project';
const API_BASE_URL = 'http://127.0.0.1:5001';
// const API_BASE_URL = 'https://octavefinalhybrid.onrender.com';


export async function searchRecommendations(query: string, userId?: string): Promise<Recommendation[]> {
  try {
    console.log(`Searching for: "${query}"`);
    
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      mode: 'cors',
      credentials: 'omit',
      body: JSON.stringify({
        searchName: query
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Search API error (${response.status}):`, errorText);
      throw new Error(`Error: ${response.status} - ${errorText || 'Unknown error'}`);
    }

    let data: any[];
    try {
      data = await response.json();
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      throw new Error('Invalid response format from search API');
    }
    
    console.log('Search results:', data);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('No search results found');
      return [];
    }

    return await Promise.all(data.map(async (rec: any) => {
      const formattedCategories = rec.category_text ? 
        rec.category_text.split(' ')
          .map((cat: string) => cat.charAt(0).toUpperCase() + cat.slice(1)) : 
        [];

      //get the image_url
      let imageUrl = '/placeholder-restaurant.jpg';
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
        
      return {
        id: rec.id || '',
        name: rec.name || 'Unknown',
        categories: formattedCategories,
        rating: typeof rec.rating === 'number' ? rec.rating : 0,
        location: 'New York',
        image_url: imageUrl,
        category_match: rec.category_text || 'Other',
        explanation: `${rec.note ? `${rec.note}\n` : ''}${
          formattedCategories.join(', ')
        } restaurant with ${rec.rating}★ rating and ${rec.review_count} reviews\n\nRecommendation score: ${
          rec.score ? `${(rec.score * 100).toFixed(1)}%` : 'N/A'
        }`,
        score: typeof rec.score === 'number' ? rec.score : (rec.score === null ? 0 : 0)
      };
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}