import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords')


def categorize_keywords(paragraph):
    
    categories = {
        "Food Preferences": [],
        "Activities": [],
        "Places to Visit": []
    }

    stop_words = set(stopwords.words('english'))
    word_tokens = word_tokenize(paragraph.lower())  
    filtered_words = [w for w in word_tokens if not w in stop_words and w.isalnum()] 

    #base keyword list, can expand them as we needed, this is just for testing rn 
    food_keywords = ["food", "eat", "drink", "cuisine", "dish", "meal", "restaurant", "cafe", "tasty", "delicious", "flavor", "taste", "ingredients"] #Expand this list
    activity_keywords = ["play", "watch", "see", "walk", "hike", "run", "swim", "explore", "visit", "experience", "do", "try", "attend", "concert", "show", "game", "bar", "dancing", "singing", "gym", "exercise", "meditate", "yoga", "read"] #Expand this list
    place_keywords = ["park", "museum", "beach", "mountain", "city", "town", "country", "landmark", "garden", "forest", "lake", "river", "ocean", "sea", "zoo", "aquarium", "theater", "cinema", "stadium", "library"] #Expand this list


    for word in filtered_words:
        if word in food_keywords:
            categories["Food Preferences"].append(word)
        elif word in activity_keywords:
            categories["Activities"].append(word)
        elif word in place_keywords:
            categories["Places to Visit"].append(word)
        """over here we can add a bit of code that makes it so if a word cant be categorized clearly, 
        we just mark it as an activity instead, this would save on a lot of computing    """


    for category in categories:
        categories[category] = list(set(categories[category]))  #removes duplicates in the system
    return categories

#use for testing, not for final product 
paragraph = input("Enter a paragraph: ")
keywords = categorize_keywords(paragraph)


for category, words in keywords.items():
    print(f"{category}: {words}")