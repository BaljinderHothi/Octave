import { useRouter } from 'next/router'
import { HelpCircle } from 'lucide-react'

export default function Itinerary() {
  const router = useRouter()

  const handleGenerate = () => {
    router.push('/generateditinerary')
  }

  const handleRandom = () => {
    router.push('/randomitinerary')
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl font-bold mb-1">What do you have in mind?</h1>
      <p className="text-gray-500 mb-8 text-sm text-center px-4">
        Let us generate an itinerary for you based on your preferences or explore a fun random day!
      </p>

      <div className="flex flex-col items-center gap-6">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGenerate}
            className="px-8 py-2 rounded-md text-white bg-black hover:bg-gray-800 transition"
          >
            Generate Personalized Itinerary
          </button>
          <div className="relative group">
            <HelpCircle className="w-5 h-5 text-indigo-500 cursor-help" />
            <div className="absolute z-20 bg-white p-3 rounded-lg shadow-lg w-64 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 left-7 top-0">
              <p className="font-medium text-gray-800 mb-1">Personalized Itinerary</p>
              <p className="text-gray-600">Recommendations based on your preferences. We match your food, activity, and place preferences to find the best options for you.</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleRandom}
            className="px-8 py-2 rounded-md text-white bg-black hover:bg-gray-800 transition"
          >
            Generate Random Itinerary
          </button>
          <div className="relative group">
            <HelpCircle className="w-5 h-5 text-indigo-500 cursor-help" />
            <div className="absolute z-20 bg-white p-3 rounded-lg shadow-lg w-64 text-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 left-7 top-0">
              <p className="font-medium text-gray-800 mb-1">Random Itinerary</p>
              <p className="text-gray-600">Completely random suggestions without using your preferences. Great for discovering new places outside your usual choices.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
