import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import Review from '../../../models/Review';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // GET - Fetch reviews (with filters)
  if (req.method === 'GET') {
    try {
      const {
        place_id, // Place ID (from Google Maps)
        name, // Business name
        author, // Author name
        rating, // Minimum rating
        sort = 'dateCreated', // Sort field
        order = 'desc', // Sort order
        page = 1, // Page number
        limit = 10 // Items per page
      } = req.query;

      // Build query
      const query: any = {};

      if (place_id) {
        query.place_id = place_id;
      }

      if (name) {
        query.name = new RegExp(name as string, 'i'); 
      }

      if (author) {
        query.author = new RegExp(author as string, 'i'); 
      }

      if (rating) {
        query.reviewRating = { $gte: rating };
      }

      const sortOrder = order === 'asc' ? 1 : -1;
      const sortOptions: any = { [sort as string]: sortOrder };

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const reviews = await Review.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum);

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