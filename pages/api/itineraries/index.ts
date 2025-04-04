//API endpoints for itinerary management
//GET = get all itineraries for the user
//POST = create a new itinerary

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // get all itineraries for the user
  if (req.method === 'GET') {
    try {
      const { date, isPublic } = req.query;
      
      const query: any = { user: req.user._id };
      
      if (date) {
        query.date = new Date(date as string);
      }
      
      if (isPublic !== undefined) {
        query.isPublic = isPublic === 'true';
      }

      const itineraries = await Itinerary.find(query)
        .sort({ date: -1, createdAt: -1 });

      return res.status(200).json({
        success: true,
        data: itineraries
      });
    } catch (error) {
      console.error('Error fetching itineraries:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching itineraries',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // create a new itinerary
  if (req.method === 'POST') {
    try {
      const { title, description, date, items, isPublic } = req.body;

      if (!items || !Array.isArray(items)) {
        return res.status(400).json({
          success: false,
          message: 'Items array is required'
        });
      }

      for (const item of items) {
        if (!item.type || !item.business) {
          return res.status(400).json({
            success: false,
            message: 'Each item must have a type and business data'
          });
        }

        const { business } = item;
        if (!business.name || !business.address || !business.city || 
            !business.state || !business.zipCode) {
          return res.status(400).json({
            success: false,
            message: 'Business data is incomplete'
          });
        }
      }

      const itinerary = await Itinerary.create({
        user: req.user._id,
        title: title || 'My Itinerary',
        description: description || '',
        date: new Date(date || Date.now()),
        items,
        isPublic: isPublic || false
      });

      return res.status(201).json({
        success: true,
        message: 'Itinerary created successfully',
        data: itinerary
      });
    } catch (error) {
      console.error('Error creating itinerary:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating itinerary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withAuth(handler); 