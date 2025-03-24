import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongoose'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' })

  const { email, password, firstName, lastName, username, zipCode } = req.body
  
  // Validate required fields
  if (!email || !password || !zipCode) 
    return res.status(400).json({ message: 'Email, password and zipCode are required' })

  try {
    await dbConnect()
    
    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) return res.status(409).json({ message: 'User already exists' })
    
    // Check username uniqueness if provided
    if (username) {
      const existingUsername = await User.findOne({ username })
      if (existingUsername) return res.status(409).json({ message: 'Username already taken' })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      zipCode,
      preferences: {
        food: [],
        activities: [],
        places: [],
        custom: []
      }
    })
    
    res.status(201).json({ success: true, message: 'User registered successfully' })
  } catch (error) {
    res.status(500).json({ message: 'Error registering user', error: String(error) })
  }
}
