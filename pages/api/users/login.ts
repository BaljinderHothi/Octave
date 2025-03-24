import type { NextApiRequest, NextApiResponse } from 'next'
import dbConnect from '../../../lib/mongoose'
import User from '../../../models/User'
import bcrypt from 'bcryptjs'
import { signToken } from '@/lib/jwt'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Only POST allowed' })

  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ message: 'Email and password required' })

  await dbConnect()
  
  const user = await User.findOne({ email }).select('+password')
  if (!user) return res.status(401).json({ message: 'Invalid email or password' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return res.status(401).json({ message: 'Invalid email or password' })

  const token = signToken({ userId: user._id, email: user.email })
  res.status(200).json({ token })
}
