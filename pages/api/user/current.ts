//endpoint to get the current user's ID from the token
//made this for when getting implicit categories from Tell Us More

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      message: 'Method not allowed'
    });
  }

  try {
    return res.status(200).json({
      success: true,
      user: {
        _id: req.user._id,
        email: req.user.email,
        username: req.user.username,
        firstName: req.user.firstName,
        lastName: req.user.lastName
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    return res.status(500).json({
      success: false,
      message: 'Error getting current user',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler);
