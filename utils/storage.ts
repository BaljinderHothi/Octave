// Save and get from local storage, keep the itinerary from disappearing when user checks reviews

export function saveToLocalStorage<T>(key: string, value: T) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }
  
  export function getFromLocalStorage<T>(key: string): T | null {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(key);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
  