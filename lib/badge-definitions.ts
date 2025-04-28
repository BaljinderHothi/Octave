//badge definitions 
import type { Badge } from '@/models/User';

export const BADGES = {
  REVIEWS: {
    FIRST_REVIEW: {
      id: 'first_review',
      name: 'First Steps',
      description: 'Posted your first review',
      icon: '📝',
      category: 'reviews',
      requirementCount: 1
    },
    FIVE_REVIEWS: {
      id: 'five_reviews',
      name: 'Regular Reviewer',
      description: 'Posted 5 reviews',
      icon: '⭐️',
      category: 'reviews',
      requirementCount: 5
    },
    TEN_REVIEWS: {
      id: 'ten_reviews',
      name: 'Review Expert',
      description: 'Posted 10 reviews',
      icon: '🏆',
      category: 'reviews',
      requirementCount: 10
    }
  },
  PROFILE: {
    COMPLETE_PROFILE: {
      id: 'complete_profile',
      name: 'Profile Pro',
      description: 'Completed your profile information',
      icon: '👤',
      category: 'profile'
    },
    PREFERENCE_MASTER: {
      id: 'preference_master',
      name: 'Preference Master',
      description: 'Added preferences in all categories',
      icon: '🎯',
      category: 'profile'
    }
  },
  FOODIE: {
    RESTAURANT_EXPLORER: {
      id: 'restaurant_explorer',
      name: 'Restaurant Explorer',
      description: 'Reviewed 3 different restaurants',
      icon: '🍽️',
      category: 'food',
      requirementCount: 3
    },
    COFFEE_LOVER: {
      id: 'coffee_lover',
      name: 'Coffee Enthusiast',
      description: 'Reviewed 3 coffee shops',
      icon: '☕',
      category: 'food',
      requirementCount: 3
    }
  },
  EXPLORER: {
    DIFFERENT_CATEGORIES: {
      id: 'different_categories',
      name: 'Explorer',
      description: 'Visited 3 different business categories',
      icon: '🧭',
      category: 'exploration',
      requirementCount: 3
    },
    NYC_WANDERER: {
      id: 'nyc_wanderer',
      name: 'NYC Wanderer',
      description: 'Visited businesses in 5 different NYC neighborhoods',
      icon: '🗽',
      category: 'exploration',
      requirementCount: 5
    }
  },
  SOCIAL: {
    FIRST_ITINERARY: {
      id: 'first_itinerary',
      name: 'Planner',
      description: 'Created your first itinerary',
      icon: '📅',
      category: 'social'
    },
    MULTIPLE_ITINERARIES: {
      id: 'multiple_itineraries',
      name: 'Trip Master',
      description: 'Created 3 different itineraries',
      icon: '✈️',
      category: 'social',
      requirementCount: 3
    }
  }
};

export function initializeBadges(): Partial<Badge>[] {
  const badges: Partial<Badge>[] = [];
  
  Object.values(BADGES).forEach(category => {
    Object.values(category).forEach(badge => {
      const badgeObj: Partial<Badge> = {
        ...badge,
        acquired: false
      };
      
      //progress tracking
      if ('requirementCount' in badge) {
        badgeObj.progress = {
          current: 0,
          total: badge.requirementCount
        };
      }
      
      badges.push(badgeObj);
    });
  });
  
  return badges;
} 