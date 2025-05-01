//API endpoint for fetching a single review
//GET = fetch single review
//PUT = update review
//DELETE = delete review

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Review, { IReview } from '@/models/Review';
import mongoose from 'mongoose';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== 'string' || !mongoose.isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid review ID'
    });
  }

  await dbConnect();

  // fetch single review
  if (req.method === 'GET') {
    try {
      const review = await Review.findById(id)
        .populate('user', 'firstName lastName username profilePicture')
        .lean();

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      const typedReview = review as unknown as IReview & { user: { _id: mongoose.Types.ObjectId } };
      
      if (!typedReview.isPublic && typedReview.user._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this review'
        });
      }

      return res.status(200).json({
        success: true,
        data: review
      });
    } catch (error) {
      console.error('Error fetching review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // update review
  if (req.method === 'PUT') {
    try {
      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to update this review'
        });
      }

      const { rating, text, images, isPublic } = req.body;
      const updateData: any = {};

      if (rating) updateData.rating = Number(rating);
      if (text) updateData.text = text;
      if (images) updateData.images = images;
      if (isPublic !== undefined) updateData.isPublic = isPublic;

      const updatedReview = await Review.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true }
      ).populate('user', 'firstName lastName username profilePicture');

      return res.status(200).json({
        success: true,
        data: updatedReview
      });
    } catch (error) {
      console.error('Error updating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // delete review
  if (req.method === 'DELETE') {
    try {
      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found'
        });
      }

      if (review.user.toString() !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this review'
        });
      }

      await Review.findByIdAndDelete(id);
      
      if (req.user.reviewCount > 0) {
        await req.user.updateOne({ $inc: { reviewCount: -1 } });
      }

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting review',
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