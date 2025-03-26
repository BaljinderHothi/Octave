// this is just a place holder as we figure out user auth
// just to make the current product look more like polished
// this file can be deleted or erased easily 

import { Soup } from 'lucide-react'
import Link from 'next/link'

export default function Login() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-44px)] bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Soup className="w-12 h-12" style={{ color: "#003049" }} />
        </div>
        <h1 className="text-2xl font-bold text-center mb-6">Sign in to Octave</h1>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{ backgroundColor: "#003049" }}
            >
              Sign in
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium" style={{ color: "#003049" }}>
              Sign up
            </Link>
          </p>
        </div>
      </div>
      
      <p className="mt-8 text-center text-sm text-gray-500">
        Continue your NYC adventure!
      </p>
    </div>
  )
}