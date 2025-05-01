//schema for users

import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  zipCode: string;
  profilePicture: string;
  preferences: {
    food: string[];
    activities: string[];
    places: string[];
    custom: string[];
    additionalPreferences: string[]; //this is for the categories that are extracted when they write reviews
  };
  favorites: mongoose.Types.ObjectId[]; 
  wishlist: mongoose.Types.ObjectId[]; 
  badges: string[];
  reviewCount: number;
  createdAt: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  acquired: boolean;
  dateAcquired?: Date;
  progress?: {
    current: number;
    total: number;
  };
  requirementCount?: number;
}

const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    zipCode: { type: String, required: true },
    profilePicture: { type: String, default: '' },
    preferences: {
      food: { type: [String], default: [] },
      activities: { type: [String], default: [] },
      places: { type: [String], default: [] },
      custom: { type: [String], default: [] },
      additionalPreferences: { type: [String], default: [] },
    },
    favorites: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Business',
      default: [] 
    }],
    wishlist: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Business',
      default: [] 
    }],
    badges: { 
      type: Array, 
      default: [] 
    },
    reviewCount: { 
      type: Number, 
      default: 0 
    },
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 