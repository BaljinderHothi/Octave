import type { NextApiRequest, NextApiResponse } from 'next'
import { connectToDatabase } from '../../../lib/mongoose';
import Restaurant from '../../../models/Restaurant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { q } = req.query;

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    await connectToDatabase();
    
    const restaurants = await Restaurant.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { 'categories.title': { $regex: q, $options: 'i' } }
      ]
    }).limit(20);

    res.status(200).json(restaurants);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search restaurants' });
  }
}