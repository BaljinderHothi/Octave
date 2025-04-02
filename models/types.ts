//types for business, review, saved list, and badge schemas

import { Document } from 'mongoose';

export interface IBusiness extends Document {
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  createdAt: Date;
  updatedAt: Date;
} 