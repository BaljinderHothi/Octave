import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import type { Badge } from '@/models/User';    
import { useBadges } from '@/components/BadgeContext';
import { ArrowLeft } from 'lucide-react';

export default function Badges() {
  const router = useRouter();
  const { badges, isCheckingBadges, refreshBadges } = useBadges();
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    setIsChecking(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
      router.replace('/login?redirect=badges');
        return;
      }

    setIsAuthenticated(true);
    setIsChecking(false);
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

  const handleCheckAllBadges = async () => {
    try {
      setError(null);
      await refreshBadges();
    } catch (err) {
      console.error('Error checking badges:', err);
      setError(err instanceof Error ? err.message : 'Error checking for new badges');
    }
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

  return (
    <>
      <Head>
        <title>My Badges | Octave</title>
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
            <h1 className="text-3xl font-bold">My Badges</h1>
          </div>
          <button
            onClick={handleCheckAllBadges}
            disabled={isCheckingBadges}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCheckingBadges ? 'Checking...' : 'Check for New Badges'}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {badges.length === 0 ? (
          <div className="text-center py-10">
            <p>Loading badges...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
              <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="bg-gray-50 px-4 py-2 border-b">
                  <h2 className="text-lg font-medium flex items-center">
                    <span className="mr-2">{categoryInfo[category]?.icon || '🏆'}</span>
                    {categoryInfo[category]?.title || category.charAt(0).toUpperCase() + category.slice(1)}
                  </h2>
                </div>
                <div className="grid grid-cols-3 gap-2 p-4">
                  {categoryBadges.map(badge => (
                    <div 
                      key={badge.id} 
                      className={`relative p-3 rounded-lg border ${
                        badge.acquired 
                          ? 'border-green-200 bg-green-50' 
                          : 'border-gray-200 bg-gray-50 opacity-70'
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="text-3xl mb-2">{badge.icon}</div>
                        <div className="text-xs font-medium text-center">{badge.name}</div>
                        
                        {!badge.acquired && badge.progress && (
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                              className="bg-blue-500 h-1.5 rounded-full" 
                              style={{ 
                                width: `${Math.min(100, (badge.progress.current / badge.progress.total) * 100)}%` 
                              }}
                                ></div>
                              </div>
                        )}
                        
                        {badge.acquired && (
                          <div className="absolute top-1 right-1">
                            <span className="text-green-500 text-lg">✓</span>
                            </div>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
} 