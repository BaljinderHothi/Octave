//schema for businesses

import mongoose from 'mongoose';
import { IBusiness } from './types';

const businessSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a business name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a business description'],
  },
  address: {
    type: String,
    required: [true, 'Please provide a business address'],
  },
  phone: {
    type: String,
    required: [true, 'Please provide a business phone number'],
  },
  email: {
    type: String,
    required: [true, 'Please provide a business email'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
  },
  website: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Business || mongoose.model<IBusiness>('Business', businessSchema); 