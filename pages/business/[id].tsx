import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { Star, MapPin, Phone, Clock } from 'lucide-react';
import BusinessReviews from '@/components/BusinessReviews';

interface Category {
  alias: string;
  title: string;
}

interface Business {
  _id: string;
  name: string;
  image_url: string;
  url: string;
  phone: string;
  display_phone: string;
  review_count: number;
  rating: number;
  price: string;
  categories: Category[];
  location: {
    address1: string;
    address2: string;
    address3: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  hours: {
    open: {
      day: number;
      start: string;
      end: string;
    }[];
  }[];
}

export default function BusinessPage() {
  const router = useRouter();
  const { id } = router.query;
  
  const [business, setBusiness] = useState<Business | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBusiness = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const response = await fetch(`/api/businesses/${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch business details');
        }
        
        const data = await response.json();
        setBusiness(data.data);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load business details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [id]);

  // business hours
  const formatHours = (hours: any) => {
    if (!hours || !hours[0] || !hours[0].open) return 'Hours not available';
    
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return hours[0].open.map((time: any) => {
      const day = daysOfWeek[time.day];
      const start = formatTime(time.start);
      const end = formatTime(time.end);
      
      return (
        <div key={time.day} className="flex justify-between">
          <span className="font-medium">{day}</span>
          <span>{start} - {end}</span>
        </div>
      );
    });
  };

  const formatTime = (time: string) => {
    if (!time || time.length !== 4) return 'N/A';
    
    const hours = parseInt(time.substring(0, 2));
    const minutes = time.substring(2);
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    
    return `${formattedHours}:${minutes} ${period}`;
  };

  // stars for rating
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  // phone number
  const formatPhoneNumber = (phoneNumber: string) => {
    if (!phoneNumber) return '';
    
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+1 ${cleaned.substring(1, 4)}-${cleaned.substring(4, 7)}-${cleaned.substring(7, 11)}`;
    }
    else if (cleaned.length === 10) {
      return `+1 ${cleaned.substring(0, 3)}-${cleaned.substring(3, 6)}-${cleaned.substring(6, 10)}`;
    }
    
    return phoneNumber;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !business) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 max-w-md w-full">
          <p className="text-red-700 font-medium">
            {error || 'Business not found'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go back to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Image */}
      <div className="w-full h-64 relative bg-gray-700">
        {business.image_url ? (
          <Image
            src={business.image_url}
            alt={business.name}
            fill
            className="object-cover opacity-80"
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xl">No image available</span>
          </div>
        )}
        <div className="absolute inset-0 bg-black bg-opacity-30" />
      </div>
      
      <div className="max-w-4xl mx-auto -mt-16 relative z-10 px-4">
        {/* Business Info Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="p-6">
            <h1 className="text-3xl font-bold text-gray-900">{business.name}</h1>
            
            <div className="flex items-center mt-2">
              {renderStars(business.rating)}
              <span className="ml-2 text-sm text-gray-600">
                {business.rating}
              </span>
              {business.price && (
                <span className="ml-4 text-sm text-gray-600">
                  {business.price}
                </span>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 mt-3">
              {business.categories && business.categories.map((category) => (
                <span
                  key={category.alias}
                  className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                >
                  {category.title}
                </span>
              ))}
            </div>
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact & Location</h3>
                
                {business.location && (
                  <div className="flex items-start mb-3">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <p>{business.location.address1}</p>
                      {business.location.address2 && <p>{business.location.address2}</p>}
                      <p>
                        {business.location.city}, {business.location.state} {business.location.zip_code}
                      </p>
                    </div>
                  </div>
                )}
                
                {business.phone && (
                  <div className="flex items-center mb-3">
                    <Phone className="h-5 w-5 text-gray-500 mr-2" />
                    <a
                      href={`tel:${business.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {formatPhoneNumber(business.phone)}
                    </a>
                  </div>
                )}
                
                <div className="mt-4">
                  <a
                    href={business.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
                  >
                    Visit Website
                  </a>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Business Hours
                </h3>
                
                <div className="space-y-1 text-sm">
                  {business.hours ? (
                    formatHours(business.hours)
                  ) : (
                    <p className="text-gray-600">Hours information not available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Reviews Section */}
        <BusinessReviews
          businessId={business._id}
          businessName={business.name}
        />
      </div>
    </div>
  );
} 