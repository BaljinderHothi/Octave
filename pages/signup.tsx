import { useState, ChangeEvent, FormEvent } from 'react'

export default function Signup() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    day: '',
    month: '',
    year: '',
    phone: '',
  })

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
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

          <button type="submit"
            className="w-full py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white"
            style={{ backgroundColor: '#007bff' }}>
            Continue
          </button>
        </form>
      </section>
    </div>)}