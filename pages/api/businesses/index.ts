import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '../../../lib/mongoose';
import mongoose from 'mongoose';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // GET - Fetch and search businesses
  if (req.method === 'GET') {
    try {
      const {
        q, // Text search query
        categories, // Categories (comma-separated)
        rating, // Minimum rating
        sort = 'rating', // Sort field
        order = 'desc', // Sort order
        page = 1, // Page number
        limit = 10 // Items per page
      } = req.query;

      // Connect directly to the businesses collection
      const db = mongoose.connection.db;
      if (!db) {
        throw new Error('Failed to connect to database');
      }
      
      const businessCollection = db.collection('businesses');

      const query: any = {};

      if (q) {
        query.name = { $regex: new RegExp(q as string, 'i') };
      }

      if (categories) {
        const categoriesArray = (categories as string).split(',').map(cat => cat.trim());
        query['categories.title'] = { $in: categoriesArray };
      }

      if (rating) {
        query.rating = { $gte: parseFloat(rating as string) };
      }

      let sortOptions: any = {};
      
      if (sort) {
        const sortOrder = order === 'asc' ? 1 : -1;
        sortOptions[sort as string] = sortOrder;
      } else {
        sortOptions = { rating: -1 };
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const businesses = await businessCollection
        .find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .toArray();

      const total = await businessCollection.countDocuments(query);

      return res.status(200).json({
        success: true,
        data: businesses,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching businesses:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching businesses',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
} 