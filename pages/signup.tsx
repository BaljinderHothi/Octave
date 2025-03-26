// This is the sign up page where users can register their basic info (name, email, password, DOB, and Phone Number).
// Once a user finishes and clicks "continue", they will be routed to user preference page to complete their profile build.

import { useState, ChangeEvent, FormEvent } from 'react'
import { useRouter } from 'next/router'

export default function Signup() {
  const router = useRouter()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    zipCode: '',
    day: '',
    month: '',
    year: '',
    phone: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const validateForm = () => {
    if (!form.email || !form.password || !form.zipCode) {
      setError('Email, password, and zip code are required')
      return false
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    return true
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          username: form.username,
          email: form.email,
          password: form.password,
          zipCode: form.zipCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed')
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token)
      
      // Redirect to preferences page
      router.push('/userpreference')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const days = Array.from({ length: 31 }, (_, i) => i + 1)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const years = Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i)

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  const labelClass = "block text-sm font-medium text-gray-700"
  const selectClass = "flex-1 px-2 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-5">Create an Account</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input type="text" id="firstName" name="firstName" value={form.firstName} onChange={handleChange}
                className={inputClass} required />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input type="text" id="lastName" name="lastName" value={form.lastName} onChange={handleChange}
                className={inputClass} required />
            </div>
          </div>

          <label className={labelClass} htmlFor="username">Username</label>
          <input type="text" id="username" name="username" value={form.username} onChange={handleChange}
            className={inputClass} required />

          <label className={labelClass} htmlFor="email">Email</label>
          <input type="email" id="email" name="email" value={form.email} onChange={handleChange}
            className={inputClass} required />

          <label className={labelClass} htmlFor="password">Password</label>
          <input type="password" id="password" name="password" value={form.password} onChange={handleChange}
            className={inputClass} required />

          <label className={labelClass} htmlFor="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
            className={inputClass} required />

          <label className={labelClass} htmlFor="zipCode">Zip Code</label>
          <input type="text" id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange}
            className={inputClass} required />

          <label className={labelClass}>Date of Birth</label>
          <div className="flex gap-2">
            <select name="day" value={form.day} onChange={handleChange} className={selectClass} required>
              <option value="">Day</option>
              {days.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            <select name="month" value={form.month} onChange={handleChange} className={selectClass} required>
              <option value="">Month</option>
              {months.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select name="year" value={form.year} onChange={handleChange} className={selectClass} required>
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>

          <label className={labelClass} htmlFor="phone">Phone Number (Optional)</label>
          <input type="tel" id="phone" name="phone" value={form.phone} onChange={handleChange}
            className={inputClass} />

          <button 
            type="submit"
            disabled={loading}
            className={`w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'Creating Account...' : 'Continue'}
          </button>
        </form>
      </section>
    </div>
  )
}