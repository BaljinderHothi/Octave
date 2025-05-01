export interface Feedback {
    id: string;
    text: string;
    date: string;
    status: 'pending' | 'sent';
  }
  
  export type FeedbackList = Feedback[];