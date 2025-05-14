//schema for itinerary

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItinerary extends Document {
  user: Types.ObjectId;
  food: string;
  foodId: string;
  activity: string;
  activityId: string;
  place: string;
  placeId: string;
  createdAt: Date;
}

const ItinerarySchema = new Schema<IItinerary>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: String, default: '' },
  foodId: { type: String, default: '' },
  activity: { type: String, default: '' },
  activityId: { type: String, default: '' },
  place: { type: String, default: '' },
  placeId: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);


