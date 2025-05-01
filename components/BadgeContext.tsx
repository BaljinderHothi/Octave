import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/router';
import { 
  checkAllBadges, 
  checkProfileCompletionBadge, 
  updateReviewBadges, 
  checkPreferenceBadges, 
  checkRestaurantExplorerBadge, 
  checkCoffeeLoverBadge, 
  checkDifferentCategoriesBadge, 
  checkNYCWandererBadge 
} from '@/services/badgeService';
import type { Badge } from '@/models/User';

export type BadgeEventType = 
  | 'REVIEW_ADDED' 
  | 'REVIEW_DELETED' 
  | 'PROFILE_UPDATED' 
  | 'PREFERENCES_UPDATED' 
  | 'PROFILE_PICTURE_UPDATED'
  | 'MANUAL_CHECK'
  | 'INITIAL_LOAD';

interface BadgeContextType {
  badges: Badge[];
  newBadge: Badge | null;
  isCheckingBadges: boolean;
  refreshBadges: () => Promise<void>;
  checkBadgesForEvent: (eventType: BadgeEventType) => Promise<void>;
}

const BadgeContext = createContext<BadgeContextType | undefined>(undefined);

export function useBadges() {
  const context = useContext(BadgeContext);
  if (context === undefined) {
    throw new Error('useBadges must be used within a BadgeProvider');
  }
  return context;
}

interface BadgeProviderProps {
  children: ReactNode;
}

export function BadgeProvider({ children }: BadgeProviderProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [newBadge, setNewBadge] = useState<Badge | null>(null);
  const [isCheckingBadges, setIsCheckingBadges] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
  }, [router.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchBadges();
      checkBadgesForEvent('INITIAL_LOAD');
    }
  }, [isAuthenticated]);

  const fetchBadges = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('/api/user/badges', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) return;

      const data = await response.json();
      setBadges(data.data.badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
    }
  };

  const checkBadgesForEvent = async (eventType: BadgeEventType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      setIsCheckingBadges(true);
      let result;
      
      switch (eventType) {
        case 'REVIEW_ADDED':
        case 'REVIEW_DELETED':
          result = await updateReviewBadges();
          if (!result.newBadge) {
            const restaurantResult = await checkRestaurantExplorerBadge();
            if (restaurantResult.newBadge) {
              result = restaurantResult;
            } else {
              const coffeeResult = await checkCoffeeLoverBadge();
              if (coffeeResult.newBadge) {
                result = coffeeResult;
              } else {
                const categoriesResult = await checkDifferentCategoriesBadge();
                if (categoriesResult.newBadge) {
                  result = categoriesResult;
                } else {
                  const neighborhoodsResult = await checkNYCWandererBadge();
                  if (neighborhoodsResult.newBadge) {
                    result = neighborhoodsResult;
                  }
                }
              }
            }
          }
          break;
          
        case 'PROFILE_UPDATED':
          result = await checkProfileCompletionBadge();
          break;
          
        case 'PREFERENCES_UPDATED':
          result = await checkPreferenceBadges();
          if (!result.newBadge) {
            const profileResult = await checkProfileCompletionBadge();
            if (profileResult.newBadge) {
              result = profileResult;
            }
          }
          break;
          
        case 'PROFILE_PICTURE_UPDATED':
          result = await checkProfileCompletionBadge();
          break;
          
        case 'MANUAL_CHECK':
        case 'INITIAL_LOAD':
          result = await checkAllBadges();
          break;
          
        default:
          result = { updatedBadges: badges, newBadge: null };
      }
      
      if (result.newBadge) {
        setNewBadge(result.newBadge);
        
        setTimeout(() => {
          setNewBadge(null);
        }, 6000);
      }
      
      setBadges(result.updatedBadges);
    } catch (error) {
      console.error('Error checking badges:', error);
    } finally {
      setIsCheckingBadges(false);
    }
  };

  const refreshBadges = async () => {
    await checkBadgesForEvent('MANUAL_CHECK');
  };

  return (
    <BadgeContext.Provider value={{ badges, newBadge, isCheckingBadges, refreshBadges, checkBadgesForEvent }}>
      {children}
      {newBadge && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm">
            <div className="flex items-start">
              <div className="text-5xl mr-4">{newBadge.icon}</div>
              <div>
                <h3 className="font-bold text-lg">New Badge Unlocked! 🎉</h3>
                <p className="font-medium text-gray-800">{newBadge.name}</p>
                <p className="text-gray-600 text-sm mt-1">{newBadge.description}</p>
              </div>
            </div>
            <button 
              onClick={() => setNewBadge(null)}
              className="mt-3 w-full py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}
    </BadgeContext.Provider>
  );
} 