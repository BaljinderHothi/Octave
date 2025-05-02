import { useRouter } from 'next/router'

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
        <button
          onClick={handleGenerate}
          className="px-8 py-2 rounded-md text-white bg-black hover:bg-gray-800 transition"
        >
          Generate Personalized Itinerary
        </button>

        <button
          onClick={handleRandom}
          className="px-8 py-2 rounded-md text-white bg-black hover:bg-gray-800 transition"
        >
          Generate Random Itinerary
        </button>
      </div>
    </section>
  )
}
