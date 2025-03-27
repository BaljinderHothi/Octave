//API endpoint for fetching a business by id

import { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/mongoose';
import Business from '@/models/Business';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  await dbConnect();

  try {
    const business = await Business.findById(id);
    if (!business) {
      return res.status(404).json({ success: false, message: 'Business not found' });
    }
    res.status(200).json({ success: true, data: business });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching business' });
  }
} 