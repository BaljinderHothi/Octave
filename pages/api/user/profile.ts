//API endpoint to handle user profile management
//GET = retrieve user profile
//PUT = update user profile
//DELETE = delete user account

import { NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import User from '../../../models/User';
import { withAuth, AuthenticatedRequest } from '../../../lib/auth';
import * as bcrypt from 'bcryptjs';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  //Fetch user profile
  if (req.method === 'GET') {
    try {
     
      const user = req.user;
      

      const userObject = user.toObject();
      delete userObject.password;

      return res.status(200).json({
        success: true,
        data: userObject
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  //Update user profile
  if (req.method === 'PUT') {
    try {
      const { firstName, lastName, username, zipCode, password, preferences } = req.body;

      if (username && username !== req.user.username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'This username is already taken'
          });
        }
      }


      const updateData: any = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (username) updateData.username = username;
      if (zipCode) updateData.zipCode = zipCode;
      

      if (preferences) {
        if (preferences.food) updateData['preferences.food'] = preferences.food;
        if (preferences.activities) updateData['preferences.activities'] = preferences.activities;
        if (preferences.places) updateData['preferences.places'] = preferences.places;
        if (preferences.custom) updateData['preferences.custom'] = preferences.custom;
      }

      if (password) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(password, salt);
      }

      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updateData },
        { new: true, runValidators: true }
      );

      const userObject = updatedUser.toObject();
      delete userObject.password;

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: userObject
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  //Delete user account
  if (req.method === 'DELETE') {
    try {
      await User.findByIdAndDelete(req.user._id);

      return res.status(200).json({
        success: true,
        message: 'User account deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting user account',
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