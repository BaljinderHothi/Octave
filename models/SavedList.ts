import mongoose, { Document, Schema } from 'mongoose';

// Define the SavedList interface
export interface ISavedList extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: string;
  businesses: mongoose.Types.ObjectId[];
  isDefault: boolean;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the SavedList schema
const SavedListSchema = new Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'User',
      required: true 
    },
    name: { 
      type: String,
      required: true,
      trim: true
    },
    type: { 
      type: String,
      required: true,
      enum: ['favorites', 'wishlist', 'custom'],
      default: 'custom'
    },
    businesses: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Business' 
    }],
    isDefault: { 
      type: Boolean,
      default: false
    },
    isPublic: { 
      type: Boolean,
      default: false
    }
  },
  { 
    timestamps: true,
    collection: "savedlists" 
  }
);

// Add compound index to prevent duplicate list names for a user
SavedListSchema.index({ user: 1, name: 1 }, { unique: true });
SavedListSchema.index({ user: 1, type: 1 });

// Don't recreate the model if it already exists
const SavedList = mongoose.models.SavedList || mongoose.model<ISavedList>('SavedList', SavedListSchema);

export default SavedList; 