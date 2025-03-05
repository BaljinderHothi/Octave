import spacy
import nltk

from sklearn.feature_extraction.text import TfidfVectorizer
from gensim import corpora, models
from nltk.tokenize import word_tokenize

nltk.download('punkt_tab')
nltk.download("punkt")

nlp = spacy.load("en_core_web_sm")

def extract_keywords_tfidf(reviews, max_features=50):
    #use TF-IDF to extract important keywords across all reviews.
    
    vectorizer = TfidfVectorizer(stop_words="english", max_features=max_features)
    tfidf_matrix = vectorizer.fit_transform(reviews)
    keywords = vectorizer.get_feature_names_out()
    return keywords

def extract_named_entities(text):
    #spaCy's NER to extract entities into categories: food, activities, places, and 'other'
    
    doc = nlp(text)
    entities = {"food": [], "activities": [], "places": [], "other": []}
    for ent in doc.ents:
        if ent.label_ in ["FOOD", "PRODUCT"]:
            entities["food"].append(ent.text)
        elif ent.label_ in ["EVENT", "WORK_OF_ART"]:
            entities["activities"].append(ent.text)
        elif ent.label_ in ["GPE", "LOC"]:
            entities["places"].append(ent.text)
        else:
            entities["other"].append(ent.text)
            
    #remove duplicates
    for key in entities:
        entities[key] = list(set(entities[key]))
    return entities

def extract_topics(reviews, num_topics=3, num_words=5):
    #use LDA for topic modeling to extract hidden themes

    tokenized_reviews = [word_tokenize(review.lower()) for review in reviews]
    dictionary = corpora.Dictionary(tokenized_reviews)
    corpus = [dictionary.doc2bow(text) for text in tokenized_reviews]

    lda_model = models.LdaModel(corpus, num_topics=num_topics, id2word=dictionary, passes=10)
    topics = lda_model.print_topics(num_words=num_words)
    return topics

def combine_dynamic_keywords(reviews):
    tfidf_keywords = list(extract_keywords_tfidf(reviews))
    
    ner_keywords = {"food": [], "activities": [], "places": [], "other": []}
    for review in reviews:
        entities = extract_named_entities(review)
        for key in ner_keywords:
            ner_keywords[key].extend(entities.get(key, []))

    for key in ner_keywords:
        ner_keywords[key] = list(set(ner_keywords[key]))
    
    topics = extract_topics(reviews)
    
    combined = {
        "tfidf_keywords": tfidf_keywords,
        "ner_keywords": ner_keywords,
        "topics": topics
    }
    return combined

if __name__ == "__main__":
    sample_reviews = [
        "I loved the sushi at the new Japanese restaurant in New York, and the service was exceptional.",
        "The ambiance was great, but the burger was overpriced and the fries were cold.",
        "We had a wonderful time at the jazz concert in Central Park; the music was soulful and the atmosphere unforgettable."
    ]
    
    dynamic_keywords = combine_dynamic_keywords(sample_reviews)
    print("Dynamic Keyword Extraction Results:")
    print(dynamic_keywords)
