//this is the service for handling badge functionality

import { BADGES } from '@/lib/badge-definitions';
import type { Badge } from '@/models/User';

export async function updateReviewBadges(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/user/badges', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch badges');
    
    const data = await response.json();
    let badges = data.data.badges;
    const reviewCount = data.data.reviewCount;
    
    let badgesChanged = false;
    let progressChanged = false;
    let newlyAcquiredBadge: Badge | null = null;
    
    const reviewBadges = Object.values(BADGES.REVIEWS);
    for (const badgeDef of reviewBadges) {
      const existingBadge = badges.find((b: Badge) => b.id === badgeDef.id);
      
      if (existingBadge) {
        if (!existingBadge.acquired) {
          if (existingBadge.progress) {
            if (existingBadge.progress.current !== reviewCount) {
              existingBadge.progress.current = reviewCount;
              progressChanged = true;
            }
          }
          
          if (reviewCount >= badgeDef.requirementCount) {
            existingBadge.acquired = true;
            existingBadge.dateAcquired = new Date();
            badgesChanged = true;
            newlyAcquiredBadge = {...existingBadge};
          }
        }
      }
    }
    
    //update badges if progress changed or new badge is acquired
    if (badgesChanged || progressChanged) {
      const updateResponse = await fetch('/api/user/badges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ badges })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update badges');
      
      const result = await updateResponse.json();
      return { 
        updatedBadges: result.data.badges,
        newBadge: newlyAcquiredBadge
      };
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error updating badges:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkPreferenceBadges(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');

    const response = await fetch('/api/user/profile', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) throw new Error('Failed to fetch user profile');
    
    const userData = await response.json();
    const preferences = userData.data.preferences;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    
    const preferenceMasterBadge = badges.find((b: Badge) => b.id === BADGES.PROFILE.PREFERENCE_MASTER.id);
    
    if (preferenceMasterBadge && !preferenceMasterBadge.acquired) {
      const hasFood = preferences.food && preferences.food.length > 0;
      const hasActivities = preferences.activities && preferences.activities.length > 0;
      const hasPlaces = preferences.places && preferences.places.length > 0;
      
      if (hasFood && hasActivities && hasPlaces) {
        preferenceMasterBadge.acquired = true;
        preferenceMasterBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...preferenceMasterBadge};
        
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking preference badges:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkRestaurantExplorerBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const reviewsResponse = await fetch('/api/reviews/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!reviewsResponse.ok) throw new Error('Failed to fetch user reviews');
    
    const reviewsData = await reviewsResponse.json();
    const userReviews = reviewsData.data;
    
    const uniqueRestaurants = new Set();
    userReviews.forEach((review: any) => {
      if (review.businessId) {
        uniqueRestaurants.add(review.businessId);
      }
    });
    
    const uniqueRestaurantsCount = uniqueRestaurants.size;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    let progressUpdated = false;
    
    const restaurantExplorerBadge = badges.find((b: Badge) => b.id === BADGES.FOODIE.RESTAURANT_EXPLORER.id);
    
    if (restaurantExplorerBadge && !restaurantExplorerBadge.acquired) {
      if (restaurantExplorerBadge.progress) {
        if (restaurantExplorerBadge.progress.current !== uniqueRestaurantsCount) {
          restaurantExplorerBadge.progress.current = uniqueRestaurantsCount;
          progressUpdated = true;
        }
      }
      
      if (uniqueRestaurantsCount >= BADGES.FOODIE.RESTAURANT_EXPLORER.requirementCount) {
        restaurantExplorerBadge.acquired = true;
        restaurantExplorerBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...restaurantExplorerBadge};
        progressUpdated = true;
      }
      
      if (progressUpdated) {
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking restaurant explorer badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkCoffeeLoverBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const reviewsResponse = await fetch('/api/reviews/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!reviewsResponse.ok) throw new Error('Failed to fetch user reviews');
    
    const reviewsData = await reviewsResponse.json();
    const userReviews = reviewsData.data;
    
    const businessesPromises = userReviews.map(async (review: any) => {
      if (!review.businessId) return null;
      
      const businessResponse = await fetch(`/api/businesses/${review.businessId}`);
      if (!businessResponse.ok) return null;
      
      const businessData = await businessResponse.json();
      return businessData.data;
    });
    
    const businesses = await Promise.all(businessesPromises);
    
    const coffeeShops = new Set();
    businesses.forEach(business => {
      if (!business) return;
      
      const categories = business.categories || [];
      const isCoffeeShop = categories.some((category: any) => {
        if (typeof category !== 'string') return false;
        const categoryLower = category.toLowerCase();
        return categoryLower.includes('coffee') || 
               categoryLower.includes('café') || 
               categoryLower.includes('cafe');
      });
      
      if (isCoffeeShop) {
        coffeeShops.add(business._id);
      }
    });
    
    const coffeeShopCount = coffeeShops.size;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    let progressUpdated = false;
    
    const coffeeLoverBadge = badges.find((b: Badge) => b.id === BADGES.FOODIE.COFFEE_LOVER.id);
    
    if (coffeeLoverBadge && !coffeeLoverBadge.acquired) {
      if (coffeeLoverBadge.progress) {
        if (coffeeLoverBadge.progress.current !== coffeeShopCount) {
          coffeeLoverBadge.progress.current = coffeeShopCount;
          progressUpdated = true;
        }
      }
      
      if (coffeeShopCount >= BADGES.FOODIE.COFFEE_LOVER.requirementCount) {
        coffeeLoverBadge.acquired = true;
        coffeeLoverBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...coffeeLoverBadge};
        
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking coffee lover badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkDifferentCategoriesBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const reviewsResponse = await fetch('/api/reviews/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!reviewsResponse.ok) throw new Error('Failed to fetch user reviews');
    
    const reviewsData = await reviewsResponse.json();
    const userReviews = reviewsData.data;
    
    const businessesPromises = userReviews.map(async (review: any) => {
      if (!review.businessId) return null;
      
      const businessResponse = await fetch(`/api/businesses/${review.businessId}`);
      if (!businessResponse.ok) return null;
      
      const businessData = await businessResponse.json();
      return businessData.data;
    });
    
    const businesses = await Promise.all(businessesPromises);
    
    const uniqueCategories = new Set();
    businesses.forEach(business => {
      if (!business || !business.categories) return;
      
      business.categories.forEach((category: any) => {
        if (typeof category === 'string') {
          uniqueCategories.add(category.trim().toLowerCase());
        }
      });
    });
    
    const uniqueCategoriesCount = uniqueCategories.size;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    let progressUpdated = false;
    
    const differentCategoriesBadge = badges.find((b: Badge) => b.id === BADGES.EXPLORER.DIFFERENT_CATEGORIES.id);
    
    if (differentCategoriesBadge && !differentCategoriesBadge.acquired) {
      if (differentCategoriesBadge.progress) {
        if (differentCategoriesBadge.progress.current !== uniqueCategoriesCount) {
          differentCategoriesBadge.progress.current = uniqueCategoriesCount;
          progressUpdated = true;
        }
      }
      
      if (uniqueCategoriesCount >= BADGES.EXPLORER.DIFFERENT_CATEGORIES.requirementCount) {
        differentCategoriesBadge.acquired = true;
        differentCategoriesBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...differentCategoriesBadge};
        progressUpdated = true;
      }
      
      if (progressUpdated) {
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking different categories badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkNYCWandererBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const reviewsResponse = await fetch('/api/reviews/user', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!reviewsResponse.ok) throw new Error('Failed to fetch user reviews');
    
    const reviewsData = await reviewsResponse.json();
    const userReviews = reviewsData.data;
    
    const businessesPromises = userReviews.map(async (review: any) => {
      if (!review.businessId) return null;
      
      const businessResponse = await fetch(`/api/businesses/${review.businessId}`);
      if (!businessResponse.ok) return null;
      
      const businessData = await businessResponse.json();
      return businessData.data;
    });
    
    const businesses = await Promise.all(businessesPromises);
    
    const uniqueNeighborhoods = new Set();
    businesses.forEach(business => {
      if (!business || !business.location || !business.location.neighborhood) return;
      
      const neighborhood = business.location.neighborhood;
      if (typeof neighborhood === 'string') {
        uniqueNeighborhoods.add(neighborhood.trim().toLowerCase());
      }
    });
    
    const uniqueNeighborhoodsCount = uniqueNeighborhoods.size;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    let progressUpdated = false;
    
    const nycWandererBadge = badges.find((b: Badge) => b.id === BADGES.EXPLORER.NYC_WANDERER.id);
    
    if (nycWandererBadge && !nycWandererBadge.acquired) {
      if (nycWandererBadge.progress) {
        if (nycWandererBadge.progress.current !== uniqueNeighborhoodsCount) {
          nycWandererBadge.progress.current = uniqueNeighborhoodsCount;
          progressUpdated = true;
        }
      }
      
      if (uniqueNeighborhoodsCount >= BADGES.EXPLORER.NYC_WANDERER.requirementCount) {
        nycWandererBadge.acquired = true;
        nycWandererBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...nycWandererBadge};
        progressUpdated = true;
      }
      
      if (progressUpdated) {
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking NYC wanderer badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkFirstItineraryBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const itinerariesResponse = await fetch('/api/itineraries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!itinerariesResponse.ok) throw new Error('Failed to fetch user itineraries');
    
    const itinerariesData = await itinerariesResponse.json();
    const userItineraries = itinerariesData.data;
    const itineraryCount = userItineraries.length;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    
    const firstItineraryBadge = badges.find((b: Badge) => b.id === BADGES.SOCIAL.FIRST_ITINERARY.id);
    
    if (firstItineraryBadge && !firstItineraryBadge.acquired && itineraryCount > 0) {
      firstItineraryBadge.acquired = true;
      firstItineraryBadge.dateAcquired = new Date();
      newlyAcquiredBadge = {...firstItineraryBadge};
      
      const updateResponse = await fetch('/api/user/badges', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ badges })
      });
      
      if (!updateResponse.ok) throw new Error('Failed to update badges');
      
      const result = await updateResponse.json();
      return { 
        updatedBadges: result.data.badges,
        newBadge: newlyAcquiredBadge
      };
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking first itinerary badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

export async function checkMultipleItinerariesBadge(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const itinerariesResponse = await fetch('/api/itineraries', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!itinerariesResponse.ok) throw new Error('Failed to fetch user itineraries');
    
    const itinerariesData = await itinerariesResponse.json();
    const userItineraries = itinerariesData.data;
    const itineraryCount = userItineraries.length;
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!badgesResponse.ok) throw new Error('Failed to fetch badges');
    
    const badgesData = await badgesResponse.json();
    let badges = badgesData.data.badges;
    let newlyAcquiredBadge: Badge | null = null;
    
    const multipleItinerariesBadge = badges.find((b: Badge) => b.id === BADGES.SOCIAL.MULTIPLE_ITINERARIES.id);
    
    if (multipleItinerariesBadge && !multipleItinerariesBadge.acquired) {
      if (multipleItinerariesBadge.progress) {
        multipleItinerariesBadge.progress.current = itineraryCount;
      }
      
      if (itineraryCount >= BADGES.SOCIAL.MULTIPLE_ITINERARIES.requirementCount) {
        multipleItinerariesBadge.acquired = true;
        multipleItinerariesBadge.dateAcquired = new Date();
        newlyAcquiredBadge = {...multipleItinerariesBadge};
        
        const updateResponse = await fetch('/api/user/badges', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ badges })
        });
        
        if (!updateResponse.ok) throw new Error('Failed to update badges');
        
        const result = await updateResponse.json();
        return { 
          updatedBadges: result.data.badges,
          newBadge: newlyAcquiredBadge
        };
      }
    }
    
    return { updatedBadges: badges, newBadge: null };
  } catch (error) {
    console.error('Error checking multiple itineraries badge:', error);
    return { updatedBadges: [], newBadge: null };
  }
}

//check all badges at once 
export async function checkAllBadges(): Promise<{ updatedBadges: Badge[], newBadge: Badge | null }> {
  let currentBadges: Badge[] = [];
  
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('No authentication token found');
    
    const badgesResponse = await fetch('/api/user/badges', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (badgesResponse.ok) {
      const badgesData = await badgesResponse.json();
      currentBadges = badgesData.data.badges;
    } else {
      console.error('Could not fetch current badges');
      return { updatedBadges: [], newBadge: null };
    }
    
    try {
      const reviewBadgesResult = await updateReviewBadges();
      if (reviewBadgesResult.newBadge) {
        return reviewBadgesResult;
      }
      currentBadges = reviewBadgesResult.updatedBadges;
    } catch (err) {
      console.error('Error checking review badges:', err);
    }
    
    try {
      const restaurantBadgeResult = await checkRestaurantExplorerBadge();
      if (restaurantBadgeResult.newBadge) {
        return restaurantBadgeResult;
      }
      currentBadges = restaurantBadgeResult.updatedBadges;
    } catch (err) {
      console.error('Error checking restaurant explorer badge:', err);
    }
    
    try {
      const coffeeBadgeResult = await checkCoffeeLoverBadge();
      if (coffeeBadgeResult.newBadge) {
        return coffeeBadgeResult;
      }
      currentBadges = coffeeBadgeResult.updatedBadges;
    } catch (err) {
      console.error('Error checking coffee lover badge:', err);
    }
    
    try {
      const categoriesBadgeResult = await checkDifferentCategoriesBadge();
      if (categoriesBadgeResult.newBadge) {
        return categoriesBadgeResult;
      }
      currentBadges = categoriesBadgeResult.updatedBadges;
    } catch (err) {
      console.error('Error checking different categories badge:', err);
    }
    
    try {
      const neighborhoodsBadgeResult = await checkNYCWandererBadge();
      if (neighborhoodsBadgeResult.newBadge) {
        return neighborhoodsBadgeResult;
      }
      currentBadges = neighborhoodsBadgeResult.updatedBadges;
    } catch (err) {
      console.error('Error checking NYC wanderer badge:', err);
    }
    
    try {
      const preferenceBadgeResult = await checkPreferenceBadges();
      if (preferenceBadgeResult.newBadge) {
        return preferenceBadgeResult;
      }
      currentBadges = preferenceBadgeResult.updatedBadges;
    } catch (err) {
      console.error('Error checking preference badges:', err);
    }
    
    //return the current badges
    return { updatedBadges: currentBadges, newBadge: null };
  } catch (error) {
    console.error('Error checking all badges:', error);
    return { updatedBadges: currentBadges.length > 0 ? currentBadges : [], newBadge: null };
  }
} 