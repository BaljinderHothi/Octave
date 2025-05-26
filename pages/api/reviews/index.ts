//API endpoint for fetching reviews in general
//GET = fetch reviews
//POST = create review  

import { NextApiRequest, NextApiResponse } from 'next';
import { withAuth, AuthenticatedRequest } from '@/lib/auth';
import dbConnect from '@/lib/mongoose';
import Review from '@/models/Review';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse
) {
  await dbConnect();

  // fetch reviews
  if (req.method === 'GET') {
    try {
      const { businessId, userId, limit = 10, page = 1 } = req.query;
      const query: any = {};

      if (businessId) {
        query.businessId = businessId;
      }

      if (userId) {
        query.user = userId;
      }

      if (!businessId && !userId) {
        query.isPublic = true;
      } else if (userId && userId !== req.user._id.toString()) {
        query.isPublic = true;
      }

      const pageNum = parseInt(page as string) || 1;
      const limitNum = parseInt(limit as string) || 10;
      const skip = (pageNum - 1) * limitNum;

      const reviews = await Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('user', 'firstName lastName username profilePicture')
        .lean();

      const total = await Review.countDocuments(query);
      
      if (userId && userId === req.user._id.toString()) {
        const actualReviewCount = await Review.countDocuments({ user: req.user._id });
        if (req.user.reviewCount !== actualReviewCount) {
          await req.user.updateOne({ $set: { reviewCount: actualReviewCount } });
        }
      }

      return res.status(200).json({
        success: true,
        data: reviews,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          pages: Math.ceil(total / limitNum)
        }
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching reviews',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // create a new review
  if (req.method === 'POST') {
    try {
      const { businessId, businessName, rating, text, images, isPublic } = req.body;

      if (!businessId || !businessName || !rating || !text) {
        return res.status(400).json({
          success: false,
          message: 'Missing required fields'
        });
      }

      const existingReview = await Review.findOne({
        user: req.user._id,
        businessId
      });

      if (existingReview) {
        return res.status(400).json({
          success: false,
          message: 'You have already reviewed this business',
          reviewId: existingReview._id
        });
      }

      const review = await Review.create({
        user: req.user._id,
        businessId,
        businessName,
        rating: Number(rating),
        text,
        images: images || [],
        isPublic: isPublic !== false
      });
      
      if (req.user.reviewCount < 0) {
        const actualReviewCount = await Review.countDocuments({ user: req.user._id });
        await req.user.updateOne({ $set: { reviewCount: actualReviewCount + 1 } }); 
      } else {
        await req.user.updateOne({ $inc: { reviewCount: 1 } });
      }

      //4/30/25 - whenever we submit a new review, we'll make the sentiment analysis model
      //read the rating and text, then put those additionalPreferences into the database
      try {
        // const preferenceApiUrl = "http://127.0.0.1:5005";
        // const preferenceApiUrl = "https://octavesentimentanalysis.onrender.com";
        const preferenceApiUrl = "https://octavesentimentanalysis-i15w.onrender.com";

  
        console.log('Calling preference API at:', preferenceApiUrl);
        
        const userIdRaw = req.user._id;
        const userIdString = req.user._id.toString();
        console.log('User ID type:', typeof userIdRaw);
        console.log('User ID raw value:', userIdRaw);
        console.log('User ID as string:', userIdString);
        
        const requestBody = {
          user_id: req.user._id.toString(),
          businessId,
          businessName,
          rating: Number(rating),
          text
        };
        console.log('Sending data to preference API:', JSON.stringify(requestBody));
        let apiAwake = false;
        const wakeupApiWithRetries = async (maxRetries = 2) => {
          for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
              console.log(`API wake-up attempt ${attempt + 1}/${maxRetries}...`);
              const testResponse = await fetch(`${preferenceApiUrl}/api/test`, {
                signal: AbortSignal.timeout(5000) 
              });
              
              if (testResponse.ok) {
                console.log('API is awake and responding!');
                apiAwake = true;
                return true;
              } else {
                console.log(`API test endpoint returned status: ${testResponse.status}. Retrying...`);
              }
            } catch (e) {
              console.log(`Wake-up attempt ${attempt + 1} failed:`, e);
            }
            
            if (attempt < maxRetries - 1) {
              console.log('Waiting before next wake-up attempt...');
              await new Promise(resolve => setTimeout(resolve, 3000));
            }
          }
          
          return false;
        };
        
        await wakeupApiWithRetries();
        
        if (!apiAwake) {
          console.log('API appears to be down or still waking up. Proceeding without preference update.');
          return res.status(201).json({
            success: true,
            data: review,
            analysis: {
              isPositive: null,
              preferencesUpdated: false,
              categories: null,
              error: 'API unavailable - likely in sleep mode'
            }
          });
        }
        
        //api is awake -> proceed with the real request with a longer timeout
        console.log('Attempting fetch to:', `${preferenceApiUrl}/api/reviews/analyze`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); 
        
        try {
          const response = await fetch(`${preferenceApiUrl}/api/reviews/analyze`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(requestBody),
            signal: controller.signal
          });

          clearTimeout(timeoutId); 
          console.log('Preference API response status:', response.status);
          
          if (response.ok) {
            const analysisResult = await response.json();
            console.log('Review analysis result:', analysisResult);
            
            //direct update IF the review is positive and the preferences didn't update
            if (analysisResult.isPositive && !analysisResult.preferencesUpdated) {            
              try {
                const directUpdateResponse = await fetch(`${preferenceApiUrl}/api/user-preferences/${req.user._id.toString()}/update`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ 
                    categories: analysisResult.categories || ['direct-update-test'] 
                  }),
                  signal: AbortSignal.timeout(8000) 
                });
                
                console.log('Direct update response status:', directUpdateResponse.status);
                if (directUpdateResponse.ok) {
                  console.log('Direct update response:', await directUpdateResponse.json());
                } else {
                  console.error('Direct update error:', await directUpdateResponse.text());
                }
              } catch (directUpdateError) {
                console.error('Error making direct update request:', directUpdateError);
              }
            }
            
            return res.status(201).json({
              success: true,
              data: review,
              analysis: {
                isPositive: analysisResult.isPositive,
                preferencesUpdated: analysisResult.preferencesUpdated,
                categories: analysisResult.categories
              }
            });
          } else {
            const errorText = await response.text();
            console.error('Error from preference API:', errorText);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId); // Ensure timeout is cleared
          console.error('Fetch error for review analysis:', fetchError);
        }
      } catch (apiError) {
        console.error('Error calling preference API:', apiError);
      }

      // Final fallback to return review without analysis
      return res.status(201).json({
        success: true,
        data: review,
        analysis: {
          isPositive: null,
          preferencesUpdated: false,
          categories: [],
          error: 'Analysis not performed - API may be unavailable'
        }
      });
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating review',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return res.status(405).json({
    success: false,
    message: 'Method not allowed'
  });
}

export default withAuth(handler); 
