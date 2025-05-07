// /pages/api/user/implicit-categories.ts

import { NextApiResponse } from 'next'
import dbConnect from '@/lib/mongoose'
import { withAuth, AuthenticatedRequest } from '@/lib/auth'
import User from '@/models/User'

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' })
  }

  await dbConnect()

  const { implicitCategories } = req.body

  if (!Array.isArray(implicitCategories)) {
    return res.status(400).json({ success: false, message: 'Categories must be an array' })
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'preferences.implicitCategories': implicitCategories } },
      { new: true, runValidators: true }
    )

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    return res.status(200).json({ success: true, message: 'Implicit categories updated' })
  } catch (err) {
    console.error('Error updating implicit categories:', err)
    return res.status(500).json({ success: false, message: 'Server error' })
  }
}

export default withAuth(handler)
