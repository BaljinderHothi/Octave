// API endpoint for user itineraries
// GET: retrieve user itineraries
// POST: create new itinerary
// DELETE: remove a specific itinerary

import type { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();
  const userId = req.user._id;

  //get user itineraries
  if (req.method === 'GET') {
    try {
      const itineraries = await Itinerary.find({ user: userId }).sort({ createdAt: -1 });
      return res.status(200).json({ 
        success: true, 
        data: { itineraries } 
      });
    } catch (error: any) {
      console.error('Error fetching itineraries:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching user itineraries',
        error: error.message || 'Internal server error' 
      });
    }
  }

  //create new itinerary
  if (req.method === 'POST') {
    try {
      const { food, foodId, activity, activityId, place, placeId } = req.body;

      if (!food && !activity && !place) {
        return res.status(400).json({ 
          success: false, 
          message: 'At least one category (food, activity, or place) is required.' 
        });
      }

      const newItinerary = await Itinerary.create({
        user: userId, 
        food: food || '', 
        foodId: foodId || '',
        activity: activity || '',
        activityId: activityId || '',
        place: place || '',
        placeId: placeId || ''
      });

      return res.status(201).json({ 
        success: true, 
        message: 'Itinerary saved successfully.', 
        data: { itinerary: newItinerary }
      });
    } catch (error: any) {
      console.error('Error saving itinerary:', error); 
      return res.status(500).json({ 
        success: false, 
        message: 'Error saving itinerary',
        error: error.message || 'Unknown error occurred.' 
      });
    }
  }

  //delete itinerary
  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      if (!id) {
        return res.status(400).json({ 
          success: false, 
          message: 'Missing itinerary ID' 
        });
      }

      const deleted = await Itinerary.findOneAndDelete({ _id: id, user: userId });

      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: 'Itinerary not found or not authorized' 
        });
      }

      return res.status(200).json({ 
        success: true, 
        message: 'Itinerary deleted successfully' 
      });
    } catch (error: any) {
      console.error('Error deleting itinerary:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Error deleting itinerary',
        error: error.message || 'Internal server error' 
      });
    }
  }

  return res.status(405).json({ 
    success: false, 
    message: 'Method not allowed' 
  });
}

export default withAuth(handler);
