import os
from dotenv import load_dotenv
from .course_recommender import CourseRecommender
from .sample_data import COURSES, SAMPLE_USER
from .filter import filter_taken, filter_major
from .generate_preferences import generate_user_preference_summary, get_course
from .digraph import build_course_graph



def recommend(user, courses, course_graph, method="preference", top_n=3):

    load_dotenv()
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        print("Error: OPENAI_API_KEY not found in .env file")
        return
    
    # Initialize the recommender
    recommender = CourseRecommender(api_key)

    # preliminary filtering
    allowed = filter_taken(user, courses, course_graph)

    # if recommending by major
    if method == "major":
        # filter by major
        allowed = filter_major(user["major"], allowed)
    
    recommender.load_courses(allowed)

    user_preference = generate_user_preference_summary(user, courses)
    # print(f"User Preference: {user_preference}")
    
    user_embedding = recommender.onboard_user(user_preference)
    user_recommendations = recommender.recommend_for_user(user_embedding, top_n=top_n)
    
    
    return user_recommendations

def rank(user, course):
    user_preferences = [user[s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
    course_attributes = [course[s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
    rank_a = sum([a[0]*a[1] for a in zip(user_preferences, course_attributes)])
    return rank_a

def re_rank(user, courses):
    courses = sorted(courses, key= lambda x: rank(user, x), reverse=True)
    return courses


def merge(user, courses, course_graph, top_n=3):
    by_major = re_rank(user, recommend(user, courses, course_graph, method="major", top_n=top_n))
    by_preference = re_rank(user, recommend(user, courses, course_graph, method="preference", top_n=top_n))

    combined_scores = {}

    for course in by_major:
        combined_scores[course["course_number"]] = max((combined_scores.get(course["course_number"], 0) + rank(user, course)), combined_scores.get(course["course_number"], 0))

    for course in by_preference:
        combined_scores[course["course_number"]] = max((combined_scores.get(course["course_number"], 0) + rank(user, course)), combined_scores.get(course["course_number"], 0))

    
    merged = sorted(combined_scores.keys(), key=lambda x: combined_scores.get(x), reverse=True)
    # print(f"Recommended Courses: {merged}")

    return [get_course(course, courses) for course in merged[:top_n]]

if __name__ == "__main__":
    merge(SAMPLE_USER, COURSES, build_course_graph(COURSES), top_n=3)

    
