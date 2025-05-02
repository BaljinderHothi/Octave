// This page is for users to change their first/last name, username, email, password, Phone number, zip code after signing up.

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function Settings() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    zipCode: '',
    phone: ''
  });
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const inputClass = "mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none"
  const labelClass = "block text-sm font-medium text-gray-700"

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // fetch current user data
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/user/settings', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        const data = await response.json()
        
        if (data.success) {
          setFormData(prev => ({
            ...prev,
            firstName: data.data.firstName || '',
            lastName: data.data.lastName || '',
            username: data.data.username || '',
            email: data.data.email || '',
            zipCode: data.data.zipCode || '',
            phone: data.data.phone || ''
          }))
        } else {
          setError('Failed to fetch user data')
        }
      } catch (err) {
        setError('Error fetching user data')
      }
    }

    fetchUserData()
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError('')
    setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // validate passwords 
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          username: formData.username,
          email: formData.email,
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword || undefined,
          zipCode: formData.zipCode,
          phone: formData.phone
        })
      })

      const data = await response.json()

      if (!data.success) {
        setError(data.message || 'Failed to update settings')
      } else {
        setSuccess('Settings updated successfully')
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      }
    } catch (err) {
      setError('An error occurred while updating settings')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <section className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-center mb-5">Update Your Account</h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        <form className="space-y-3" onSubmit={handleSubmit}>
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="firstName" className={labelClass}>First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className={labelClass}>Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className={inputClass}
                required
              />
            </div>
          </div>

          <label htmlFor="username" className={labelClass}>Username</label>
          <input
            type="text"
            id="username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <label htmlFor="email" className={labelClass}>Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <label htmlFor="currentPassword" className={labelClass}>Current Password</label>
          <input
            type="password"
            id="currentPassword"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <label htmlFor="newPassword" className={labelClass}>New Password</label>
          <input
            type="password"
            id="newPassword"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className={inputClass}
            placeholder="Leave blank to keep current password"
          />

          <label htmlFor="confirmPassword" className={labelClass}>Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={inputClass}
            placeholder="Leave blank to keep current password"
          />

          <label htmlFor="zipCode" className={labelClass}>Zip Code</label>
          <input
            type="text"
            id="zipCode"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleChange}
            className={inputClass}
            required
          />

          <label htmlFor="phone" className={labelClass}>Phone Number (Optional)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className={inputClass}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${
              isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-black hover:bg-gray-800'
            }`}
          >
            {isLoading ? 'Updating...' : 'Update Settings'}
          </button>
        </form>
      </section>
    </div>
  )
}
