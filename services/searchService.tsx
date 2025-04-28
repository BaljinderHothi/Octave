import { Recommendation } from '../types/Recommendation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export async function searchRecommendations(query: string, userId?: string): Promise<Recommendation[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        query,
        userId: userId || localStorage.getItem('userId'),
        top_n: 6
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.message || 'Failed to get recommendations');
    }

    return data.recommendations.map((rec: any) => ({
      id: rec.id,
      name: rec.name,
      categories: rec.categories,
      rating: rec.rating,
      location: rec.location,
      image_url: rec.image_url,
      explanation: rec.explanation || `Top rated ${rec.categories[0] || 'establishment'} with ${rec.rating}★ rating`
    }));
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}