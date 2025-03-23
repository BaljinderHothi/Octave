import { Soup } from 'lucide-react'

export default function Closed() {
  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-44px)] justify-center bg-gray-100">
      <Soup className="w-16 h-16 text-black" />
      <h1 className="text-5xl tracking-tight max-w-3xl font-semibold mb-4 mt-10">
        Welcome to Octave
      </h1>
      <p className="ml-4 text-gray-500 text-xl">
        Get your personalized NYC experience now.
      </p>
    </div>
  )
}