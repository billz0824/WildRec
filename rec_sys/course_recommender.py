import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import openai

# Configuration
CONTENT_WEIGHT = 0.7
EXPERIENCE_WEIGHT = 0.3
TOP_N = 5

class CourseRecommender:
    def __init__(self, api_key):
        """Initialize the recommender system."""
        self.openai_api_key = api_key
        openai.api_key = self.openai_api_key
        self.courses = []
        self.content_embeddings = []
        self.experience_embeddings = []
        self.combined_embeddings = []  # For storing precomputed weighted combinations
        
    def load_courses(self, courses_json, content_weight=0.7, experience_weight=0.3):
        """
        Load course data from JSON and compute embeddings.
        
        Args:
            courses_json: Course data in JSON format or as a list of dictionaries
            content_weight: Weight for content embeddings in the combined representation
            experience_weight: Weight for experience embeddings in the combined representation
        """
        self.courses = json.loads(courses_json) if isinstance(courses_json, str) else courses_json
        
        # Clear existing embeddings
        self.content_embeddings = []
        self.experience_embeddings = []
        self.combined_embeddings = []
        
        # Generate embeddings for all courses
        for course in self.courses:
            content_embedding = self._get_embedding(course['content'])
            experience_embedding = self._get_embedding(course['experience'])
            
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
        """
        Process user onboarding information and generate a user interest embedding.
        
        Args:
            user_interests (str): Text describing user's interests, background, and preferences
            
        Returns:
            np.array: User interest embedding vector
        """
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
            
            recommendations.append({
                "course": self.courses[idx],
                "similarity_score": float(score),
                "content_similarity": float(content_similarity),
                "experience_similarity": float(experience_similarity)
            })
            
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
            recommendations.append({
                "course": self.courses[idx],
                "similarity_score": float(score),
                "content_similarity": float(content_similarities[idx]),
                "experience_similarity": float(experience_similarities[idx])
            })
            
        return recommendations
    
    def _apply_filters(self, filters):
        """Apply filters to courses and return indices of matching courses."""
        matching_indices = []
        
        for i, course in enumerate(self.courses):
            matches_all = True
            
            for key, value in filters.items():
                # Handle nested attributes with dot notation (e.g., "professor.rating")
                if "." in key:
                    parts = key.split(".")
                    course_value = course
                    for part in parts:
                        if part in course_value:
                            course_value = course_value[part]
                        else:
                            matches_all = False
                            break
                    
                    if not self._match_filter(course_value, value):
                        matches_all = False
                        break
                        
                # Handle direct attributes
                elif key in course:
                    if not self._match_filter(course[key], value):
                        matches_all = False
                        break
                else:
                    # Key not found in course
                    matches_all = False
                    break
            
            if matches_all:
                matching_indices.append(i)
                
        return matching_indices
    
    def _match_filter(self, course_value, filter_value):
        """Match a course value against a filter value."""
        # Handle different filter types
        if isinstance(filter_value, dict):
            # Dictionary filters for ranges, e.g., {"min": 3.0, "max": 5.0}
            if "min" in filter_value and course_value < filter_value["min"]:
                return False
            if "max" in filter_value and course_value > filter_value["max"]:
                return False
            return True
        elif isinstance(filter_value, list):
            # List filters for multiple options, e.g., ["CS", "Math"]
            return course_value in filter_value
        else:
            # Direct equality
            return course_value == filter_value


# Example usage
def example():
    # Sample courses
    courses = [
        {
            "course_name": "CS101: Introduction to Computer Science - Prof. Smith",
            "content": "Basic programming concepts, algorithms, data structures. Python is used as the main language.",
            "experience": "Engaging lectures, challenging assignments, weekly coding exercises."
        },
        {
            "course_name": "CS201: Data Structures - Prof. Johnson",
            "content": "Advanced data structures, algorithm complexity, object-oriented programming in Java.",
            "experience": "Theoretical focus, independent projects, competitive programming contests."
        },
        {
            "course_name": "MATH101: Calculus I - Prof. Davis",
            "content": "Limits, derivatives, integrals, applications of differentiation and integration.",
            "experience": "Clear explanations, manageable workload, supportive environment."
        }
    ]
    
    # Initialize recommender
    recommender = CourseRecommender("your_openai_api_key")
    recommender.load_courses(courses)
    
    # Example query
    query = "I want to learn programming in a challenging environment"
    recommendations = recommender.recommend(query)
    
    # Print recommendations
    for i, rec in enumerate(recommendations):
        print(f"Recommendation {i+1}: {rec['course']['course_name']}")
        print(f"Similarity Score: {rec['similarity_score']:.4f}")
        print(f"Content Similarity: {rec['content_similarity']:.4f}")
        print(f"Experience Similarity: {rec['experience_similarity']:.4f}")
        print()
        
    # Example with filters
    filters = {
        "course_name": {
            "contains": "CS"  # Only Computer Science courses
        }
    }
    
    filtered_recommendations = recommender.recommend(query, filters=filters)
    print("Filtered recommendations:")
    for i, rec in enumerate(filtered_recommendations):
        print(f"Recommendation {i+1}: {rec['course']['course_name']}")
        
if __name__ == "__main__":
    example()