//API endpoint to clear implicit categories
import { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  await dbConnect();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $set: { 'preferences.implicitCategories': [] } },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: 'Implicit categories cleared successfully',
      data: updatedUser.preferences
    });
  } catch (error) {
    console.error('Error clearing implicit categories:', error);
    return res.status(500).json({
      success: false,
      message: 'Error clearing implicit categories',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler); 