// This page generates a fully personalized itinerary for the user, it is based on their preferences.
// Users are able to regenerate the itinerary, or only one single option at a time.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { saveToLocalStorage, getFromLocalStorage } from '@/utils/storage';
import MapboxNYC from 'components/MapboxNYC';
import { MapPin, Calendar, Clock, Phone, Star, Grid, RefreshCw } from 'lucide-react';
import { useBadges } from '@/components/BadgeContext';

export default function GeneratedItinerary() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [food, setFood] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState({food: true, activity: true, place: true});
  const [selectedLocation, setSelectedLocation] = useState<{lng: number, lat: number} | null>(null);
  const [filterRadius, setFilterRadius] = useState<number>(5);
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const { checkBadgesForEvent } = useBadges();

  const handleSaveItinerary = async () => {
    try {
      const requestBody: { [key: string]: string | undefined } = {};
      
      if (selectedCategories.food && food) {
        requestBody.food = food.name;
        requestBody.foodId = food.id;
      }
      
      if (selectedCategories.activity && activity) {
        requestBody.activity = activity.name;
        requestBody.activityId = activity.id;
      }
      
      if (selectedCategories.place && place) {
        requestBody.place = place.name;
        requestBody.placeId = place.id;
      }
      
      // Check if at least one category is selected
      if (Object.keys(requestBody).length === 0) {
        alert('Please select at least one category (food, activity, or place)');
        return;
      }
      
      const res = await fetch('/api/itineraries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestBody)
      });
  
      const data = await res.json();
      console.log('Save response:', data);
  
      if (res.ok) {
        alert('Itinerary saved!');
        
        checkBadgesForEvent('ITINERARY_CREATED');
      } else {
        alert(`Error saving itinerary: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Failed to save itinerary:', err);
      alert('Network or server error occurred.');
    }
  };
  
  const foodAliases = ['restaurants', 'italian', 'mexican', 'sushi', 'bbq', 'vegan', 'fast food', 'pizza', 'indian', 'latin fusion', 'taco',
    'thai', 'chinese', 'mediterranean', 'greek', 'french', 'japanese', 'korean', 'vietnamese', 'lebanese', 'cuban', 
    'caribbean', 'ethiopian', 'afghan', 'turkish', 'noodles', 'burgers', 'ramen', 'steakhouse', 'seafood', 'southern',
    'middle eastern', 'brunch', 'brazilian', 'peruvian', 'tapas', 'dumplings', 'poke', 'halal', 'gluten free', 'comfort food',
    'street food', 'gastropub', 'new american', 'kebab', 'bagels', 'sandwiches', 'salad', 'food trucks', 'bistro', 'organic',
    'deli', 'creole', 'cajun', 'irish', 'german', 'nepalese', 'moroccan', 'pakistani', 'filipino', 'malaysian', 'fusion']
  
  const activityAliases = ['billiards', 'poolhalls', 'bowling', 'yoga', 'pilates','rockclimbing', 'painting', 'rock climbing', 'movies', 'swimming', 'dancing',
    'arcade', 'escape room', 'karaoke', 'golf','mini golf', 'go kart', 'trampoline park', 'laser tag', 'ice skating', 
    'roller skating', 'ziplining', 'pottery', 'wine tasting', 'beer tasting', 'board games',
    'virtual reality', 'indoor skydiving', 'archery', 'axe throwing']
  
  const placeAliases = ['parks', 'museums', 'landmarks', 'beaches', 'zoos', 'libraries',
    'gardens', 'aquariums', 'piers', 'observatories', 'monuments', 'cathedrals',
    'bridges', 'harbors', 'galleries', 'historic sites', 'botanical gardens', 'stadiums',
    'arenas', 'islands', 'memorials', 'conservatories']

  
  const [userPrefs, setUserPrefs] = useState({food: [] as string[], activities: [] as string[], places: [] as string[]})
  

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    return match ? `+1 (${match[1]}) ${match[2]}-${match[3]}` : phone;
  };
  
  const [showHours, setShowHours] = useState<{ [key: string]: boolean }>({});
  
  const formatTime = (time: string) => {
    const hours = parseInt(time.slice(0, 2), 10);
    const minutes = time.slice(2);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hr = hours % 12 || 12;
    return `${hr}:${minutes} ${ampm}`;
  };
  
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 3958.8; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    return Number(distance.toFixed(2)); 
  };


  const renderHours = (business: any) => {
    const openHours = business.hours?.[0]?.open || [];
    const groupedByDay: { [key: number]: { start: string, end: string, is_overnight: boolean }[] } = {};
    
    for (const entry of openHours) {
      if (!groupedByDay[entry.day]) groupedByDay[entry.day] = [];
      groupedByDay[entry.day].push(entry);
    }
  
    return (
      <div className="mt-2">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHours(prev => ({ ...prev, [business.id]: !prev[business.id] }))}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <Clock size={16} className="mr-1" />
            {showHours[business.id] ? 'Hide Hours' : 'Show Hours'}
          </button>
          <button
            onClick={() => {
              saveToLocalStorage('saved_generated_food', food);
              saveToLocalStorage('saved_generated_activity', activity);
              saveToLocalStorage('saved_generated_place', place);
              router.push(`/business/${business.id}`);
            }}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
          >
            <Star size={16} className="mr-1" />
            Reviews
          </button>
        </div>

        {showHours[business.id] && (
          <ul className="mt-2 ml-1 text-sm text-gray-700 grid grid-cols-1 gap-1">
            {Object.entries(groupedByDay).map(([day, entries]: [string, any[]]) => (
              <li key={day} className="flex">
                <span className="font-medium w-24">{daysOfWeek[parseInt(day)]}:</span>
                <span>
                  {entries.map((e, idx) => `${formatTime(e.start)} – ${formatTime(e.end)}${e.is_overnight ? ' (Overnight)' : ''}`)
                    .join(', ')}
    </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center text-sm text-yellow-600 font-semibold">
        Yelp Rating {rating.toFixed(1)}
        <Star size={16} className="ml-1 text-yellow-500 fill-yellow-500" />
      </div>
    );
  };

  const renderCategories = (categories: any[]) => {
    if (!Array.isArray(categories) || categories.length === 0) return null;

    return (
      <div className="mt-2 text-sm text-gray-700">
        <div className="flex items-center gap-1">
          <Grid size={16} className="text-gray-500" />
          <span className="font-semibold">Categories:</span>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
        {categories.map((cat, idx) => (
            <span key={idx} className="px-2 py-1 bg-gray-100 rounded-full text-xs">
              {cat.title}
          </span>
        ))}
        </div>
      </div>
    );
  };

 
  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data) && data.data.length >= 3) {
          setBusinesses(data.data);
          setFilteredBusinesses(data.data);
        } else {
          console.warn('No data or not enough entries');
        }
      });
  }, []);

  useEffect(() => {
    if (businesses.length > 0) {
      const savedFood = getFromLocalStorage<any>('saved_generated_food');
      const savedActivity = getFromLocalStorage<any>('saved_generated_activity');
      const savedPlace = getFromLocalStorage<any>('saved_generated_place');
  
      if (savedFood || savedActivity || savedPlace) {
        if (savedFood) setFood(savedFood);
        if (savedActivity) setActivity(savedActivity);
        if (savedPlace) setPlace(savedPlace);
      } else {
        generateRandom();
      }
    }
  }, [filteredBusinesses]);

  useEffect(() => {
    const token = localStorage.getItem('token');
  
    if (!token) return;
  
    fetch('/api/user/profile', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => {
        const prefs = data?.data?.preferences;
        if (prefs) {
          setUserPrefs({
            food: prefs.food || [],
            activities: prefs.activities || [],
            places: prefs.places || [],
          });
          console.log('Loaded explicit user preferences:', {
            food: prefs.food || [],
            activities: prefs.activities || [],
            places: prefs.places || []
          });
        }
      })
      .catch(err => console.error('Failed to fetch preferences:', err));
  }, []);


  const handleSelectLocation = (lngLat: { lng: number, lat: number }, radius: number) => {
    setSelectedLocation(lngLat);
    setFilterRadius(radius);
    
    if (businesses.length > 0) {
      console.log('Filtering businesses with radius:', radius, 'miles');
      console.log('Selected location:', lngLat);
      
      //filter businesses that are within the radius
      const filtered = businesses.filter(business => {
        if (!business.latitude || !business.longitude) {
          console.log('Business missing coordinates:', business.name);
          return false;
        }
        
        const distance = calculateDistance(
          business.latitude,
          business.longitude,
          lngLat.lat,
          lngLat.lng
        );
        
        console.log(`Distance for ${business.name}: ${distance.toFixed(2)} miles`);
        return distance <= radius;
      });
      
      console.log(`Found ${filtered.length} businesses within ${radius} miles`);
      
      if (filtered.length > 0) {
        setFilteredBusinesses(filtered);
        generateRandomWithFiltered(filtered);
      } else {
        console.log('No businesses found within radius, showing all businesses');
        setFilteredBusinesses(businesses);
        generateRandomWithFiltered(businesses);
      }
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      handleSelectLocation(selectedLocation, filterRadius);
    }
  }, [filterRadius]);
  

 
  const isStrictlyInCategory = (
    business: any,
    include: string[],
    excludeGroups: string[][]
  ) => {
    if (!Array.isArray(business.categories)) return false;
    const aliases: string[] = business.categories.map((c: any) => c.alias.toLowerCase());
  return (
      aliases.some((alias: string) => include.includes(alias)) &&
      !excludeGroups.some(group => group.some(ex => aliases.includes(ex)))
    );
  };

  const matchesUserPrefs = (business: any, prefs: string[]) => {
    if (!prefs.length) return true;
    

    const titles = business.categories?.map((c: any) => `${c.title} ${c.alias}`.toLowerCase()) || [];
    
    //check if the user's explicit preferences match any business categories
    //only using the categories from initial preferences, not the additionalPreference (because
    //i havent found a way to categorize them into food, activity, place yet)
    const hasMatch = prefs.some(pref => {
      const lowerPref = pref.toLowerCase();
      return titles.some((title: string) => 
        title.includes(lowerPref) || 
        (lowerPref.endsWith('s') && title.includes(lowerPref.slice(0, -1))) ||
        (!lowerPref.endsWith('s') && title.includes(lowerPref + 's'))
      );
    });
    
    return hasMatch;
  };

  const pickStrict = (businesses: any[], include: string[], prefs: string[], ...excludeGroups: string[][]) => {
    //find businesses that match both the category type and user preferences
    const filtered = businesses.filter(b =>
      isStrictlyInCategory(b, include, excludeGroups) &&
      matchesUserPrefs(b, prefs)
    );
    
    if (filtered.length === 0) {
      const categoryMatches = businesses.filter(b => 
        isStrictlyInCategory(b, include, excludeGroups)
      );
      return categoryMatches[Math.floor(Math.random() * categoryMatches.length)] || null;
    }
    
    return filtered[Math.floor(Math.random() * filtered.length)] || null;
  };

  const generateRandomWithFiltered = (businessList: any[]) => {
    localStorage.removeItem('saved_generated_food');
    localStorage.removeItem('saved_generated_activity');
    localStorage.removeItem('saved_generated_place');

    if (selectedCategories.food) {
      setFood(pickStrict(businessList, foodAliases, userPrefs.food, activityAliases, placeAliases));
    }
    if (selectedCategories.activity) {
      setActivity(pickStrict(businessList, activityAliases, userPrefs.activities, foodAliases, placeAliases));
    }
    if (selectedCategories.place) {
      setPlace(pickStrict(businessList, placeAliases, userPrefs.places, foodAliases, activityAliases));
    }
  };

  const generateRandom = () => {
    generateRandomWithFiltered(filteredBusinesses);
  };

  const ItineraryCard = ({ label, item, onGenerate, icon }: any) => (
    <div className="bg-white shadow-lg rounded-xl p-4 my-3 w-full border border-gray-200 hover:shadow-xl transition-shadow">
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
        <div className="flex items-center">
          {icon}
          <h2 className="text-xl font-bold ml-2">{label}</h2>
        </div>
        <button 
          onClick={onGenerate} 
          className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-sm"
        >
          <RefreshCw size={16} className="mr-1" />
          Generate new suggestion
            </button>
          </div>
      
          {!item ? (
        <div className="flex justify-center items-center h-28">
          <p className="text-gray-500">Loading suggestions...</p>
        </div>
          ) : (
        <div className="flex gap-4">
          {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
          ) : (
            <div className="w-32 h-32 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">No Image</span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="font-bold text-lg">{item.name || 'Unnamed'}</h3>
            
            <div className="flex items-center mt-1 text-sm text-gray-600">
              <Phone size={14} className="mr-1" />
              <span>{formatPhone(item.phone)}</span>
            </div>
            
                {item.address && (
              <div className="mt-1 text-sm text-gray-600 flex">
                <MapPin size={14} className="mr-1 mt-1 flex-shrink-0" />
                  <div>
                    {Array.isArray(item.address) ? (
                      item.address.map((line: string, idx: number) => (
                        <p key={idx}>{line}</p>
                      ))
                    ) : (
                      <p>{item.address}</p>
                    )}
                </div>
                  </div>
                )}
            
                {item.rating && (
              <div className="mt-2 text-sm flex items-center gap-2">
                    {renderStars(item.rating)}
                {item.review_count && (
                  <span className="text-gray-500">• {item.review_count} Yelp reviews</span>
                )}
              </div>
            )}
            
            {renderCategories(item.categories)}
            {renderHours(item)}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Map Section */}
      <div className="w-1/2 h-full pt-16 pl-4 pr-2 pb-4">
        <MapboxNYC onSelectLocation={handleSelectLocation} />
      </div>
      
      {/* Itinerary Section */}
      <div className="w-1/2 h-full pt-16 pr-4 pl-2 pb-4 overflow-y-auto">
        <button
          onClick={() => router.back()}
          className="absolute top-20 left-10 text-xl font-bold text-black hover:text-gray-500 flex items-center"
        >
          ← Back
        </button>

        <div className="flex flex-col items-start mb-6">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">Personalized Itinerary</h1>
            <div className="relative group">
              <div className="cursor-help text-indigo-500 rounded-full border border-indigo-500 w-5 h-5 flex items-center justify-center">?</div>
              <div className="absolute z-20 bg-white p-3 rounded-lg shadow-lg w-72 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 left-0 top-full mt-2">
                <p className="text-gray-600">Recommendations based on your preferences. We match your food, activity, and place preferences to find the best options for you.</p>
              </div>
            </div>
          </div>

          <div className="mt-2 text-sm text-gray-600">
            <div className="flex items-center">
              <p className="font-medium">Using your selected preferences:</p>
              <div className="relative ml-1 group">
                <span className="cursor-help text-indigo-500">ⓘ</span>
                <div className="absolute z-10 bg-white p-2 rounded shadow-lg w-64 text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  Only using preferences from your initial profile setup. Additional preferences coming from your reviews are not used for this feature (yet).
                </div>
              </div>
            </div>
            <div className="mt-1 space-y-1">
              {userPrefs.food.length > 0 && (
                <p>• Food: {userPrefs.food.join(', ')}</p>
              )}
              {userPrefs.activities.length > 0 && (
                <p>• Activities: {userPrefs.activities.join(', ')}</p>
              )}
              {userPrefs.places.length > 0 && (
                <p>• Places: {userPrefs.places.join(', ')}</p>
              )}
              {userPrefs.food.length === 0 && userPrefs.activities.length === 0 && userPrefs.places.length === 0 && (
                <p className="italic">No preferences set - showing general recommendations</p>
              )}
            </div>
          </div>
          
          {selectedLocation && (
            <div className="mt-2 text-sm text-gray-600 flex items-center">
              <MapPin size={16} className="mr-1 text-indigo-600" />
              <span>
                Filtered to near the selected location
              </span>
            </div>
          )}
          
          <div className="flex gap-4 mt-4">
            {['food', 'activity', 'place'].map((cat) => (
              <label key={cat} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 accent-indigo-600"
                  checked={selectedCategories[cat as keyof typeof selectedCategories]}
                  onChange={(e) =>
                    setSelectedCategories(prev => ({
                      ...prev,
                      [cat]: e.target.checked,
                    }))
                  }
                />
                <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          {selectedCategories.food && (
            <ItineraryCard
              label="Restaurant"
              item={food}
              icon={<div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"><img src="/food-icon.svg" alt="Food" className="w-5 h-5" onError={(e: any) => {e.target.onerror = null; e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M18 8h1a4 4 0 0 1 0 8h-1'/%3E%3Cpath d='M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z'/%3E%3Cline x1='6' y1='1' x2='6' y2='4'/%3E%3Cline x1='10' y1='1' x2='10' y2='4'/%3E%3Cline x1='14' y1='1' x2='14' y2='4'/%3E%3C/svg%3E"}} /></div>}
              onGenerate={() => setFood(pickStrict(filteredBusinesses, foodAliases, userPrefs.food, activityAliases, placeAliases))}
            />
          )}
          
          {selectedCategories.activity && (
            <ItineraryCard
              label="Activity"
              item={activity}
              icon={<div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center"><img src="/activity-icon.svg" alt="Activity" className="w-5 h-5" onError={(e: any) => {e.target.onerror = null; e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%230ea5e9' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M12 6v6l4 2'/%3E%3C/svg%3E"}} /></div>}
              onGenerate={() => setActivity(pickStrict(filteredBusinesses, activityAliases, userPrefs.activities, foodAliases, placeAliases))}
            />
          )}
          
          {selectedCategories.place && (
            <ItineraryCard
              label="Place"
              item={place}
              icon={<div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center"><img src="/place-icon.svg" alt="Place" className="w-5 h-5" onError={(e: any) => {e.target.onerror = null; e.target.src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2322c55e' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z'/%3E%3Ccircle cx='12' cy='10' r='3'/%3E%3C/svg%3E"}} /></div>}
              onGenerate={() => setPlace(pickStrict(filteredBusinesses, placeAliases, userPrefs.places, foodAliases, activityAliases))}
            />
          )}
        </div>

<div className="mt-6 flex justify-center gap-20">
  <button
    onClick={generateRandom}
    className="bg-black hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
  >
    <RefreshCw size={18} className="mr-2" />
    Regenerate Full Itinerary
  </button>
  <button
    onClick={handleSaveItinerary}
    className="bg-black hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium flex items-center transition-colors"
  >
    Save Itinerary to Wishlist
  </button>
</div>
      </div>
    </div>
  );
}