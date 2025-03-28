import mongoose, { Document, Schema } from 'mongoose';

// Define the User interface
export interface IUser extends Document {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  zipCode: string;
  preferences: {
    food: string[];
    activities: string[];
    places: string[];
    custom: string[];
  };
  favorites: mongoose.Types.ObjectId[]; 
  wishlist: mongoose.Types.ObjectId[]; 
  createdAt: Date;
}

// Define the User schema
const UserSchema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    zipCode: { type: String, required: true },
    preferences: {
      food: { type: [String], default: [] },
      activities: { type: [String], default: [] },
      places: { type: [String], default: [] },
      custom: { type: [String], default: [] },
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
    createdAt: { type: Date, default: Date.now },
  },
  { collection: "users" }
);

// Don't recreate the model if it already exists
const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User; 