//API endpoint to handle user settings
//GET = retrieve user settings
//PUT = update user settings

import { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import * as bcrypt from 'bcryptjs';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // get current settings
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
      console.error('Error fetching settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user settings',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // update settings
  if (req.method === 'PUT') {
    try {
      const { firstName, lastName, username, email, currentPassword, newPassword, zipCode, phone } = req.body;

      // verify current password
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({
            success: false,
            message: 'Current password is required to change password'
          });
        }

        const user = await User.findById(req.user._id).select('+password');
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        
        if (!isMatch) {
          return res.status(400).json({
            success: false,
            message: 'Current password is incorrect'
          });
        }
      }

      if (username && username !== req.user.username) {
        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({
            success: false,
            message: 'This username is already taken'
          });
        }
      }

      if (email && email !== req.user.email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({
            success: false,
            message: 'This email is already registered'
          });
        }
      }

      const updateData: any = {};
      
      if (firstName) updateData.firstName = firstName;
      if (lastName) updateData.lastName = lastName;
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (zipCode) updateData.zipCode = zipCode;
      if (phone) updateData.phone = phone;

      if (newPassword) {
        const salt = await bcrypt.genSalt(10);
        updateData.password = await bcrypt.hash(newPassword, salt);
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
        message: 'Settings updated successfully',
        data: userObject
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user settings',
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