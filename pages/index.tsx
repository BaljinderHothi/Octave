import type { FC } from 'react'
import { Soup } from 'lucide-react'

export default function Home() {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <section className="flex flex-col w-full mx-auto py-7 justify-center bg-white">
        <p className="text-center">
          Discover the hidden gems of NYC with personalized recommendations. Start exploring today →
        </p>
      </section>
      <div className="flex flex-col w-full mx-auto justify-center pt-20 pb-16 font-semibold leading-6 tracking-tight max-w-[900px]">
        <h1 className="text-5xl max-w-3xl">
          Octave.
          <span className="ml-4 text-gray-500">
            Get your personalized NYC now.
          </span>
        </h1>
      </div>
      <section className="flex flex-col w-full mx-auto py-8 max-w-[900px]">
        <div className="bg-white p-8 rounded-lg shadow-md w-full">
          <h2 className="text-2xl font-semibold mb-6">Locations Database</h2>
          <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
            <p className="text-lg text-gray-500">Insert the locations from the database here</p>
            <p className="mt-2 text-sm text-gray-400">Database connection not yet established</p>
          </div>
        </div>
      </section>
    </div>
  )
}