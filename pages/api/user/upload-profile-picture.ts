//API endpoint to handle user profile picture upload
//it'll be stored in MongoDB with the user schema 

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    await dbConnect();

    const { image } = req.body;
    
    if (!image) {
      return res.status(400).json({ success: false, message: 'No image provided' });
    }

    if (!image.startsWith('data:image/')) {
      return res.status(400).json({ success: false, message: 'Invalid image format' });
    }

    //update the user with image
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { profilePicture: image } },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      data: {
        profilePicture: image
      }
    });
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    return res.status(500).json({
      success: false,
      message: 'Error uploading profile picture',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler); 