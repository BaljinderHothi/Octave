//schema for saved lists, like favorites, wishlist, (custom will come after MVP)

import mongoose, { Document, Schema } from 'mongoose';

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

SavedListSchema.index({ user: 1, name: 1 }, { unique: true });
SavedListSchema.index({ user: 1, type: 1 });

const SavedList = mongoose.models.SavedList || mongoose.model<ISavedList>('SavedList', SavedListSchema);

export default SavedList; 