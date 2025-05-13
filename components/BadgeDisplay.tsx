import { useState, useEffect } from 'react';
import type { Badge } from '@/models/User';
import Link from 'next/link';
import { useBadges } from '@/components/BadgeContext';

interface BadgeDisplayProps {
  badges?: Badge[];
}

export default function BadgeDisplay({ badges: propBadges }: BadgeDisplayProps) {
  const { badges: contextBadges } = useBadges();
  const badges = propBadges || contextBadges;
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, []);

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900">Badges & Achievements</h3>
        <Link
          href="/badges"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700"
        >
          View All Badges
        </Link>
      </div>
      
      {badges.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-sm text-gray-500">Loading badges...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(badgesByCategory).map(([category, categoryBadges]) => (
            <div key={category} className="bg-gray-50 rounded-lg p-4">
              <h4 className="text-sm font-medium mb-3 flex items-center">
                <span className="mr-1">{categoryInfo[category]?.icon || '🏆'}</span>
                {categoryInfo[category]?.title || category.charAt(0).toUpperCase() + category.slice(1)}
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {categoryBadges.map(badge => (
                  <div 
                    key={badge.id}
                    onClick={() => setSelectedBadge(badge)}
                    className={`cursor-pointer relative p-3 rounded-lg border ${
                      badge.acquired 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-gray-200 bg-gray-50 opacity-70'
                    }`}
                  >
                    <div className="flex flex-col items-center">
                      <div className="text-3xl mb-2" style={{ fontSize: '28px' }}>{badge.icon}</div>
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
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Badge detail */}
      {selectedBadge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <div className="mb-4 text-center">
              <div className="text-6xl mb-3">{selectedBadge.icon}</div>
              <h3 className="text-xl font-bold">{selectedBadge.name}</h3>
              <p className="text-gray-600 mt-1">{selectedBadge.description}</p>
            </div>
            
            {selectedBadge.progress && (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span>Progress</span>
                  <span>{selectedBadge.progress.current} / {selectedBadge.progress.total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-500 h-2.5 rounded-full" 
                    style={{ 
                      width: `${Math.min(100, (selectedBadge.progress.current / selectedBadge.progress.total) * 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            )}
            
            {selectedBadge.acquired && selectedBadge.dateAcquired && (
              <p className="text-sm text-gray-500 text-center">
                Earned on {new Date(selectedBadge.dateAcquired).toLocaleDateString()}
              </p>
            )}
            
            <button 
              onClick={() => setSelectedBadge(null)}
              className="mt-4 w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 