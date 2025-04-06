import os
from dotenv import load_dotenv
from course_recommender import CourseRecommender
from retrieve_data import COURSES, SAMPLE_USER_INTERESTS

def main():
    # Load API key from environment variables
    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env file")
        return
    
    # Initialize the recommender
    print("Initializing course recommender...")
    recommender = CourseRecommender(api_key)
    
    # Load courses
    print("Loading courses...")
    recommender.load_courses(COURSES)
    
    # Example 1: Direct query recommendation
    print("\n--- Example 1: Direct Query ---")
    query = "I want to learn precalculus and single variable differentiation"
    print(f"Query: '{query}'")
    recommendations = recommender.recommend(query, top_n=3)
    
    # Print recommendations
    for i, rec in enumerate(recommendations):
        print(f"\nRecommendation {i+1}: {rec['course']['course_number']}")
        print(f"Professor: {rec['course']['professor']}")
        print(f"Similarity Score: {rec['similarity_score']:.4f}")
        print(f"Content Similarity: {rec['content_similarity']:.4f}")
        print(f"Experience Similarity: {rec['experience_similarity']:.4f}")
    
    # Example 2: User onboarding and recommendation
    print("\n\n--- Example 2: User Onboarding ---")
    user_interests = SAMPLE_USER_INTERESTS[1]  # Using the first sample user
    print(f"User profile: '{user_interests}'")
    
    # Generate user embedding
    user_embedding = recommender.onboard_user(user_interests)
    
    # Get recommendations based on user embedding
    user_recommendations = recommender.recommend_for_user(user_embedding, top_n=3)
    
    # Print recommendations
    for i, rec in enumerate(user_recommendations):
        print(f"\nRecommendation {i+1}: {rec['course']['course_number']}")
        print(f"Professor: {rec['course']['professor']}")
        print(f"Similarity Score: {rec['similarity_score']:.4f}")
        print(f"Content Similarity: {rec['content_similarity']:.4f}")
        print(f"Experience Similarity: {rec['experience_similarity']:.4f}")

if __name__ == "__main__":
    main() 