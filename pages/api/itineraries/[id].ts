//API endpoint for itinerary management
//GET = get a specific itinerary from db
//PUT = update an itinerary
//DELETE = delete an itinerary

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Itinerary from '@/models/Itinerary';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { id } = req.query;

  // get a specific itinerary from db
  if (req.method === 'GET') {
    try {
      const itinerary = await Itinerary.findOne({
        _id: id,
        user: req.user._id
      });

      if (!itinerary) {
        return res.status(404).json({
          success: false,
          message: 'Itinerary not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: itinerary
      });
    } catch (error) {
      console.error('Error fetching itinerary:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching itinerary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  //update an itinerary
  if (req.method === 'PUT') {
    try {
      const { title, description, date, items, isPublic } = req.body;

      // validate items
      if (items) {
        if (!Array.isArray(items)) {
          return res.status(400).json({
            success: false,
            message: 'Items must be an array'
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
      }

      const updateData: any = {};
      if (title) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (date) updateData.date = new Date(date);
      if (items) updateData.items = items;
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const itinerary = await Itinerary.findOneAndUpdate(
        { _id: id, user: req.user._id },
        updateData,
        { new: true, runValidators: true }
      );

      if (!itinerary) {
        return res.status(404).json({
          success: false,
          message: 'Itinerary not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Itinerary updated successfully',
        data: itinerary
      });
    } catch (error) {
      console.error('Error updating itinerary:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating itinerary',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // delete an itinerary
  if (req.method === 'DELETE') {
    try {
      const itinerary = await Itinerary.findOneAndDelete({
        _id: id,
        user: req.user._id
      });

      if (!itinerary) {
        return res.status(404).json({
          success: false,
          message: 'Itinerary not found'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Itinerary deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting itinerary:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting itinerary',
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