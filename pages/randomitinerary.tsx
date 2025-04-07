import { useEffect, useState } from 'react';

export default function RandomItinerary() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [food, setFood] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  
  const foodAliases = ['restaurants','italian', 'mexican', 'sushi', 'bbq', 'vegan', 'fast food', 'pizza', 'indian', 'latin fusion', 'taco']
  const activityAliases = ['billiards', 'poolhalls', 'bowling', 'rockclimbing', 'painting', 'rock climbing', 'movies', 'swimming', 'dancing']
  const placeAliases = ['parks', 'museums', 'landmarks', 'beaches', 'zoos', 'libraries']

  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    return match ? `+1 (${match[1]}) ${match[2]}-${match[3]}` : phone;
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

  const isStrictlyInCategory = (
    business: any,
    include: string[],
    excludeGroups: string[][]
  ) => {
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
    setFood(pickStrict(foodAliases, activityAliases, placeAliases))
    setActivity(pickStrict(activityAliases, foodAliases, placeAliases))
    setPlace(pickStrict(placeAliases, foodAliases, activityAliases))
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-2">
      <h1 className="text-3xl font-bold mb-100">Randomly Generated Itinerary:</h1>

      {[
        { label: 'Food', item: food, set: () => setFood(pickStrict(foodAliases, activityAliases, placeAliases)) },
        { label: 'Activity', item: activity, set: () => setActivity(pickStrict(activityAliases, foodAliases, placeAliases)) },
        { label: 'Place', item: place, set: () => setPlace(pickStrict(placeAliases, foodAliases, activityAliases)) },
      ].map(({ label, item, set }) => (
        <div
          key={label}
          className="bg-gray-100 shadow-lg rounded-xl p-2 my-2 w-full max-w-6xl border border-gray-200"
        >
          <div className="flex justify-between items-center mb-1">
            <h2 className="text-2xl font-extrabold">{label}</h2>
            <button onClick={set} className="text-sm text-blue-700 hover:underline">
              Generate different suggestion
            </button>
          </div>
          {!item ? (
            <p>Click Generate!</p>
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
              </div>
            </div>
          )}
        </div>
      ))}

      <button
        onClick={() => generateRandom()}
        className="bg-black text-white px-6 py-3 rounded mt-6"
      >
        Regenerate Full Itinerary
      </button>
    </div>
  );
}
