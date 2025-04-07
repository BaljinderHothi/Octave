//API endpoint for fetching reviews for a specific business
//GET = fetch reviews

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import Review from '@/models/Review';
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

  // fetch reviews for specific business
  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 10, 
        sort = 'createdAt', 
        order = 'desc',
        minRating,
        maxRating
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;
      
      const query: any = { businessId: id, isPublic: true };
      
      if (minRating) {
        query.rating = { $gte: parseInt(minRating as string) };
      }
      
      if (maxRating) {
        query.rating = { 
          ...query.rating,
          $lte: parseInt(maxRating as string) 
        };
      }
      
      const sortDirection = order === 'asc' ? 1 : -1;
      const sortOptions: any = { [sort as string]: sortDirection };
      
      const reviews = await Review.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'firstName lastName username profilePicture')
        .lean();
      
      const total = await Review.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
} 