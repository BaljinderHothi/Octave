//schema for itineraries

import mongoose, { Document, Schema } from 'mongoose';

export interface IItinerary extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  date: Date;
  items: {
    type: 'food' | 'activity' | 'place' | 'other';
    business: {
      name: string;
      phone: string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
      rating: number;
      reviewCount: number;
      imageUrl?: string;
    };
    time?: string;
    notes?: string;
  }[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ItinerarySchema = new Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    title: { 
      type: String,
      required: true,
      trim: true
    },
    description: { 
      type: String,
      trim: true
    },
    date: { 
      type: Date,
      required: true
    },
    items: [{
      type: { 
        type: String, 
        required: true,
        enum: ['food', 'activity', 'place', 'other']
      },
      business: {
        name: { type: String, required: true },
        phone: { type: String },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zipCode: { type: String, required: true },
        rating: { type: Number },
        reviewCount: { type: Number },
        imageUrl: { type: String }
      },
      time: { type: String },
      notes: { type: String }
    }],
    isPublic: { 
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    collection: "itineraries" 
  }
);

ItinerarySchema.index({ user: 1, date: 1 });

const Itinerary = mongoose.models.Itinerary || mongoose.model<IItinerary>('Itinerary', ItinerarySchema);

export default Itinerary; 