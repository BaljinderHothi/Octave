// This is the User Preference Page, basically Sign Up page II. Where users enter their preferences by either checking boxes, or writing it generating a tag.
// Users can come back to this page from "Profile" after registeration to adjust their preferences.
// This page routes the user to the "Homepage", or back to registeration form "sign up" page if they click "back".


import { useState, ChangeEvent, KeyboardEvent, useEffect } from 'react'
import { useRouter } from 'next/router'
import BadgeNotification from '@/components/BadgeNotification'
import { checkPreferenceBadges } from '@/services/badgeService'
import type { Badge } from '@/models/User'

export default function UserPreference() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isNewUser, setIsNewUser] = useState(false)
  const [newBadge, setNewBadge] = useState<Badge | null>(null)
  const [clearingCategories, setClearingCategories] = useState(false)
  const [clearStatus, setClearStatus] = useState('')
  const [currentImplicitCategories, setCurrentImplicitCategories] = useState<string[]>([])


  const [form, setForm] = useState({
    food: [] as string[],
    activity: [] as string[],
    places: [] as string[],
    otherFood: '',
    otherActivity: '',
    otherPlaces: '',
    otherFoodList: [] as string[],
    otherActivityList: [] as string[],
    otherPlacesList: [] as string[],
    tellUsMore: ''
  })


 
  useEffect(() => {
    const loadPreferences = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        //verify the current user and update localStorage
        const userResponse = await fetch('/api/user/current', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (userResponse.ok) {
          const userData = await userResponse.json()
          const currentUserId = userData.user._id
          //update localStorage with verified user ID
          localStorage.setItem('userId', currentUserId)
        } else {
          throw new Error('Failed to verify user identity')
        }

        const response = await fetch('/api/user/preferences', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          

          //we have to properly remove duplicates from the data
          //use Set and convert to array
          const uniqueFood = Array.from(new Set<string>(data.data.food || []))
          const uniqueActivities = Array.from(new Set<string>(data.data.activities || []))
          const uniquePlaces = Array.from(new Set<string>(data.data.places || []))
          
          //set the current implicit categories
          const implicitCategories = data.data.implicitCategories || []
          setCurrentImplicitCategories(implicitCategories)
          console.log('Current implicit categories:', implicitCategories)

          setForm(prev => ({
            ...prev,
            food: uniqueFood.filter(item => ["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"].includes(item)),
            activity: uniqueActivities.filter(item => ["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"].includes(item)),
            places: uniquePlaces.filter(item => ["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"].includes(item)),
            otherFoodList: uniqueFood.filter(item => !["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"].includes(item)),
            otherActivityList: uniqueActivities.filter(item => !["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"].includes(item)),
            otherPlacesList: uniquePlaces.filter(item => !["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"].includes(item)),
            tellUsMore: data.data.custom?.[0] || ''
          }))
          setIsNewUser(false)
        } else {
          setIsNewUser(true)
        }
      } catch (err) {
        console.error('Error loading preferences:', err)
        setIsNewUser(true)
      } finally {
        setIsAuthenticated(true)
        setLoading(false)
      }
    }

    loadPreferences()
  }, [router])

  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }


  if (!isAuthenticated) {
    return null
  }


  const inputClass = "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  const labelClass = "block text-xl font-semibold text-gray-800"
  const boxClass = "border rounded-md p-4 bg-white shadow-sm space-y-3 w-full max-w-xs"
  const sectionClass = "flex flex-col items-center justify-center min-h-screen"


  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        throw new Error('No authentication token found')
      }

      //verify current user ID before proceeding
      const userResponse = await fetch('/api/user/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!userResponse.ok) {
        throw new Error('Failed to verify user identity')
      }
      
      const userData = await userResponse.json()
      const verifiedUserId = userData.user._id
      localStorage.setItem('userId', verifiedUserId)

      //here, we're processing the tellUsMore text/"custom" attribute in mongodb
      //and extracting implicit categories from the freeform text
      if (form.tellUsMore.trim()) {
        // First, clear any existing implicit categories
        try {
          console.log('Clearing existing implicit categories.');
          setClearingCategories(true);
          setClearStatus('Clearing previous generated preferences...');
          const clearResponse = await fetch('/api/user/clear-implicit-categories', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!clearResponse.ok) {
            console.error('Failed to clear implicit categories');
            const clearData = await clearResponse.json();
            console.error('Clear categories error:', clearData);
            setClearStatus('Failed to clear previous generated preferences');
          } else {
            console.log('Implicit categories cleared successfully');
            setClearStatus('Previous generated preferences cleared successfully');
          }
        } catch (clearError) {
          console.error('Error clearing implicit categories:', clearError);
          setClearStatus('Error clearing previous generated preferences');
        } finally {
          setClearingCategories(false);
        }

        //process the new text to extract new implicit categories
        console.log('Sending request to process preferences:', {
          userId: verifiedUserId,
          text: form.tellUsMore
        });

        //call endpoint to process the text
        const processResponse = await fetch('https://octavefinalhybrid.onrender.com/api/process-preferences', {
        // const processResponse = await fetch('http://127.0.0.1:5000/api/process-preferences', { 
          method: 'POST',
          mode: 'cors',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            userId: verifiedUserId,
            text: form.tellUsMore
          })
        })

        if (!processResponse.ok) {
          const data = await processResponse.json()
          console.error('Process preferences error:', data)
          throw new Error(data.message || 'Failed to process text preferences')
        }

        const processData = await processResponse.json()
        console.log('Process preferences response:', processData)
      }

      //make sure no duplicates happen when combining the checklist and custom preferences
      const uniqueFood = Array.from(new Set<string>([...form.food, ...form.otherFoodList]))
      const uniqueActivities = Array.from(new Set<string>([...form.activity, ...form.otherActivityList]))
      const uniquePlaces = Array.from(new Set<string>([...form.places, ...form.otherPlacesList]))

      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          food: uniqueFood,
          activities: uniqueActivities,
          places: uniquePlaces,
          custom: form.tellUsMore ? [form.tellUsMore] : []
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save preferences')
      }

      const { newBadge: earnedBadge } = await checkPreferenceBadges();
      if (earnedBadge) {
        setNewBadge(earnedBadge);
      }

      alert('Preferences saved successfully!')
      
      router.push('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push('/')
  }

  const toggleCheckbox = (category: 'food' | 'activity' | 'places', value: string) => {
    setForm(prev => ({
      ...prev, 
      [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]
    }))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, category: 'otherFoodList' | 'otherActivityList' | 'otherPlacesList', field: 'otherFood' | 'otherActivity' | 'otherPlaces') => {
    if (e.key === 'Enter' && form[field].trim() !== '') {
      e.preventDefault()
      setForm(prev => ({
        ...prev, 
        [category]: [...prev[category], prev[field].trim()], 
        [field]: ''
      }))

    }
  }

  const renderCheckboxes = (options: string[], category: 'food' | 'activity' | 'places') => (
    <div className="space-y-1">
      {options.map(option => (
        <label key={option} className="block text-sm text-gray-700">
          <input
            type="checkbox"
            checked={form[category].includes(option)}
            onChange={() => toggleCheckbox(category, option)}
            className="mr-2"
          />
          {option}
        </label>
      ))}
    </div>
  )

  const renderTags = (items: string[], category: 'otherFoodList' | 'otherActivityList' | 'otherPlacesList') => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
          <button
            type="button"
            className="mr-1 text-white font-bold"
            onClick={() =>

              setForm(prev => ({
                ...prev, 
                [category]: prev[category].filter((_, index) => index !== i)
              }))}

          >
            X
          </button>
          {item}
        </span>
      ))}
    </div>
  )

  return (
    <section className={sectionClass}>
      {/* Badge notification */}
      <BadgeNotification 
        newBadge={newBadge}
        onClose={() => setNewBadge(null)}
      />

      <h1 className="text-3xl font-bold mb-1">
        {isNewUser ? 'Tell us what you like!' : 'Update Your Preferences'}
      </h1>
      <p className="text-gray-500 mb-8 text-sm text-center px-4">
        {isNewUser 
          ? 'Select your preferences so we can personalize recommendations.'
          : 'Update your preferences to help us provide better recommendations.'}
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}


      <div className="flex gap-6 flex-wrap justify-center">
        <div className={boxClass}>
          <label className={labelClass}>Food Preferences:</label>
          <p className="text-sm text-gray-600">Favorite cuisines and dishes? You can add more in "Other"!</p>
          {renderCheckboxes(["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"], 'food')}

          <input 
            type="text" 
            name="otherFood" 
            value={form.otherFood} 
            onChange={handleChange} 
            onKeyDown={e => handleKeyDown(e, 'otherFoodList', 'otherFood')} 
            placeholder='Other (Type and press Enter)' 
            className={inputClass} 
          />

          {renderTags(form.otherFoodList, 'otherFoodList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Activities:</label>
          <p className="text-sm text-gray-600">What activities do you enjoy? You can add more in "Other"!</p>
          {renderCheckboxes(["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"], 'activity')}

          <input 
            type="text" 
            name="otherActivity" 
            value={form.otherActivity} 
            onChange={handleChange} 
            onKeyDown={e => handleKeyDown(e, 'otherActivityList', 'otherActivity')} 
            placeholder='Other (Type and press Enter)' 
            className={inputClass} 
          />

          {renderTags(form.otherActivityList, 'otherActivityList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Places to Visit:</label>
          <p className="text-sm text-gray-600">Favorite places to visit? You can add more in "Other"!</p>
          {renderCheckboxes(["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"], 'places')}

          <input 
            type="text" 
            name="otherPlaces" 
            value={form.otherPlaces} 
            onChange={handleChange} 
            onKeyDown={e => handleKeyDown(e, 'otherPlacesList', 'otherPlaces')} 
            placeholder='Other (Type and press Enter)' 
            className={inputClass} 
          />

          {renderTags(form.otherPlacesList, 'otherPlacesList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Tell Us More!:</label>
          <p className="text-sm text-gray-600">Did we miss anything? Feel free to write anything you'd like us to know about you</p>

          <textarea 
            name="tellUsMore" 
            value={form.tellUsMore} 
            onChange={handleChange} 
            rows={15} 
            className={inputClass} 
            placeholder="Tell us anything else you'd like us to know about you" 
          />
          
          {clearStatus && (
            <div className={`mt-2 text-xs ${clearStatus.includes('Failed') || clearStatus.includes('Error') ? 'text-red-600' : 'text-blue-600'}`}>
              {clearStatus}
            </div>
          )}
          
          {currentImplicitCategories.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700">Current detected preferences (will be reset):</p>
              <div className="flex flex-wrap gap-1 mt-1">
                {currentImplicitCategories.map((category, index) => (
                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 rounded-full">
                    {category}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-2 text-xs text-gray-500">
            <p className="font-semibold">Note:</p>
            <p>When you submit this form with text in this field, we'll reset your detected preferences and generate new ones based on your text.</p>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-8">

        <button 
          onClick={handleBack} 
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          Back
        </button>
        <button 
          onClick={handleSubmit} 
          disabled={loading}
          className="bg-black text-white px-6 py-2 rounded-md disabled:opacity-50"
        >
          {loading ? 'Saving...' : isNewUser ? 'Continue' : 'Save Changes'}
        </button>

      </div>
    </section>
  )
}