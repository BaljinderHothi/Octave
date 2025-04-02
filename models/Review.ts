//schema for reviews

import mongoose, { Document, Schema } from 'mongoose';

export interface IReview extends Document {
  accurateDate: string;
  address: string;
  aggregateRating: string;
  author: string;
  businessUrl: string;
  dateCreated: string;
  images: string;
  input: string;
  isLocalGuide: boolean;
  name: string;
  originalText: string;
  place_id: string;
  ratingMaxvalue: string;
  responseFromOwner?: {
    date_of_response: string;
    responded_at: string;
    response_text: string;
  };
  reviewBody: string;
  reviewCount: string;
  reviewRating: string;
  reviewSource: string;
  reviewTags: string | null;
  reviewUrl: string;
}

const ReviewSchema = new Schema(
  {
    accurateDate: { type: String },
    address: { type: String },
    aggregateRating: { type: String },
    author: { type: String },
    businessUrl: { type: String },
    dateCreated: { type: String },
    images: { type: String },
    input: { type: String },
    isLocalGuide: { type: Boolean },
    name: { type: String },
    originalText: { type: String },
    place_id: { type: String },
    ratingMaxvalue: { type: String },
    responseFromOwner: {
      date_of_response: { type: String },
      responded_at: { type: String },
      response_text: { type: String }
    },
    reviewBody: { type: String },
    reviewCount: { type: String },
    reviewRating: { type: String },
    reviewSource: { type: String },
    reviewTags: { type: String, default: null },
    reviewUrl: { type: String }
  },
  {
    timestamps: true,
    collection: "reviews"
  }
);

ReviewSchema.index({ name: 1 });
ReviewSchema.index({ place_id: 1 });
ReviewSchema.index({ reviewRating: -1 });
ReviewSchema.index({ dateCreated: -1 });

const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review; 