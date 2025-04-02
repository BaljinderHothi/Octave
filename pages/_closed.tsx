import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';

interface Recommendation {
  id: string;
  name: string;
  categories: string[];
  rating: number;
  location: string;
  image_url: string;
  explanation: string;
}

interface GroupedRecommendations {
  [category: string]: Recommendation[];
}

export default function Home() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<GroupedRecommendations>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('/api/recommendations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch recommendations');
        }

        const data = await response.json();
        setRecommendations(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading your recommendations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Personalized Recommendations</h1>
        
        {Object.entries(recommendations).map(([category, places]) => (
          <div key={category} className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Because you liked {category}...
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place) => (
                <div key={place.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative h-48">
                    <Image
                      src={place.image_url || '/placeholder.jpg'}
                      alt={place.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900">{place.name}</h3>
                    
                    <div className="mt-2 text-sm text-gray-600">
                      <p>{place.location}</p>
                      <p className="mt-1">Categories: {place.categories.join(', ')}</p>
                      <p className="mt-1">Rating: {place.rating}★</p>
                    </div>
                    
                    <p className="mt-3 text-sm text-gray-500 italic">
                      {place.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}