// API endpoint to handle itinerary saving

import type { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  if (req.method === 'POST') {
    try {
      const { food, activity, place } = req.body;

      if (!food || !activity || !place) {
        return res.status(400).json({ error: 'All 3 categories (food, activity, place) are required.' });
      }

      const newItinerary = await Itinerary.create({user: req.user._id, food, activity, place});

      return res.status(201).json({ message: 'Itinerary saved successfully.', data: newItinerary });
    } catch (error: any) {
    console.error('Error saving itinerary:', error); 
    return res.status(500).json({ error: error.message || 'Unknown error occurred.' });
  }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
});
