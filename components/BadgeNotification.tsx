import { useEffect, useState } from 'react';
import type { Badge } from '@/models/User';

interface BadgeNotificationProps {
  newBadge: Badge | null;
  onClose: () => void;
}

export default function BadgeNotification({ newBadge, onClose }: BadgeNotificationProps) {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (newBadge) {
      setIsVisible(true);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); 
      }, 6000);
      
      return () => clearTimeout(timer);
    }
  }, [newBadge, onClose]);
  
  if (!newBadge) return null;
  
  return (
    <div 
      className={`fixed bottom-6 right-6 bg-white rounded-lg shadow-xl p-4 max-w-sm transition-all duration-300 transform ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
      } z-50`}
    >
      <div className="flex items-start">
        <div className="text-5xl mr-4">{newBadge.icon}</div>
        <div>
          <h3 className="font-bold text-lg">New Badge Unlocked! 🎉</h3>
          <p className="font-medium text-gray-800">{newBadge.name}</p>
          <p className="text-gray-600 text-sm mt-1">{newBadge.description}</p>
        </div>
      </div>
      <button 
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        className="mt-3 w-full py-1.5 bg-black text-white text-sm rounded hover:bg-gray-800"
      >
        Awesome!
      </button>
    </div>
  );
} 