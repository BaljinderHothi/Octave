//server side to analyze the text in the Tell  Us More form -> updates implicitCategories on mongodb

import { NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }

    const response = await fetch('https://implicitcategories-w5ok.onrender.com/api/recommend', {

    // const response = await fetch('http://127.0.0.1:5000/api/recommend', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        userId: req.user._id.toString()
      })
    });

    if (!response.ok) {
      throw new Error('Failed to analyze text');
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error analyzing text:', error);
    return res.status(500).json({ 
      message: 'Error analyzing text',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export default withAuth(handler); 
