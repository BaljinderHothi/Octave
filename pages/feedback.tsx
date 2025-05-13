import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { saveToLocalStorage, getFromLocalStorage } from '../utils/storage';
import { MessageSquare, Send, Trash2 } from 'lucide-react';

interface FeedbackEntry {
  id: string;
  text: string;
  date: string;
  status: 'pending' | 'sent';
}

export default function FeedbackPage() {
  const router = useRouter();
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);

    if (token) {
      const storedFeedback = getFromLocalStorage<FeedbackEntry[]>('userFeedback') || [];
      setFeedbackList(storedFeedback);
    }
    
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading && !isLoggedIn) {
      router.push('/login');
    }
  }, [isLoggedIn, isLoading, router]);

  const handleSubmitFeedback = () => {
    if (!feedbackText.trim()) return;

    const newFeedback: FeedbackEntry = {
      id: Date.now().toString(),
      text: feedbackText,
      date: new Date().toLocaleString(),
      status: 'pending'
    };

    const updatedFeedbackList = [...feedbackList, newFeedback];
    setFeedbackList(updatedFeedbackList);
    saveToLocalStorage('userFeedback', updatedFeedbackList);
    setFeedbackText('');
  };

  const handleDeleteFeedback = (id: string) => {
    const updatedFeedbackList = feedbackList.filter(item => item.id !== id);
    setFeedbackList(updatedFeedbackList);
    saveToLocalStorage('userFeedback', updatedFeedbackList);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!isLoggedIn) {
    return null; //this won't render because the useEffect will redirect
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <MessageSquare className="mr-2" />
          Feedback
        </h1>
        <p className="text-gray-600">
          We value your opinion! Share your thoughts about our website or app. Your feedback helps us improve.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Submit New Feedback</h2>
        <div className="mb-4">
          <textarea
            className="w-full border rounded-md p-3 min-h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your feedback here..."
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
          />
        </div>
        <button
          className="px-4 py-2 bg-black text-white rounded-md flex items-center hover:bg-gray-700 transition"
          onClick={handleSubmitFeedback}
          disabled={!feedbackText.trim()}
        >
          <Send className="w-4 h-4 mr-2" />
          Submit Feedback
        </button>
      </div>

      {feedbackList.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Your Previous Feedback</h2>
          <div className="space-y-4">
            {feedbackList.map((feedback) => (
              <div key={feedback.id} className="border rounded-md p-4 relative">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="mb-2">{feedback.text}</p>
                    <p className="text-sm text-gray-500">Submitted: {feedback.date}</p>
                    <span className="inline-block px-2 py-1 text-xs rounded mt-2 bg-yellow-100 text-yellow-800">
                      {feedback.status === 'pending' ? 'Pending' : 'Sent'}
                    </span>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDeleteFeedback(feedback.id)}
                    aria-label="Delete feedback"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}