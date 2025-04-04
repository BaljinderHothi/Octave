//this file is just for the types of the recommendations
export interface Recommendation {
  id: string;
  name: string;
  categories: string[];
  rating: number;
  location: string;
  image_url: string;
  category_match?: string;
  explanation: string;
  score?: number;
}

//structure of api response when fetching recommendations
export interface RecommendationResponse {
  success: boolean;
  data: Recommendation[];
  message?: string;
  error?: string;
} 