import os
from dotenv import load_dotenv
from course_recommender import CourseRecommender
from sample_data import COURSES, SAMPLE_USER
from filter import filter_taken, filter_major
from generate_preferences import generate_user_preference_summary

import sys
import os


parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)


from backend import digraph

def recommend(user, course_graph, method="preference", top_n=3):

    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env file")
        return
    
    # Initialize the recommender
    recommender = CourseRecommender(api_key)
    recommender.load_courses(COURSES)

    # preliminary filtering
    courses = filter_taken(user, course_graph)

    # if recommending by major
    if method == "major":
        # filter by major
        courses = filter_major(courses)
    
    user_preference = generate_user_preference_summary(user)
    user_embedding = recommender.onboard_user(user_preference)
    user_recommendations = recommender.recommend_for_user(user_embedding, top_n=top_n)
    
    # Print recommendations
    for i, rec in enumerate(user_recommendations):
        print(f"\nRecommendation {i+1}: {rec['course']['course_number']}")
        print(f"Professor: {rec['course']['professor']}")
        print(f"Similarity Score: {rec['similarity_score']:.4f}")
        print(f"Content Similarity: {rec['content_similarity']:.4f}")
        print(f"Experience Similarity: {rec['experience_similarity']:.4f}")
    
    return user_recommendations

def rank(user, course):
    user_preferences = [user[s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
    course_attributes = [course[s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
    rank_a = sum([a[0]*a[1] for a in zip(user_preferences, course_attributes)])
    return rank_a

def re_rank(user, courses):
    courses = sorted(courses, key= lambda x: rank(user, x), reverse=True)
    return courses


def merge(user, course_graph, top_n=3):
    by_major = re_rank(recommend(user, course_graph, method="major", top_n=top_n))
    by_preference = re_rank(recommend(user, course_graph, method="preference", top_n=top_n))

    combined_scores = {}

    for course in enumerate(by_major):
        combined_scores[course] = max(combined_scores.get(course, 0) + rank(user, course), combined_scores.get(course, 0))

    for course in enumerate(by_preference):
        combined_scores[course] = max(combined_scores.get(course, 0) + rank(user, course), combined_scores.get(course, 0))

    merged = sorted(combined_scores.keys(), key=lambda x: combined_scores.get(x), reverse=True)

    return [course for course in merged[:top_n]]

if __name__ == "__main__":
    merge(SAMPLE_USER, digraph.course_graph, top_n=3)

    
