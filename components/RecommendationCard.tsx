//recommendation card component for the homepage

import Image from 'next/image';
import { Star } from 'lucide-react';
import { useRouter } from 'next/router';
import { Recommendation } from '../types/Recommendation';

interface RecommendationCardProps {
  recommendation: Recommendation;
}

export default function RecommendationCard({ recommendation }: RecommendationCardProps) {
  const router = useRouter();

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="relative h-48 w-full">
        <Image
          src={recommendation.image_url || '/placeholder-restaurant.jpg'}
          alt={recommendation.name}
          fill
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{recommendation.name}</h3>
        <p className="text-sm text-gray-600 mb-2">
          {recommendation.categories.slice(0, 2).join(', ')}
        </p>
        <p className="text-sm text-gray-500 mb-2">
          {recommendation.location}
        </p>
        <div className="flex items-center mb-2">
          <span className="text-yellow-400">★</span>
          <span className="ml-1 text-sm">{recommendation.rating.toFixed(1)}</span>
        </div>
        <p className="text-sm text-gray-700 italic mb-2">
          {recommendation.explanation}
        </p>
        <button 
          onClick={() => router.push(`/business/${recommendation.id}`)}
          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
        >
          <Star size={16} className="mr-1" />
          Reviews
        </button>
      </div>
    </div>
  );
} 
