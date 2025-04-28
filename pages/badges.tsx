import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { Badge } from '@/models/User';    
import BadgeNotification from '@/components/BadgeNotification';
import { checkAllBadges } from '@/services/badgeService';

export default function Badges() {
  const router = useRouter();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        router.push('/login?redirect=badges');
        return;
      }

      const response = await fetch('/api/user/badges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.data.badges);
      setError(null);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAllBadges = async () => {
    try {
      setChecking(true);
      setError(null);
      
      const result = await checkAllBadges();
      
      if (result.newBadge) {
        setNewBadge(result.newBadge);
      }
      
      setBadges(result.updatedBadges);
    } catch (err) {
      console.error('Error checking badges:', err);
      setError(err instanceof Error ? err.message : 'Error checking for new badges');
    } finally {
      setChecking(false);
    }
  };

  const badgesByCategory: Record<string, Badge[]> = {};
  badges.forEach(badge => {
    if (!badgesByCategory[badge.category]) {
      badgesByCategory[badge.category] = [];
    }
    badgesByCategory[badge.category].push(badge);
  });

  const categoryInfo: Record<string, { icon: string, title: string }> = {
    reviews: { icon: '✍️', title: 'Reviews' },
    profile: { icon: '👤', title: 'Profile' },
    food: { icon: '🍔', title: 'Food Explorer' },
    exploration: { icon: '🧭', title: 'City Explorer' },
    social: { icon: '👥', title: 'Social' }
  };

  return (
    <>
      <Head>
        <title>My Badges | Octave</title>
      </Head>
      
      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Badges</h1>
          <button
            onClick={handleCheckAllBadges}
            disabled={checking || loading}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed"
          >
            {checking ? 'Checking...' : 'Check for New Badges'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-t-2 border-b-2 border-indigo-600 rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h2 className="text-xl font-semibold flex items-center">
                    <span className="text-2xl mr-2">{categoryInfo[category]?.icon || '🏅'}</span>
                    {categoryInfo[category]?.title || category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryBadges.map(badge => (
                    <div 
                      key={badge.id} 
                      className={`relative border rounded-lg p-4 ${
                        badge.acquired ? 'border-green-500 bg-green-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="text-4xl mr-4">{badge.icon}</div>
                        <div>
                          <h3 className="font-bold text-lg">{badge.name}</h3>
                          <p className="text-gray-600">{badge.description}</p>
                          
                          {badge.acquired ? (
                            <div className="mt-2 text-green-600 text-sm font-medium">
                              Acquired on {badge.dateAcquired ? new Date(badge.dateAcquired).toLocaleDateString() : 'Unknown date'}
                            </div>
                          ) : badge.progress ? (
                            <div className="mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div 
                                  className="bg-indigo-600 h-2.5 rounded-full" 
                                  style={{width: `${Math.min(100, (badge.progress.current / badge.progress.total) * 100)}%`}}
                                ></div>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">
                                {badge.progress.current} / {badge.progress.total}
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 text-gray-500 text-sm">
                              Not yet acquired
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {newBadge && <BadgeNotification newBadge={newBadge} onClose={() => setNewBadge(null)} />}
    </>
  );
} 