from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util
from pymongo import MongoClient
from bson import ObjectId
import os
from dotenv import load_dotenv
from flask_cors import CORS

load_dotenv('.env.local')
app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "https://octave-navy.vercel.app"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Origin"],
        "supports_credentials": True
    }
})

#OPTIONS handler for all routes
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', request.headers.get('Origin', '*'))
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization,Origin')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    response.headers.add('Access-Control-Allow-Credentials', 'true')
    return response

model = SentenceTransformer('all-MiniLM-L6-v2')

mongodb_uri = os.getenv('MONGODB_URI')
if not mongodb_uri:
    raise ValueError("MONGODB_URI environment variable is not set")
client = MongoClient(mongodb_uri)
db = client["OCTAVE-DB"]

candidates = ['italian', 'mexican', 'sushi', 'bbq', 'vegan', 'fast food', 'pizza', 'indian', 'latin fusion', 'taco',
    'thai', 'chinese', 'mediterranean', 'greek', 'french', 'japanese', 'korean', 'vietnamese', 'lebanese', 'cuban',
    'caribbean', 'ethiopian', 'afghan', 'turkish', 'noodles', 'burgers', 'ramen', 'steakhouse', 'seafood', 'southern',
    'middle eastern', 'brunch', 'brazilian', 'peruvian', 'tapas', 'dumplings', 'poke', 'halal', 'gluten free', 'comfort food',
    'street food', 'gastropub', 'new american', 'kebab', 'bagels', 'sandwiches', 'salad', 'food trucks', 'bistro', 'organic',
    'deli', 'creole', 'cajun', 'irish', 'german', 'nepalese', 'moroccan', 'pakistani', 'filipino', 'malaysian', 'fusion', 'billiards', 'poolhalls', 'bowling', 'yoga', 'pilates','rockclimbing', 'painting', 'rock climbing', 'movies', 'swimming', 'dancing',
    'arcade', 'escape room', 'karaoke', 'golf','mini golf', 'go kart', 'trampoline park', 'laser tag', 'ice skating',
    'roller skating', 'ziplining', 'pottery', 'wine tasting', 'beer tasting', 'board games',
    'virtual reality', 'indoor skydiving', 'archery', 'axe throwing', 'parks', 'museums', 'landmarks', 'beaches', 'zoos', 'libraries',
    'gardens', 'aquariums', 'piers', 'observatories', 'monuments', 'cathedrals',
    'bridges', 'harbors', 'galleries', 'historic sites', 'botanical gardens', 'stadiums',
    'arenas', 'islands', 'memorials', 'conservatories', 'clubs', 'bars', 'cafes', 'cafe', 'bakery', 'running', 'walking', 'hiking', 'jogging', 'exercise', 'fitness', 'sports']

def recommend_categories(user_input, top_n=3):
    input_embedding = model.encode(user_input, convert_to_tensor=True)
    candidate_embeddings = model.encode(candidates, convert_to_tensor=True)
    similarities = util.cos_sim(input_embedding, candidate_embeddings).flatten()
    top_indices = similarities.topk(top_n).indices
    return [candidates[i] for i in top_indices]

def update_implicit_categories(user_id, categories):
    try:
        user_object_id = ObjectId(user_id)
        result = db.users.update_one(
            {'_id': user_object_id},
            {'$set': {'preferences.implicitCategories': categories}}
        )
        
        return result.modified_count > 0
    except Exception as e:
        print(f"Error updating MongoDB: {str(e)}")
        return False

@app.route('/api/recommend', methods=['POST'])
def recommend():
    data = request.get_json()
    user_input = data.get("text", "")
    user_id = data.get("userId", "")
    
    if not user_input:
        return jsonify({"error": "Missing 'text' in request"}), 400
    if not user_id:
        return jsonify({"error": "Missing 'userId' in request"}), 400
        
    results = recommend_categories(user_input)
    
    if update_implicit_categories(user_id, results):
        return jsonify({
            "recommendations": results,
            "message": "Implicit categories updated successfully"
        })
    else:
        return jsonify({
            "recommendations": results,
            "message": "Failed to update implicit categories"
        }), 500

@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

if __name__ == '__main__':
    app.run(debug=True)
