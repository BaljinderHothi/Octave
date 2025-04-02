//profile page component that displays/manages user profile info
//includes pfp upload, username/email, preferences, lists (favorites and wishlist)

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Settings, ArrowLeft, Camera, CircleUserRound } from 'lucide-react';
import Image from 'next/image';

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
  };
  favorites: any[];
  wishlist: any[];
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    <div className="min-h-screen bg-gray-100">
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
            <Link
              href="/userpreference"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Settings className="h-4 w-4 mr-2" />
              Edit Preferences
            </Link>
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
              <div className="border rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Wishlist</h4>
                {profile.wishlist.length > 0 ? (
                  <ul className="space-y-2">
                    {profile.wishlist.map((item: any, index: number) => (
                      <li key={index} className="text-sm text-gray-600">
                        {item.name}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-500">No items in wishlist</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 