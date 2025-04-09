//schema for reviews

import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  user: mongoose.Types.ObjectId;
  businessId: string;
  businessName: string;
  rating: number;
  text: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
}

const ReviewSchema = new Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true
    },
    businessId: { 
      type: String, 
      required: true 
    },
    businessName: { 
      type: String, 
      required: true 
    },
    rating: { 
      type: Number, 
      required: true,
      min: 1,
      max: 5
    },
    text: { 
      type: String, 
      required: true
    },
    images: { 
      type: [String], 
      default: [] 
    },
    isPublic: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true,
    collection: "reviews"
  }
);

ReviewSchema.index({ businessId: 1 });
ReviewSchema.index({ user: 1 });
ReviewSchema.index({ rating: -1 });
ReviewSchema.index({ createdAt: -1 });
ReviewSchema.index({ businessId: 1, user: 1 }, { unique: true }); 

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review; 