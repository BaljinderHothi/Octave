// API endpoint to fetch or delete user itineraries

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';

export default withAuth(async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const userId = req.user._id;

  if (req.method === 'GET') {
    try {
      const itineraries = await Itinerary.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ itineraries });
    } catch (error: any) {
      console.error('Error fetching itineraries:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ error: 'Missing itinerary ID' });
      }

      const deleted = await Itinerary.findOneAndDelete({ _id: id, user: userId });

      if (!deleted) {
        return res.status(404).json({ error: 'Itinerary not found or not authorized' });
      }

      return res.status(200).json({ message: 'Itinerary deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting itinerary:', error);
      return res.status(500).json({ error: error.message || 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
});
