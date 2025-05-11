//schema for itinerary

import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IItinerary extends Document {
  user: Types.ObjectId;
  food: string;
  activity: string;
  place: string;
  createdAt: Date;
}

const ItinerarySchema = new Schema<IItinerary>({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  food: { type: String, default: '' },
  activity: { type: String, default: '' },
  place: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);


