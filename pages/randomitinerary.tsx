import { useEffect, useState } from 'react';

export default function RandomItinerary() {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [food, setFood] = useState<any>(null);
  const [activity, setActivity] = useState<any>(null);
  const [place, setPlace] = useState<any>(null);
  
  const formatPhone = (phone: string) => {
    if (!phone) return 'N/A';
    const match = phone.match(/^\+1(\d{3})(\d{3})(\d{4})$/);
    return match ? `+1 (${match[1]}) ${match[2]}-${match[3]}` : phone;
  };
  
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const emptyStars = 5 - fullStars;
    return (
      <span>
        {'★'.repeat(fullStars)}
        {'☆'.repeat(emptyStars)}
        <span className="ml-2 text-sm text-gray-600">({rating.toFixed(1)} / 5)</span>
      </span>
    );
  };

  useEffect(() => {
    fetch('/api/businesses')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data?.data) && data.data.length >= 3) {
          setBusinesses(data.data);
          generateRandom(data.data);
        } else {
          console.warn('No data or not enough entries');
        }
      });
  }, []);

  const pickRandom = () => businesses[Math.floor(Math.random() * businesses.length)];

  const generateRandom = (list = businesses) => {
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setFood(shuffled[0] || null);
    setActivity(shuffled[1] || null);
    setPlace(shuffled[2] || null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-2 py-2">
      <h1 className="text-3xl font-bold mb-100">Randomly Generated Itinerary:</h1>

      {[
        { label: 'Food', item: food, set: () => setFood(pickRandom()) },
        { label: 'Activity', item: activity, set: () => setActivity(pickRandom()) },
        { label: 'Place', item: place, set: () => setPlace(pickRandom()) },
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
