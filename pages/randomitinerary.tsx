// This page generates a fully randomized itinerary for the user, it is not based on their preferences.
// Users are able to regenerate the itinerary, or only one single option at a time.

import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { saveToLocalStorage, getFromLocalStorage } from '@/utils/storage';

export default function RandomItinerary() {
  const router = useRouter();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [food, setFood] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  const [selectedCategories, setSelectedCategories] = useState({food: true, activity: true,place: true});

  const foodAliases = ['restaurants', 'italian', 'mexican', 'sushi', 'bbq', 'vegan', 'fast food', 'pizza', 'indian', 'latin fusion', 'taco',
    'thai', 'chinese', 'mediterranean', 'greek', 'french', 'japanese', 'korean', 'vietnamese', 'lebanese', 'cuban', 
    'caribbean', 'ethiopian', 'afghan', 'turkish', 'noodles', 'burgers', 'ramen', 'steakhouse', 'seafood', 'southern',
    'middle eastern', 'brunch', 'brazilian', 'peruvian', 'tapas', 'dumplings', 'poke', 'halal', 'gluten free', 'comfort food',
    'street food', 'gastropub', 'new american', 'kebab', 'bagels', 'sandwiches', 'salad', 'food trucks', 'bistro', 'organic',
    'deli', 'creole', 'cajun', 'irish', 'german', 'nepalese', 'moroccan', 'pakistani', 'filipino', 'malaysian', 'fusion']
  const activityAliases = ['billiards', 'poolhalls', 'bowling', 'yoga', 'pilates','rockclimbing', 'painting', 'rock climbing', 'movies', 'swimming', 'dancing',
    'arcade', 'escape room', 'karaoke', 'golf', 'mini golf', 'go kart', 'trampoline park', 'laser tag', 'ice skating', 
    'roller skating', 'ziplining', 'pottery', 'wine tasting', 'beer tasting', 'board games',
    'virtual reality', 'indoor skydiving', 'archery', 'axe throwing']
  const placeAliases = ['parks', 'museums', 'landmarks', 'beaches', 'zoos', 'libraries',
    'gardens', 'aquariums', 'piers', 'observatories', 'monuments', 'cathedrals',
    'bridges', 'harbors', 'galleries', 'historic sites', 'botanical gardens', 'stadiums',
    'arenas', 'islands', 'memorials', 'conservatories']

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
  const renderHours = (business: any) => {
    const openHours = business.hours?.[0]?.open || [];
    const groupedByDay: { [key: number]: { start: string, end: string, is_overnight: boolean }[] } = {};
    for (const entry of openHours) {
      if (!groupedByDay[entry.day]) groupedByDay[entry.day] = [];
      groupedByDay[entry.day].push(entry);
    }
  
    return (
      <div className="mt-0.5">
        <div className="flex items-center gap-4 mt-2">
        <button
          onClick={() => setShowHours(prev => ({ ...prev, [business.id]: !prev[business.id] }))}
          className="text-blue-600 hover:underline text-sm"
        >
          {showHours[business.id] ? 'Hide Hours' : 'Show Hours'}
        </button>
        <button
        onClick={() => {
          saveToLocalStorage('saved_food', food);
          saveToLocalStorage('saved_activity', activity);
          saveToLocalStorage('saved_place', place);
          router.push(`/business/${business.id}`);
        }}
        className="text-blue-600 hover:underline text-sm"
        >
        Reviews
        </button>
      </div>

        {showHours[business.id] && (
          <ul className="mt-1 ml-1 text-sm text-gray-700">
            {Object.entries(groupedByDay).map(([day, entries]: [string, any[]]) => (
              <li key={day}>
                {daysOfWeek[parseInt(day)]}:{" "}
                {entries.map((e, idx) => `${formatTime(e.start)} – ${formatTime(e.end)}${e.is_overnight ? ' (Overnight)' : ''}`)
                  .join(', ')}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  

  const renderStars = (rating: number) => {
    return (
      <span className="flex items-center gap-1 text-yellow-500 font-bold">
        {rating.toFixed(1)}
        <span className="text-yellow-500">★</span>
      </span>
    );
  };

  const renderCategories = (categories: any[]) => {
    if (!Array.isArray(categories) || categories.length === 0) return null;

    return (
      <div className="mt-1 text-sm text-gray-700">
        <strong>Categories:</strong>{' '}
        {categories.map((cat, idx) => (
          <span key={idx}>
            {cat.title}
            {idx < categories.length - 1 ? ', ' : ''}
          </span>
        ))}
      </div>
    );
  };

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data) && data.data.length >= 3) {
          setBusinesses(data.data);
        } else {
          console.warn('No data or not enough entries');
        }
      });
  }, []);

  useEffect(() => {
    if (businesses.length > 0) {
      const savedFood = getFromLocalStorage<any>('saved_food');
      const savedActivity = getFromLocalStorage<any>('saved_activity');
      const savedPlace = getFromLocalStorage<any>('saved_place');
  
      if (savedFood || savedActivity || savedPlace) {
        if (savedFood) setFood(savedFood);
        if (savedActivity) setActivity(savedActivity);
        if (savedPlace) setPlace(savedPlace);
      } else {
        generateRandom();
      }
    }
  }, [businesses]);
  

  const isStrictlyInCategory = (business: any, include: string[], excludeGroups: string[][]) => {
    if (!Array.isArray(business.categories)) return false
    const aliases: string[] = business.categories.map((c: any) => c.alias.toLowerCase())
    return (
      aliases.some((alias: string) => include.includes(alias)) &&
      !excludeGroups.some(group => group.some(ex => aliases.includes(ex)))
    )
  }

  const pickStrict = (include: string[], ...excludeGroups: string[][]) => {
    const filtered = businesses.filter(b =>
      isStrictlyInCategory(b, include, excludeGroups)
    )
    return filtered[Math.floor(Math.random() * filtered.length)] || null
  }

  const generateRandom = () => {
    localStorage.removeItem('saved_food');
    localStorage.removeItem('saved_activity');
    localStorage.removeItem('saved_place');
  
    if (selectedCategories.food) setFood(pickStrict(foodAliases, activityAliases, placeAliases));
    if (selectedCategories.activity) setActivity(pickStrict(activityAliases, foodAliases, placeAliases));
    if (selectedCategories.place) setPlace(pickStrict(placeAliases, foodAliases, activityAliases));
  }
  const ItineraryCard = ({ label, item, onGenerate }: any) => (
    <div className="bg-gray-100 shadow-lg rounded-xl p-2 my-2 w-full max-w-6xl border border-gray-200">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-2xl font-extrabold">{label}</h2>
        <button onClick={onGenerate} className="text-md text-blue-700 hover:underline">
          Generate different suggestion
        </button>
      </div>
      {!item ? (
        <p>Loading...</p>
      ) : (
        <div className="flex gap-5">
          {item.image_url && (
            <img
              src={item.image_url}
              alt={item.name}
              className="w-28 h-28 object-cover rounded"
            />
          )}
          <div>
            <p className="font-semibold">{item.name || 'Unnamed'}</p>
            <p>{formatPhone(item.phone)}</p>
            {item.address && (
              <div>
                {item.address.map((line: string, idx: number) => (
                  <p key={idx}>{line}</p>
                ))}
              </div>
            )}
            {item.rating && (
              <div className="mt-1 text-sm text-gray-800 flex items-center gap-2">
                {renderStars(item.rating)}
                {item.review_count && (
                  <span className="text-gray-500">• {item.review_count} reviews</span>
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
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-2">
      <button
        onClick={() => router.back()}
        className="absolute top-20 left-10 text-2xl font-bold text-black hover:text-gray-500"
      >
        ← Back
      </button>

      <h1 className="text-3xl font-bold mb-100">Randomly Generated Itinerary:</h1>

      <div className="flex gap-4 mb-6 mt-6">
        {['food', 'activity', 'place'].map((cat) => (
          <label key={cat} className="flex items-center gap-2">
            <input
              type="checkbox"
              className="w-5 h-5"
              checked={selectedCategories[cat as keyof typeof selectedCategories]}
              onChange={(e) =>
                setSelectedCategories(prev => ({
                  ...prev,
                  [cat]: e.target.checked,
                }))
              }
            />
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </label>
        ))}
      </div>

      {selectedCategories.food && (
        <ItineraryCard
          label="Food"
          item={food}
          onGenerate={() => setFood(pickStrict(foodAliases, activityAliases, placeAliases))}
        />
      )}
      {selectedCategories.activity && (
        <ItineraryCard
          label="Activity"
          item={activity}
          onGenerate={() => setActivity(pickStrict(activityAliases, foodAliases, placeAliases))}
        />
      )}
      {selectedCategories.place && (
        <ItineraryCard
          label="Place"
          item={place}
          onGenerate={() => setPlace(pickStrict(placeAliases, foodAliases, activityAliases))}
        />
      )}

      <button
              onClick={() => generateRandom()}
              className="bg-black text-white px-6 py-3 rounded mt-6"
            >
              Regenerate Full Itinerary
            </button>
          </div>
        );
      }