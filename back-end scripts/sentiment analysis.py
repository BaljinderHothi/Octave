import os
import pymongo
from dotenv import load_dotenv
import nltk
from nltk.sentiment.vader import SentimentIntensityAnalyzer  
from nltk.tokenize import word_tokenize
import re  

load_dotenv()


MONGODB_URI = os.environ.get("MONGODB_URI")
DATABASE_NAME = "your_database_name"
USER_COLLECTION = "nyc_users"  
BUSINESS_COLLECTION = "nyc_businesses"  
REVIEWS_COLLECTION = "reviews" 
USER_SENTIMENTS_COLLECTION = "user_sentiments"

try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

def connect_to_mongodb():
    try:
        client = pymongo.MongoClient(MONGODB_URI)
        db = client[DATABASE_NAME]
        print("Connected to MongoDB Atlas successfully!")
        return db
    except pymongo.errors.ConnectionFailure as e:
        print(f"Could not connect to MongoDB: {e}")
        return None

def analyze_sentiment(text):
    sid = SentimentIntensityAnalyzer()
    scores = sid.polarity_scores(text)
    return scores

def extract_keywords(text):
    food_keywords = ["food", "eat", "drink", "cuisine", "dish", "meal", "restaurant", "cafe", "tasty", "delicious", "flavor", "taste", "ingredients"]
    activity_keywords = ["play", "watch", "see", "walk", "hike", "run", "swim", "explore", "visit", "experience", "do", "try", "attend", "concert", "show", "game", "bar"]
    place_keywords = ["park", "museum", "beach", "mountain", "city", "town", "country", "landmark", "garden", "forest", "lake", "river", "ocean", "sea", "zoo", "aquarium"]

    words = word_tokenize(text.lower())
    food = [word for word in words if word in food_keywords]
    activities = [word for word in words if word in activity_keywords]
    places = [word for word in words if word in place_keywords]

    return {"food": food, "activities": activities, "places": places}

def process_reviews_and_store_sentiments():
   

    db = connect_to_mongodb()
    if not db:
        return

    user_collection = db[USER_COLLECTION]
    business_collection = db[BUSINESS_COLLECTION]
    reviews_collection = db[REVIEWS_COLLECTION]
    user_sentiments_collection = db[USER_SENTIMENTS_COLLECTION]

   
    for review in reviews_collection.find({}):
        user_id = str(review["user"]["id"])  
        business_id = str(review["yelp_business_id"]) 
        review_text = review["text"]

        if not user_collection.find_one({"user_id":user_id}): 
            print(f"Skipping review. User with ID {user_id} not found.")
            continue

        if not business_collection.find_one({"business_id":business_id}):
             print(f"Skipping review. Business with ID {business_id} not found.")
             continue



        sentiment_scores = analyze_sentiment(review_text)
        compound_score = sentiment_scores["compound"]

        # extracing the keywords (need to expand this for better results)
        keywords = extract_keywords(review_text)

        positive_keywords = []
        negative_keywords = []

        if compound_score > 0.2:  # Positive 
             positive_keywords = keywords
             negative_keywords = None
        elif compound_score < -0.2:  # Negative 
             positive_keywords = None
             negative_keywords = keywords
        else: #Neutral review not good for training so skipping
             print ("skipping neutral review")
             continue




        sentiment_data = {
            "user_id": user_id,  #Link the user to their NYC user id from the appropriate table
            "business_id": business_id, #yelp business ID
            "review_id": str(review["_id"]), #the mongodb review id
            "overall_sentiment": compound_score, #The "compound" sentiment rating from -1 to 1, -1 being negative 1 being positive
            "positive_keywords": positive_keywords, #keywords for good review
            "negative_keywords": negative_keywords #keywords for  bad reviews

        }

        #store it in user_sentiments collection
        try:
            user_sentiments_collection.insert_one(sentiment_data)
        except Exception as e:
            print(f"Error inserting sentiment data: {e}")


if __name__ == "__main__":
    process_reviews_and_store_sentiments()