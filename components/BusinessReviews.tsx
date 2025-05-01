import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Star, ThumbsUp, Trash2, Edit, ChevronDown, ChevronUp } from 'lucide-react';
import BadgeNotification from './BadgeNotification';
import type { Badge } from '@/models/User';
import { useBadges } from '@/components/BadgeContext';

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  profilePicture: string;
}

interface Review {
  _id: string;
  user: User;
  businessId: string;
  businessName: string;
  rating: number;
  text: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
}

interface BusinessReviewsProps {
  businessId: string;
  businessName: string;
}

export default function BusinessReviews({ businessId, businessName }: BusinessReviewsProps) {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewImages, setReviewImages] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { checkBadgesForEvent } = useBadges();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        if (token) {
          try {
            const userResponse = await fetch('/api/user/profile', {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            
            if (userResponse.ok) {
              const userData = await userResponse.json();
              setCurrentUser(userData.data);
            }
          } catch (err) {
            console.error('Error fetching user:', err);
          }
        }
        
        console.log(`Fetching reviews for business ID: ${businessId}, page: ${page}`);
        
        const reviewsUrl = `/api/businesses/${businessId}/reviews?page=${page}&limit=3`;
        console.log('First trying URL:', reviewsUrl);
        
        try {
          const response = await fetch(reviewsUrl);
          console.log('Response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('Reviews data:', data);
            console.log(`Got ${data.data.length} reviews, page ${data.pagination.page} of ${data.pagination.pages}`);
            
            if (page === 1) {
              setReviews(data.data);
            } else {
              setReviews(prevReviews => {
                const existingIds = new Set(prevReviews.map(review => review._id));
                const newReviews = data.data.filter((review: Review) => !existingIds.has(review._id));
                console.log(`Adding ${newReviews.length} new unique reviews`);
                return [...prevReviews, ...newReviews];
              });
            }
            
            setHasMore(data.pagination.page < data.pagination.pages);
            console.log(`Has more pages: ${data.pagination.page < data.pagination.pages}`);
            setError(null);
            setLoading(false);
            return; 
          }
        } catch (err) {
          console.error('Error with first review endpoint:', err);
        }
        
        const fallbackUrl = `/api/reviews?businessId=${businessId}&page=${page}&limit=3`;
        console.log('Falling back to URL:', fallbackUrl);
        
        const fallbackResponse = await fetch(fallbackUrl);
        console.log('Fallback response status:', fallbackResponse.status);
        
        if (!fallbackResponse.ok) {
          const errorText = await fallbackResponse.text();
          console.error('Error response:', errorText);
          throw new Error(`Failed to fetch reviews: ${fallbackResponse.status} ${errorText}`);
        }
        
        const fallbackData = await fallbackResponse.json();
        console.log('Fallback reviews data:', fallbackData);
        
        if (page === 1) {
          setReviews(fallbackData.data);
        } else {
          setReviews(prevReviews => {
            const existingIds = new Set(prevReviews.map(review => review._id));
            const newReviews = fallbackData.data.filter((review: Review) => !existingIds.has(review._id));
            console.log(`Adding ${newReviews.length} new unique reviews from fallback`);
            return [...prevReviews, ...newReviews];
          });
        }
        
        setHasMore(fallbackData.pagination.page < fallbackData.pagination.pages);
        setError(null);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError(err instanceof Error ? err.message : 'Failed to load reviews. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [businessId, page]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          businessId,
          businessName,
          rating: reviewRating,
          text: reviewText,
          images: reviewImages,
          isPublic
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit review');
      }

      const data = await response.json();
      
      setReviews(prev => [data.data, ...prev]);
      
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      setShowReviewForm(false);

      checkBadgesForEvent('REVIEW_ADDED');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to submit review');
    }
  };

  const handleUpdateReview = async (reviewId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          text: reviewText,
          images: reviewImages,
          isPublic
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update review');
      }

      const data = await response.json();
      
      setReviews(prev => 
        prev.map(review => 
          review._id === reviewId ? data.data : review
        )
      );
      
      setReviewText('');
      setReviewRating(5);
      setReviewImages([]);
      setEditingReview(null);
    } catch (err) {
      console.error('Error updating review:', err);
      setError(err instanceof Error ? err.message : 'Failed to update review');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete review');
      }
      
      setReviews(prev => prev.filter(review => review._id !== reviewId));
      
      checkBadgesForEvent('REVIEW_DELETED');
    } catch (err) {
      console.error('Error deleting review:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const toggleExpanded = (reviewId: string) => {
    setExpandedReviews(prev => {
      const next = new Set(prev);
      if (next.has(reviewId)) {
        next.delete(reviewId);
      } else {
        next.add(reviewId);
      }
      return next;
    });
  };

  const handleEditClick = (review: Review) => {
    setEditingReview(review._id);
    setReviewText(review.text);
    setReviewRating(review.rating);
    setReviewImages(review.images || []);
    setIsPublic(review.isPublic);
  };

  const loadMoreReviews = () => {
    if (hasMore && !loading) {
      console.log(`Loading more reviews, moving to page ${page + 1}`);
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    console.log(`Page changed to ${page}, hasMore: ${hasMore}`);
  }, [page, hasMore]);

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer' : ''}`}
            onClick={interactive ? () => setReviewRating(star) : undefined}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Reviews</h2>
      
      {/* New Review Button */}
      {currentUser && !editingReview && (
        <div className="mb-6">
          {!showReviewForm ? (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Write a Review
            </button>
          ) : (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-xl font-semibold mb-4">Write Your Review</h3>
              <form onSubmit={handleSubmitReview}>
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Rating</label>
                  {renderStars(reviewRating, true)}
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">Review</label>
                  <textarea
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    required
                    placeholder="Share your experience with this business..."
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 mb-2">
                    <input
                      type="checkbox"
                      checked={isPublic}
                      onChange={(e) => setIsPublic(e.target.checked)}
                      className="mr-2"
                    />
                    Make this review public
                  </label>
                </div>
                
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}
      
      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}
      
      {/* Reviews List */}
      {loading && reviews.length === 0 ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No reviews yet. Be the first to review!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Display only the first 3 reviews initially */}
          {reviews.slice(0, page * 3).map((review) => (
            <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
              {editingReview === review._id ? (
                // Edit Review Form
                <div>
                  <h3 className="text-xl font-semibold mb-4">Edit Your Review</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateReview(review._id);
                  }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Rating</label>
                      {renderStars(reviewRating, true)}
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">Review</label>
                      <textarea
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 mb-2">
                        <input
                          type="checkbox"
                          checked={isPublic}
                          onChange={(e) => setIsPublic(e.target.checked)}
                          className="mr-2"
                        />
                        Make this review public
                      </label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingReview(null)}
                        className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Update Review
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                // Review Display
                <div>
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      {review.user.profilePicture ? (
                        <Image
                          src={review.user.profilePicture}
                          alt={review.user.username}
                          width={40}
                          height={40}
                          className="rounded-full"
                          unoptimized
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-semibold">
                            {review.user.firstName?.[0]}{review.user.lastName?.[0]}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold">
                            {review.user.firstName} {review.user.lastName}
                          </h4>
                          <div className="flex items-center mt-1">
                            {renderStars(review.rating)}
                            <span className="ml-2 text-sm text-gray-600">
                              {formatDate(review.createdAt)}
                            </span>
                          </div>
                        </div>
                        
                        {currentUser && currentUser._id === review.user._id && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEditClick(review)}
                              className="text-gray-600 hover:text-blue-600"
                              aria-label="Edit review"
                            >
                              <Edit className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(review._id)}
                              className="text-gray-600 hover:text-red-600"
                              aria-label="Delete review"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-2">
                        {review.text.length > 300 && !expandedReviews.has(review._id) ? (
                          <>
                            <p className="text-gray-700">{review.text.slice(0, 300)}...</p>
                            <button
                              onClick={() => toggleExpanded(review._id)}
                              className="text-blue-600 hover:underline flex items-center mt-2"
                            >
                              Read more <ChevronDown className="h-4 w-4 ml-1" />
                            </button>
                          </>
                        ) : (
                          <>
                            <p className="text-gray-700">{review.text}</p>
                            {review.text.length > 300 && (
                              <button
                                onClick={() => toggleExpanded(review._id)}
                                className="text-blue-600 hover:underline flex items-center mt-2"
                              >
                                Show less <ChevronUp className="h-4 w-4 ml-1" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      {review.images && review.images.length > 0 && (
                        <div className="mt-3 flex space-x-2 overflow-x-auto">
                          {review.images.map((image, idx) => (
                            <div key={idx} className="flex-shrink-0">
                              <Image
                                src={image}
                                alt={`Review image ${idx + 1}`}
                                width={100}
                                height={100}
                                className="rounded-md object-cover"
                                unoptimized
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {/* Load More Button */}
          {(hasMore || reviews.length > 3) && (
            <div className="text-center mt-4">
              <button
                onClick={loadMoreReviews}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Reviews'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 