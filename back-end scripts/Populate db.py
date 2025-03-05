import random
from urllib.parse import quote_plus
import requests
import pymongo
import time
import os
from dotenv import load_dotenv

load_dotenv()

username = quote_plus(os.getenv("MONGO_USERNAME"))
password = quote_plus(os.getenv("MONGO_PASSWORD"))
MONGO_URI = f"mongodb+srv://{username}:{password}@octave-db.hdgf2.mongodb.net/OCTAVE-DB?retryWrites=true&w=majority"

API_KEY = os.getenv("YELP_API_KEY")
HEADERS = {'Authorization': f'Bearer {API_KEY}'}
SEARCH_URL = 'https://api.yelp.com/v3/businesses/search'
DETAILS_URL = 'https://api.yelp.com/v3/businesses/{}'

client = pymongo.MongoClient(MONGO_URI)
db = client['OCTAVE-DB']
collection = db['nyc_businesses']

collection.create_index("id", unique=True)
collection.create_index("categories.alias")
collection.create_index("location.city")

SEARCH_PARAMS = {
    'location': 'New York, NY',
    'limit': 50,
}

MAX_API_CALLS = 205
api_call_count = 0
MAX_TOTAL_RESULTS = 240

def is_already_in_db(business_id):
    return collection.find_one({"id": business_id}) is not None

def fetch_search_results(offset):
    global api_call_count
    params = SEARCH_PARAMS.copy()
    params['offset'] = offset
    response = requests.get(SEARCH_URL, headers=HEADERS, params=params)
    api_call_count += 1
    if response.status_code != 200:
        return [], None
    data = response.json()
    return data.get('businesses', []), data.get('total')

def fetch_business_details(business_id):
    global api_call_count
    response = requests.get(DETAILS_URL.format(business_id), headers=HEADERS)
    api_call_count += 1
    return response.json() if response.status_code == 200 else None

def extract_relevant_fields(business):
    return {
        'id': business.get('id'),
        'name': business.get('name'),
        'address': business.get('location', {}).get('display_address'),
        'categories': business.get('categories'),
        'phone': business.get('phone'),
        'hours': business.get('hours'),
        'rating': business.get('rating'),
        'review_count': business.get('review_count'),
        'is_closed': business.get('is_closed'),
        'yelp_url': business.get('url'),
        'image_url': business.get('image_url'),
    }

def main():
    global api_call_count
    max_offset = MAX_TOTAL_RESULTS - SEARCH_PARAMS['limit']
    total_results = None

    while api_call_count < MAX_API_CALLS:
        offset = random.randint(0, max_offset)
        search_results, total = fetch_search_results(offset)
        if total_results is None and total is not None:
            total_results = total
        if not search_results:
            continue
        random.shuffle(search_results)
        for business in search_results:
            if is_already_in_db(business.get('id')):
                continue
            if api_call_count >= MAX_API_CALLS:
                break
            details = fetch_business_details(business.get('id'))
            if details:
                collection.update_one({'id': details['id']}, {'$set': extract_relevant_fields(details)}, upsert=True)
            time.sleep(0.2)
        time.sleep(1)
    print(f"Total API calls made: {api_call_count}")

if __name__ == '__main__':
    main()

""" this code fetches and stores Yelp business data in MongoDB in order of
1. Fetching business summaries using Yelp API.
2. Checking if the business is already stored in MongoDB.
3. Fetching and storing detailed business info if not already in the database.
"""
