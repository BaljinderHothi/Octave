//API endpoint for fetching reviews in general
//GET = fetch reviews
//POST = create review  

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Review from '@/models/Review';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // fetch reviews
  if (req.method === 'GET') {
    try {
      const { businessId, userId, limit = 10, page = 1 } = req.query;
      const query: any = {};

      if (businessId) {
        query.businessId = businessId;
      }

      if (userId) {
        query.user = userId;
      }

      if (!businessId && !userId) {
        query.isPublic = true;
      } else if (userId && userId !== req.user._id.toString()) {
        query.isPublic = true;
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const reviews = await Review.find(query)
        .sort({ createdAt: -1 })
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

  // create a new review
  if (req.method === 'POST') {
    try {
      const { businessId, businessName, rating, text, images, isPublic } = req.body;

      if (!businessId || !businessName || !rating || !text) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const existingReview = await Review.findOne({
        user: req.user._id,
        businessId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this business',
          reviewId: existingReview._id
        });
      }

      const review = await Review.create({
        user: req.user._id,
        businessId,
        businessName,
        rating: Number(rating),
        text,
        images: images || [],
        isPublic: isPublic !== false
      });

      return res.status(201).json({
        success: true,
        data: review
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating review',
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