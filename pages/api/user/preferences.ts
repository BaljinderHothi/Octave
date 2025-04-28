//API endpoint to manage user preferences
//GET = retrieve preference
//PUT = update some/all categories if needed
//PATCH = add new items to the categories

import { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  //Get user preferences
  if (req.method === 'GET') {
    try {
      const user = req.user;

      return res.status(200).json({
        success: true,
        data: user.preferences
      });
    } catch (error) {
      console.error('Error fetching preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user preferences',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  //Update user preferences
  if (req.method === 'PUT') {
    try {
      const { food, activities, places, custom } = req.body;

      if (!food && !activities && !places && !custom) {
        return res.status(400).json({
          success: false,
          message: 'No preference categories provided for update'
        });
      }

      //Build update object
      const updateData: any = {};
      
      if (food) updateData['preferences.food'] = food;
      if (activities) updateData['preferences.activities'] = activities;
      if (places) updateData['preferences.places'] = places;
      if (custom) updateData['preferences.custom'] = custom;

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedUser.preferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user preferences',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  //Add new items to preference categories
  if (req.method === 'PATCH') {
    try {
      const { food, activities, places, custom } = req.body;

      if (!food && !activities && !places && !custom) {
        return res.status(400).json({
          success: false,
          message: 'No preference items provided to add'
        });
      }

      //Build update object
      const updateData: any = {};
      
      if (food && food.length > 0) updateData['preferences.food'] = food;
      if (activities && activities.length > 0) updateData['preferences.activities'] = activities;
      if (places && places.length > 0) updateData['preferences.places'] = places;
      if (custom && custom.length > 0) updateData['preferences.custom'] = custom;

      //Adding items to preference arrays
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $addToSet: updateData }, //using $addToSet to avoid duplicates
        { new: true, runValidators: true }
      );

      return res.status(200).json({
        success: true,
        message: 'Preferences updated successfully',
        data: updatedUser.preferences
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user preferences',
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