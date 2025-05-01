// API endpoint for user badges
// GET: retrieve user badges
// PUT: update user badges

import { NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import User from '@/models/User';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import { initializeBadges } from '@/lib/badge-definitions';

async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  await dbConnect();

  //get user badges
  if (req.method === 'GET') {
    try {
      const user = req.user;
      
      if (!user.badges || user.badges.length === 0) {
        user.badges = initializeBadges();
        await user.save();
      }
      
      return res.status(200).json({
        success: true,
        data: { 
          badges: user.badges,
          reviewCount: user.reviewCount || 0
        }
      });
    } catch (error) {
      console.error('Error fetching badges:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching user badges',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // update user badges
  if (req.method === 'PUT') {
    try {
      const { badges } = req.body;
      
      if (!badges || !Array.isArray(badges)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid badges data'
        });
      }
      
      const user = req.user;
      user.badges = badges;
      await user.save();
      
      return res.status(200).json({
        success: true,
        data: {
          badges: user.badges
        }
      });
    } catch (error) {
      console.error('Error updating badges:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating user badges',
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