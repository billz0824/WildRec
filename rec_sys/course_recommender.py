import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import openai

# Configurations
CONTENT_WEIGHT = 0.7
EXPERIENCE_WEIGHT = 0.3
TOP_N = 5


##############################################
# This defines the course recommender system #
##############################################

class CourseRecommender:
    def __init__(self, api_key):
        self.openai_api_key = api_key
        openai.api_key = self.openai_api_key
        self.courses = []
        self.content_embeddings = []
        self.experience_embeddings = []
        self.combined_embeddings = []
        
    def load_courses(self, courses_json, content_weight=0.7, experience_weight=0.3):

        self.courses = json.loads(courses_json) if isinstance(courses_json, str) else courses_json
        
        # Clear existing embeddings
        self.content_embeddings = []
        self.experience_embeddings = []
        self.combined_embeddings = []
        
        # Generate embeddings for all courses
        for course in self.courses:
            content_embedding = self._get_embedding(course['content_summary'])
            experience_embedding = self._get_embedding(course['experience_summary'])
            
            self.content_embeddings.append(content_embedding)
            self.experience_embeddings.append(experience_embedding)
            
            # Pre-compute weighted combined embeddings
            combined = np.array(content_embedding) * content_weight + np.array(experience_embedding) * experience_weight
            self.combined_embeddings.append(combined)
            
        # Convert to numpy arrays for efficient computation
        self.content_embeddings = np.array(self.content_embeddings)
        self.experience_embeddings = np.array(self.experience_embeddings)
        self.combined_embeddings = np.array(self.combined_embeddings)
        
        print(f"Loaded {len(self.courses)} courses with embeddings")
    
    def _get_embedding(self, text):
        """Get embedding for text using OpenAI ada-002 model."""
        response = openai.embeddings.create(
            model="text-embedding-ada-002",
            input=text
        )
        return response.data[0].embedding
    
    def onboard_user(self, user_interests):

        # Generate embedding for user interests
        user_embedding = self._get_embedding(user_interests)
        return np.array(user_embedding)
    
    def recommend_for_user(self, user_embedding, filters=None, top_n=TOP_N):
        """
        Recommend courses based on user's interest embedding.
        
        Args:
            user_embedding (np.array): User interest embedding from onboarding
            filters (dict): Optional filters to apply to results
            top_n (int): Number of top results to return
            
        Returns:
            list: Top N courses matching the user's interests
        """
        # Reshape user embedding for similarity calculation
        user_embedding = user_embedding.reshape(1, -1)
        
        # Calculate similarities using the precomputed combined embeddings
        similarities = cosine_similarity(user_embedding, self.combined_embeddings)[0]
        
        # Apply filters if specified
        filtered_indices = self._apply_filters(filters) if filters else range(len(self.courses))
        
        # Get indices of top N results from filtered set
        filtered_similarities = [(i, similarities[i]) for i in filtered_indices]
        top_indices = sorted(filtered_similarities, key=lambda x: x[1], reverse=True)[:top_n]
        
        # Return top courses with their similarity scores
        recommendations = []
        for idx, score in top_indices:
            # Calculate individual content and experience similarities for reference
            content_similarity = cosine_similarity(
                user_embedding, self.content_embeddings[idx].reshape(1, -1)
            )[0][0]
            
            experience_similarity = cosine_similarity(
                user_embedding, self.experience_embeddings[idx].reshape(1, -1)
            )[0][0]
            
            recommendations.append(self.courses[idx])
            
        return recommendations
    
    def recommend(self, query, content_weight=CONTENT_WEIGHT, experience_weight=EXPERIENCE_WEIGHT, 
                  filters=None, top_n=TOP_N):
        """
        Recommend courses based on query text.
        
        Args:
            query (str): Query text to match against courses
            content_weight (float): Weight for content similarity (default: 0.7)
            experience_weight (float): Weight for experience similarity (default: 0.3)
            filters (dict): Optional filters to apply to results
            top_n (int): Number of top results to return
            
        Returns:
            list: Top N courses matching the query
        """
        # Generate query embeddings
        query_embedding = self._get_embedding(query)
        query_embedding = np.array(query_embedding).reshape(1, -1)
        
        # Calculate similarities
        content_similarities = cosine_similarity(query_embedding, self.content_embeddings)[0]
        experience_similarities = cosine_similarity(query_embedding, self.experience_embeddings)[0]
        
        # Combine similarities with weights
        weighted_similarities = (content_weight * content_similarities + 
                               experience_weight * experience_similarities)
        
        # Apply filters if specified
        filtered_indices = self._apply_filters(filters) if filters else range(len(self.courses))
        
        # Get indices of top N results from filtered set
        filtered_similarities = [(i, weighted_similarities[i]) for i in filtered_indices]
        top_indices = sorted(filtered_similarities, key=lambda x: x[1], reverse=True)[:top_n]
        
        # Return top courses with their similarity scores
        recommendations = []
        for idx, score in top_indices:
            recommendations.append(self.courses[idx])
            
        return recommendations