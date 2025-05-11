import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { ArrowLeft, Star, CalendarDays, ExternalLink, SortAsc, SortDesc, AlignLeft } from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';

interface Review {
  _id: string;
  businessId: string;
  businessName: string;
  rating: number;
  text: string;
  images?: string[];
  createdAt: string;
  isPublic: boolean;
}

type SortOption = 'newest' | 'oldest' | 'alphabetical';

export default function MyReviews() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filteredReviews, setFilteredReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (reviews.length > 0) {
      sortReviews(sortBy);
    }
  }, [reviews, sortBy]);

  const checkAuth = () => {
    setIsChecking(true);
    const token = localStorage.getItem('token');
      
    if (!token) {
      router.replace('/login?redirect=myreviews');
      return;
    }

    setIsAuthenticated(true);
    setIsChecking(false);
    fetchReviews();
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await fetch('/api/reviews/user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      
      const data = await response.json();
      setReviews(data.data);
      sortReviews('newest', data.data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const sortReviews = (option: SortOption, reviewsData: Review[] = reviews) => {
    let sorted = [...reviewsData];
    
    switch (option) {
      case 'newest':
        sorted = sorted.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'oldest':
        sorted = sorted.sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case 'alphabetical':
        sorted = sorted.sort((a, b) => 
          a.businessName.localeCompare(b.businessName)
        );
        break;
    }
    
    setFilteredReviews(sorted);
    setSortBy(option);
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isChecking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Verifying authentication...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; 
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading reviews...</div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Reviews | Octave</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/profile")}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-3xl font-bold">My Reviews</h1>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {reviews.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-md">
            <p className="text-gray-600">You haven't written any reviews yet.</p>
            <Link href="/" className="mt-4 inline-block text-blue-600 hover:underline">
              Explore businesses to review
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => sortReviews('newest')}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  sortBy === 'newest' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <SortDesc className="h-4 w-4 mr-1" />
                Newest First
              </button>
              <button
                onClick={() => sortReviews('oldest')}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  sortBy === 'oldest' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <SortAsc className="h-4 w-4 mr-1" />
                Oldest First
              </button>
              <button
                onClick={() => sortReviews('alphabetical')}
                className={`flex items-center px-3 py-2 rounded-md text-sm ${
                  sortBy === 'alphabetical' 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <AlignLeft className="h-4 w-4 mr-1" />
                Alphabetical
              </button>
            </div>
            
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <div key={review._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="p-4 border-b">
                    <div className="flex justify-between items-start">
                      <Link href={`/business/${review.businessId}`} className="group">
                        <h2 className="text-xl font-medium text-gray-900 group-hover:text-blue-600">
                          {review.businessName}
                        </h2>
                      </Link>
                      <div className="flex items-center">
                        {!review.isPublic && (
                          <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded mr-2">
                            Private
                          </span>
                        )}
                        <Link 
                          href={`/business/${review.businessId}`}
                          className="text-gray-400 hover:text-blue-600"
                          title="View business"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                    
                    <div className="flex items-center mt-2">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-500">
                        Posted <CalendarDays className="inline h-3 w-3 ml-1 mr-1" />
                        {format(new Date(review.createdAt), 'MMM d, yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <p className="text-gray-700">{review.text}</p>
                    
                    {review.images && review.images.length > 0 && (
                      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative w-24 h-24 flex-shrink-0">
                            <Image
                              src={image}
                              alt={`Review photo ${index + 1}`}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-gray-50 px-4 py-3 border-t">
                    <Link 
                      href={`/business/${review.businessId}`}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View business details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
} 