// This is the User Preference Page, basically Sign Up page II. Where users enter their preferences by either checking boxes, or writing it generating a tag.
// Users can come back to this page from "Profile" after registeration to adjust their preferences.
// This page routes the user to the "Homepage", or back to registeration form "sign up" page if they click "back".

import { useState, ChangeEvent, KeyboardEvent } from 'react'
import useRouter from 'next/router'

export default function UserPreference() {
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

  const inputClass = "mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  const labelClass = "block text-xl font-semibold text-gray-800"
  const boxClass = "border rounded-md p-4 bg-white shadow-sm space-y-3 w-full max-w-xs"
  const sectionClass = "flex flex-col items-center justify-center min-h-screen bg-gray-100"

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
  const handleSubmit = () => {useRouter.push('/')}
  const handleBack = () => {useRouter.push('/signup')}

  const toggleCheckbox = (category: 'food' | 'activity' | 'places', value: string) => {
    setForm(prev => ({
      ...prev, [category]: prev[category].includes(value)
        ? prev[category].filter(v => v !== value)
        : [...prev[category], value]}))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, category: 'otherFoodList' | 'otherActivityList' | 'otherPlacesList', field: 'otherFood' | 'otherActivity' | 'otherPlaces') => {
    if (e.key === 'Enter' && form[field].trim() !== '') {e.preventDefault()
      setForm(prev => ({...prev, [category]: [...prev[category], prev[field].trim()], [field]: ''}))
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
              setForm(prev => ({...prev, [category]: prev[category].filter((_, index) => index !== i)}))}
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
      <h1 className="text-3xl font-bold mb-1">Tell us what you like!</h1>
      <p className="text-gray-500 mb-8 text-sm text-center px-4">Select your preferences so we can personalize recommendations.</p>
      <div className="flex gap-6 flex-wrap justify-center">
        <div className={boxClass}>
          <label className={labelClass}>Food Preferences:</label>
          <p className="text-sm text-gray-600">Favorite cuisines and dishes? You can add more in "Other"!</p>
          {renderCheckboxes(["Italian", "Mexican", "Sushi", "BBQ", "Vegan", "Fast Food", "Pizza", "Indian", "Latin Fusion"], 'food')}
          <input type="text" name="otherFood" value={form.otherFood} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'otherFoodList', 'otherFood')} placeholder='Other (Type and press Enter)' className={inputClass} />
          {renderTags(form.otherFoodList, 'otherFoodList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Activities:</label>
          <p className="text-sm text-gray-600">What activities do you enjoy? You can add more in "Other"!</p>
          {renderCheckboxes(["Bowling", "Billiards", "Rock Climbing", "Night Life", "Movies", "Running", "Swimming", "Yoga", "Dancing"], 'activity')}
          <input type="text" name="otherActivity" value={form.otherActivity} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'otherActivityList', 'otherActivity')} placeholder='Other (Type and press Enter)' className={inputClass} />
          {renderTags(form.otherActivityList, 'otherActivityList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Places to Visit:</label>
          <p className="text-sm text-gray-600">Favorite places to visit? You can add more in "Other"!</p>
          {renderCheckboxes(["Museums", "Parks", "Zoos", "Landmarks", "Tourist Attractions", "Beaches", "Theaters", "Malls", "Libraries"], 'places')}
          <input type="text" name="otherPlaces" value={form.otherPlaces} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'otherPlacesList', 'otherPlaces')} placeholder='Other (Type and press Enter)' className={inputClass} />
          {renderTags(form.otherPlacesList, 'otherPlacesList')}
        </div>

        <div className={boxClass}>
          <label className={labelClass}>Tell Us More!:</label>
          <p className="text-sm text-gray-600">Did we miss anything? Feel free to write anything you'd like us to know about you</p>
          <textarea name="tellUsMore" value={form.tellUsMore} onChange={handleChange} rows={15} className={inputClass} placeholder="Tell us anything else you'd like us to know about you" />
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button onClick={handleBack} className="bg-black text-white px-6 py-2 rounded-md">Back</button>
        <button onClick={handleSubmit} className="bg-black text-white px-6 py-2 rounded-md">Continue</button>
      </div>
    </section>
  )
}