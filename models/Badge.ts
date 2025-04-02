//schema for badges

import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: string;
    threshold: number;
  };
  level: number;
  pointValue: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const BadgeSchema = new Schema(
  {
    name: { 
      type: String, 
      required: true,
      unique: true,
      trim: true
    },
    description: { 
      type: String,
      required: true,
      trim: true
    },
    icon: { 
      type: String,
      required: true 
    },
    criteria: {
      type: { 
        type: String,
        required: true,
        enum: ['review_count', 'restaurant_count', 'cuisine_variety', 'neighborhood_variety', 'login_streak', 'custom']
      },
      threshold: { 
        type: Number,
        required: true 
      }
    },
    level: { 
      type: Number,
      default: 1
    },
    pointValue: { 
      type: Number,
      default: 10
    },
    isActive: { 
      type: Boolean,
      default: true
    }
  },
  { 
    timestamps: true,
    collection: "badges" 
  }
);

BadgeSchema.index({ name: 1 }, { unique: true });
BadgeSchema.index({ 'criteria.type': 1 });
BadgeSchema.index({ level: 1 });

const Badge = mongoose.models.Badge || mongoose.model<IBadge>('Badge', BadgeSchema);

export default Badge; 