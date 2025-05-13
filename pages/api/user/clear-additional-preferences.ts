//api endpoint to clear all the preferencves coming from user reviews and it updates on mongodb 

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { 'preferences.additionalPreferences': [] } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ message: 'Additional preferences cleared successfully' });
  } catch (error) {
    console.error('Error clearing additional preferences:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export default withAuth(handler); 