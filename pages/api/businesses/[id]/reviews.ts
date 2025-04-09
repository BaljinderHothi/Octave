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

  // fetch reviews for a specific business
  if (req.method === 'GET') {
    try {
      const { 
        page = 1, 
        limit = 3,
        sort = 'createdAt', 
        order = 'desc',
        minRating,
        maxRating
      } = req.query;

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 3;
      const skip = (pageNum - 1) * limitNum;
      
      const query: any = {
        $or: [
          { businessId: id },
          { yelp_id: id }
        ]
      };
      
      const customReviewQuery = {
        ...query,
        isPublic: true
      };
      
      if (minRating) {
        customReviewQuery.rating = { $gte: parseInt(minRating as string) };
      }
      
      if (maxRating) {
        customReviewQuery.rating = { 
          ...customReviewQuery.rating,
          $lte: parseInt(maxRating as string) 
        };
      }
      
      console.log('Custom review query:', JSON.stringify(customReviewQuery));
      
      const sortDirection = order === 'asc' ? 1 : -1;
      const sortOptions: any = { [sort as string]: sortDirection };
      
      const db = mongoose.connection;
      const userReviewsCollection = db.collection('user_reviews');
      
      let yelpId = id;
      if (mongoose.Types.ObjectId.isValid(id)) {
        try {
          const businessCollection = db.collection('nyc_businesses');
          const business = await businessCollection.findOne({ _id: new mongoose.Types.ObjectId(id) });
          if (business && business.id) {
            yelpId = business.id; 
            console.log(`Found Yelp ID ${yelpId} for MongoDB ID ${id}`);
          }
        } catch (err) {
          console.error('Error finding Yelp ID:', err);
        }
      }
      
      const yelpReviewQuery: any = { yelp_id: yelpId };
      
      console.log('Trying to find reviews with Yelp ID:', yelpId);
      
      const yelpCountWithId = await userReviewsCollection.countDocuments(yelpReviewQuery);
      if (yelpCountWithId === 0) {
        console.log('No reviews found with yelp_id, trying with business_id...');
        yelpReviewQuery.$or = [
          { yelp_id: yelpId },
          { business_id: yelpId },
          { yelp_id: id },
          { business_id: id }
        ];
        delete yelpReviewQuery.yelp_id;
      }
      
      if (minRating) {
        yelpReviewQuery.review_rating = { $gte: parseInt(minRating as string) };
      }
      
      if (maxRating) {
        yelpReviewQuery.review_rating = { 
          ...yelpReviewQuery.review_rating,
          $lte: parseInt(maxRating as string) 
        };
      }
      
      console.log('Yelp review query:', JSON.stringify(yelpReviewQuery));
      
      const customReviewsTotal = await Review.countDocuments(customReviewQuery);
      const yelpReviewsTotal = await userReviewsCollection.countDocuments(yelpReviewQuery);
      const totalReviews = customReviewsTotal + yelpReviewsTotal;

      const allCustomReviews = await Review.find(customReviewQuery)
        .sort(sortOptions)
        .populate('user', 'firstName lastName username profilePicture')
        .lean();
      
      const allYelpReviews = await userReviewsCollection
        .find(yelpReviewQuery)
        .sort({ review_date: -1 })
        .toArray();
      
      console.log(`Found ${allCustomReviews.length} custom reviews and ${allYelpReviews.length} Yelp reviews`);
      
      const transformedYelpReviews = allYelpReviews.map(review => ({
        _id: review._id.toString(),
        businessId: review.yelp_id,
        businessName: review.business_name,
        rating: review.review_rating,
        text: review.review_text,
        createdAt: review.review_date || new Date().toISOString(),
        updatedAt: review.review_date || new Date().toISOString(),
        isPublic: true,
        user: {
          _id: review.user_id || 'yelp-user',
          firstName: review.user_id || 'Yelp',
          lastName: '',
          username: review.user_id || 'yelp-user',
          profilePicture: review.user_profile_pic || ''
        },
        source: 'yelp' 
      }));
      
      const allReviews = [...allCustomReviews, ...transformedYelpReviews];
      
      if (sort === 'createdAt') {
        allReviews.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return sortDirection === 1 ? dateA - dateB : dateB - dateA;
        });
      } else if (sort === 'rating') {
        allReviews.sort((a, b) => {
          return sortDirection === 1 
            ? a.rating - b.rating 
            : b.rating - a.rating;
        });
      }
      
      const paginatedReviews = allReviews.slice(skip, skip + limitNum);

      return res.status(200).json({
        success: true,
        data: paginatedReviews,
        pagination: {
          total: totalReviews,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(totalReviews / limitNum)
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