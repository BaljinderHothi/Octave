//API endpoint for fetching a single business by ID
//GET = fetch business

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Business ID is required'
    });
  }

  // fetch a single business by ID
  if (req.method === 'GET') {
    try {
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Failed to connect to database');
      }
      
      const businessCollection = db.collection('nyc_businesses');
      
      let business;
      
      if (mongoose.Types.ObjectId.isValid(id)) {
        business = await businessCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
      } else {
        business = await businessCollection.findOne({ id: id });
      }
      
      if (!business) {
        return res.status(404).json({
          success: false,
          message: 'Business not found'
        });
      }

      return res.status(200).json({
        success: true,
        data: business
      });
    } catch (error) {
      console.error('Error fetching business:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching business',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
} 