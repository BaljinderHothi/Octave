# Yelp Review Sentiment Analysis & Storage  

## Thought Process & Logic  

Built this script to extract, process, and analyze Yelp reviews using MongoDB, Yelp Fusion API, and NLTK's VADER sentiment analysis. Goal is to pre-process and structure review data so it’s easier to use for ML training. Instead of raw reviews, storing clean, labeled, and structured sentiment data linked to users and businesses.  

Limiting reviews to 5 per restaurant to keep data relevant and prevent redundancy. Review selection is configurable via CLI (random, recent, highest-rated). Neutral reviews are skipped since they’re not as useful for training.  

Added error handling, API rate limiting, and duplication checks to avoid redundant storage and API request failures. User and business IDs are preserved to maintain relationships between reviews and their sources.  

## Expanding the Word Bank Dynamically  

Right now, using predefined food, activity, and place keywords, but that’s not ideal. Would be better to extract keywords dynamically using TF-IDF, NER, or deep learning. Instead of manually listing keywords, let the model learn patterns in the data and adjust over time.  

Could include topic modeling to categorize reviews by themes, or allow users to manually tag reviews to refine the word bank. Another idea is tracking word frequency trends—if certain words start appearing more in positive or negative reviews, they could be automatically added.  

    - Attempting to use a combination of  TF-IDF (Term Frequency-Inverse Document Frequency), NER (Named Entity Recognition) and topic modelling with LDA (Latent Dirichlet Allocation) for improved keyword extraction
  
## Edge Cases Considered  

- Yelp API rate limits – added delays and retries to avoid exceeding request limits  
- Duplicate data – checking review IDs and composite key (author + text) to prevent redundant storage  
- Incomplete reviews – skipping if missing user ID, business ID, or content  
- Sentiment threshold – filtering out neutral reviews to keep only useful training data  
- Non-English reviews – ignoring for now, but could add language detection and translation later  

## Unfinished Work  

Functional but not complete. Keyword extraction is too basic, needs better NLP methods to pull meaningful phrases. ML model isn’t implemented yet, but structured sentiment data is ready for training.  

Need to refine how neutral reviews are handled—maybe useful in some cases. Error handling works, but needs real-world testing with Yelp data.  

Solid foundation, but a lot of room for improvement, especially in NLP, dynamic keyword expansion, and ML training.  
