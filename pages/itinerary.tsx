import { useState, ChangeEvent, KeyboardEvent } from 'react'
import { useRouter } from 'next/router'

export default function Itinerary() {
  const router = useRouter()
  const [form, setForm] = useState({
    food: false,
    activity: false,
    place: false,
    other: false,
    foodInput: '',
    activityInput: '',
    placeInput: '',
    otherInput: '',
    foodTags: [] as string[],
    activityTags: [] as string[],
    placeTags: [] as string[],
    otherTags: [] as string[]
  })

  const labelClass = "text-lg font-semibold text-gray-800"
  const inputClass = "mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  const boxClass = "border rounded-md p-4 bg-white shadow-sm space-y-3 w-full max-w-xs"
  const sectionClass = "flex flex-col items-center justify-center min-h-screen bg-gray-100"

  const handleCheckbox = (category: 'food' | 'activity' | 'place' | 'other') => {setForm(prev => ({ ...prev, [category]: !prev[category] }))}

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>, listKey: keyof typeof form, inputKey: keyof typeof form) => {
    if (e.key === 'Enter' && (form[inputKey] as string).trim() !== '') {
      e.preventDefault()
      setForm(prev => ({
        ...prev,
        [listKey]: [...(prev[listKey] as string[]), (prev[inputKey] as string).trim()],
        [inputKey]: ''
      }))
    }
  }

  const removeTag = (category: keyof typeof form, index: number) => {
    setForm(prev => ({
      ...prev,
      [category]: (prev[category] as string[]).filter((_, i) => i !== index)
    }))
  }

  const renderTags = (items: string[], category: keyof typeof form) => (
    <div className="flex flex-wrap gap-2">
      {items.map((item, i) => (
        <span key={i} className="flex items-center bg-blue-600 text-white text-sm px-2 py-1 rounded-full">
          <button
            type="button"
            className="mr-1 text-white font-bold"
            onClick={() => removeTag(category, i)}
          >
            ×
          </button>
          {item}
        </span>
      ))}
    </div>
  )

  const handleGenerate = () => {router.push('/generateditinerary')}
  const handleRandom = () => {router.push('/randomitinerary')}

  return (
    <section className={sectionClass}>
      <h1 className="text-3xl font-bold mb-1">What do you have in mind?</h1>
      <p className="text-gray-500 mb-8 text-sm text-center px-4">Check categories and let us generate an itinerary for you!</p>
      <div className="flex gap-6 flex-wrap justify-center mb-8">
        <div className={boxClass}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.food} onChange={() => handleCheckbox('food')} />
            <span className={labelClass}>Food</span>
          </label>
          <p className="text-sm text-gray-600">Feeling hungry? Type a cuisine or a dish, or let us select based on your preferences:</p>
          <input type="text" name="foodInput" value={form.foodInput} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'foodTags', 'foodInput')} placeholder="Type a Cuisine or restaurant" className={inputClass} />
          {renderTags(form.foodTags, 'foodTags')}
        </div>

        <div className={boxClass}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.activity} onChange={() => handleCheckbox('activity')} />
            <span className={labelClass}>Activity</span>
          </label>
          <p className="text-sm text-gray-600">Feeling active or sporty? Type an activity, or let us select based on your preferences:</p>
          <input type="text" name="activityInput" value={form.activityInput} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'activityTags', 'activityInput')} placeholder="Type an activity" className={inputClass} />
          {renderTags(form.activityTags, 'activityTags')}
        </div>

        <div className={boxClass}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.place} onChange={() => handleCheckbox('place')} />
            <span className={labelClass}>Place</span>
          </label>
          <p className="text-sm text-gray-600">A Place to walk around? Type a place, or let us select based on your preferences:</p>
          <input type="text" name="placeInput" value={form.placeInput} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'placeTags', 'placeInput')} placeholder="Type a place/Park" className={inputClass} />
          {renderTags(form.placeTags, 'placeTags')}
        </div>

        <div className={boxClass}>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.other} onChange={() => handleCheckbox('other')} />
            <span className={labelClass}>Other</span>
          </label>
          <p className="text-sm text-gray-600">Looking for something else? Feel free to write below and we will try to include it in itinerary:</p>
          <input type="text" name="otherInput" value={form.otherInput} onChange={handleChange} onKeyDown={e => handleKeyDown(e, 'otherTags', 'otherInput')} placeholder="Type keywords for anything" className={inputClass} />
          {renderTags(form.otherTags, 'otherTags')}
        </div>
      </div>

      <button onClick={handleGenerate} className="px-8 py-2 rounded-md text-white bg-black">Generate Itinerary</button>
      <hr className="w-3/4 my-8 border-gray-300" />
      <p className="text-sm text-gray-500 mb-2 text-center">Not sure what you want to do? Click <b>"Generate Random Itinerary"</b> and let us generate a fun day for you!</p>
      <button onClick={handleRandom} className="px-8 py-2 rounded-md text-white bg-black">Generate Random Itinerary</button>
    </section>
  )
}
