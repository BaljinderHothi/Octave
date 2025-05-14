//profile page component that displays/manages user profile info
//includes pfp upload, username/email, preferences, lists (favorites and wishlist)

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Settings, ArrowLeft, Camera, CircleUserRound, UserCog } from 'lucide-react';
import Image from 'next/image';
import BadgeDisplay from '@/components/BadgeDisplay';  
import type { Badge } from '@/models/User';

import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';


interface UserProfile {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  zipCode: string;
  profilePicture: string;
  preferences: {
    food: string[];
    activities: string[];
    places: string[];
    custom: string[];
    additionalPreferences?: string[];
    implicitCategories?: string[];
  };
  favorites: any[];
  wishlist: any[];
  badges?: Badge[];
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [itineraries, setItineraries] = useState<any[]>([]);
  const groupItinerariesByMonth = (itineraries: any[]) => {
    return itineraries.reduce((groups: { [key: string]: any[] }, item) => {
      const monthKey = format(new Date(item.createdAt), 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(item);
      return groups;
    }, {});
  };
  const grouped = groupItinerariesByMonth(itineraries);
  const [openGroups, setOpenGroups] = useState<{ [key: string]: boolean }>({});
  const toggleGroup = (month: string) => {
    setOpenGroups(prev => ({ ...prev, [month]: !prev[month] }));
  };
  const handleDelete = async (id: string) => {
    const confirmed = window.confirm('Are you sure you want to delete this itinerary?');
    if (!confirmed) return;
  
    const token = localStorage.getItem('token');
    if (!token) return;
  
    try {
      const res = await fetch(`/api/itineraries?id=${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Delete failed');
  
      setItineraries(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete itinerary');
      console.error(err);
    }
  };

  //fetches user profile data from API
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const response = await fetch('/api/user/profile', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setProfile(data.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
  
    fetch('/api/itineraries', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (data.itineraries) {
          setItineraries(data.itineraries);
        }
      })
      .catch(err => console.error('Failed to load itineraries:', err));
  }, []);

  //handles photo upload: validates file type and size, appends to form data, sends to API
  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please upload an image file (JPEG, PNG, or GIF)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);

    try {
      //make sure to convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const base64Image = e.target?.result as string;
        
        const token = localStorage.getItem('token');
        if (!token) throw new Error('No authentication token found');

        const response = await fetch('/api/user/upload-profile-picture', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to upload photo');
        }

        setProfile(prev => prev ? { ...prev, profilePicture: data.data.profilePicture } : null);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert(err instanceof Error ? err.message : 'Failed to upload photo. Please try again.');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading profile...</div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl text-red-600">{error || 'Profile not found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {/* Header */}
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push("/")}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
            </div>
            <div className="flex space-x-2">
              <Link
                href="/userpreference"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700"
              >
                <UserCog className="h-4 w-4 mr-2" />
                Edit Preferences
              </Link>
              <Link
                href="/usersettings"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-700"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Link>
            </div>
          </div>

          {/* Profile Info */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-200">
                  {profile.profilePicture ? (
                    <Image
                      src={profile.profilePicture}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <CircleUserRound className="w-12 h-12" />
                    </div>
                  )}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-md hover:bg-gray-50"
                  disabled={uploadingPhoto}
                >
                  <Camera className="w-4 h-4 text-gray-600" />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  disabled={uploadingPhoto}
                />
              </div>
              <div>
                <h3 className="text-xl font-semibold">
                  {profile.firstName} {profile.lastName}
                </h3>
                <p className="text-gray-600">@{profile.username}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Email</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                <p className="mt-1 text-sm text-gray-900">{profile.zipCode}</p>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900">Preferences</h3>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {/* Food Preferences */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Food</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferences.food.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Activities */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Activities</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferences.activities.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Places */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900">Places</h4>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profile.preferences.places.map((item, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

                        {/* Implicit Categories */}
                        {profile.preferences.implicitCategories && profile.preferences.implicitCategories.length > 0 && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Based on Your Preferences Analysis</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.preferences.implicitCategories.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profile.preferences.additionalPreferences && profile.preferences.additionalPreferences.length > 0 && (
              <div className="mt-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium text-gray-900">Based on Your Recent Positive Reviews</h4>
                    <button
                      onClick={async () => {
                        const confirmed = window.confirm('Are you sure you want to clear your categories extracted from your recent positive reviews?');
                        if (!confirmed) return;

                        const token = localStorage.getItem('token');
                        if (!token) return;

                        try {
                          const response = await fetch('/api/user/clear-additional-preferences', {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });

                          if (!response.ok) {
                            throw new Error('Failed to clear additional preferences');
                          }

                          setProfile(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              preferences: {
                                ...prev.preferences,
                                additionalPreferences: []
                              }
                            };
                          });
                        } catch (err) {
                          console.error('Error clearing additional preferences:', err);
                          alert('Failed to clear additional preferences. Please try again.');
                        }
                      }}
                      className="text-sm text-red-600 hover:text-red-800 font-medium group relative"
                    >
                      Clear
                      <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Press to clear the categories extracted from your recent positive reviews to tidy up your recommendations page
                      </span>
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.preferences.additionalPreferences.map((item, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}



            {/* Custom Preferences */}
            {profile.preferences.custom.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-900">Additional Info</h4>
                <div className="mt-2 text-sm text-gray-600">
                  {profile.preferences.custom.map((item, index) => (
                    <p key={index}>{item}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lists Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Lists</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Favorites */}
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Favorites</h4>
                {profile.favorites.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.favorites.map((item: any, index: number) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No favorites yet</p>
                )}
              </div>

              {/* Wishlist */}
              <div className="mt-4">
                <h2 className="text-lg font-semibold mb-2">Wishlist</h2>
                {Object.entries(grouped).map(([month, items]) => (
                  <div key={month} className="mb-4 border rounded-lg">
                    <button
                      onClick={() => toggleGroup(month)}
                      className="w-full px-4 py-2 text-left font-medium bg-gray-100 hover:bg-gray-200 transition"
                    >
                      {month} ({items.length} saved)
                    </button>
                    {openGroups[month] && (
                      <div className="px-4 py-2 divide-y divide-gray-200 transition-all duration-300">
                        {items.map((item, idx) => (
                          <div key={idx} className="py-3">
                            <p><strong>Food:</strong> {item.food}</p>
                            <p><strong>Activity:</strong> {item.activity}</p>
                            <p><strong>Place:</strong> {item.place}</p>
                            <button
                              onClick={() => handleDelete(item._id)}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Badges Section */}
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <BadgeDisplay badges={profile.badges || []} />
          </div>

        </div>
      </div>
    </div>
  );
} 