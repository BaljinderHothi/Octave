//Creates nav bar for user auth
//Links to home, itinerary, profile, settings, login/signup 

import { Soup, Settings, CircleUserRound, LogOut } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import Link from "next/link"

export default function Nav() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
    setIsLoading(false)
  }, [router.pathname]) 

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Logout failed')
      }

      localStorage.removeItem('token')
      setIsLoggedIn(false)
      
      router.push('/login')
    } catch (error) {
      console.error('Logout error:', error)
      localStorage.removeItem('token')
      setIsLoggedIn(false)
      router.push('/login')
    }
  }

  if (isLoading) {
    return (
      <nav className="flex w-full mx-auto py-3 justify-between px-6" style={{ backgroundColor: "#003049" }}>
        <div className="flex items-center">
          <Link href="/">
            <Soup className="w-6 h-6 text-white" />
          </Link>
        </div>
        <div className="text-white">Loading...</div>
      </nav>
    )
  }

  return (
    <nav className="flex w-full mx-auto py-3 justify-between px-6" style={{ backgroundColor: "#003049" }}>
      <div className="flex items-center">
        <Link href="/">
          <Soup className="w-6 h-6 text-white" />
        </Link>
      </div>
      <ul className="flex gap-8 items-center text-white text-sm">
        <li><Link href="/" className="hover:text-gray-300">Home</Link></li>
        <li><Link href="/itinerary" className="hover:text-gray-300">Itinerary</Link></li>
        {isLoggedIn ? (
          <>
            <li>
              <Link href="/userpreference" className="hover:text-gray-300">
                <Settings className="w-5 h-5 text-white" />
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-gray-300">
                <CircleUserRound className="w-5 h-5 text-white" />
              </Link>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="hover:text-gray-300 flex items-center gap-1"
              >
                <LogOut className="w-5 h-5 text-white" />
                <span>Logout</span>
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link href="/login" className="hover:text-gray-300">
                Login
              </Link>
            </li>
            <li>
              <Link href="/signup" className="hover:text-gray-300">
                Sign Up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  )
}