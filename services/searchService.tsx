import { Recommendation } from '../types/Recommendation';

export async function searchRecommendations(query: string, userId?: string): Promise<Recommendation[]> {
  try {
    //@jolie help me Replace with actual ML model endpoint when we fix that
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        query,
        userId: userId || localStorage.getItem('userId')
      })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    return data.recommendations;
  } catch (error) {
    console.error('Search error:', error);
    throw error;
  }
}