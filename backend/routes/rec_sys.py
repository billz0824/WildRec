import os
from dotenv import load_dotenv
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import json
import openai
import networkx as nx
import time


# Configurations
CONTENT_WEIGHT = 0.7
EXPERIENCE_WEIGHT = 0.3
TOP_N = 5



def get_course(number, courses):
    for i in courses:
        if i["number"] == number:
            return i


###############################################################
# This function generates user preferences based on user info #
###############################################################

def generate_user_preference_summary(user_info, courses, delay=5):

    # Reformat ratings into descriptive text
    preference_order = sorted(
        ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"],
        key=lambda x: -user_info["radar"][x]
    )
    preference_text = ", ".join(preference_order[:3])

    top_classes = user_info["top_classes"]
    if len(top_classes) > 0:
        top_classes_description = ", ".join([get_course(t, courses)['content_summary'] for t in top_classes])
    else:
        top_classes_description = "No past top classes provided."

    # Create the prompt
    prompt = f"""
    Generate a friendly and professional paragraph summarizing this user's course preferences.

    Context:
    - Major: {user_info["major"]}
    - Goal Description: {user_info["goal_description"]}
    - Most important course qualities (ranked): {preference_text}
    - Descriptions of past favorite past classes: {top_classes_description}
    - Taken courses: {", ".join(user_info["past_classes"])}

    Please highlight the user's academic interests and what they're looking for in future classes.
    Avoid listing the rating numbers, and instead turn them into qualitative insights.

    Return only the paragraph. Keep the paragraph to within 5 sentences.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        time.sleep(delay)
        print(f"User preference: {response.text}")
        return response.text.strip()
    except Exception as e:
        return f"Gemini Error: {e}"


################################################################################
# This function takes a graph G and a node N and removes all predecessors of N #
################################################################################

def remove_node_and_predecessors(G, target_node):
    predecessors = nx.ancestors(G, target_node)
    to_remove = predecessors.union({target_node})
    G_copy = G.copy()
    G_copy.remove_nodes_from(to_remove)
    return G_copy


#########################################################################
# This defines a function that filters out all previously taken courses #
#########################################################################

def filter_taken(user, courses, course_graph):
    taken_numbers = user['past_classes']
    for t in taken_numbers:
        course_graph = remove_node_and_predecessors(course_graph, t)
    numbers = list(course_graph.nodes)
    allowed = []
    for n in numbers:
        allowed.append(get_course(n, courses))
    # print(numbers)
    return allowed

#############################################################
# This defines a function that filters out courses by major #
#############################################################

def filter_major(major, courses):
    allowed = []
    for course in courses:
        course_major = course["number"].split(" ")[0].upper()
        if course_major == major:
            allowed.append(course)
    return allowed


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
            print(f"content_embedding: {len(content_embedding)}")
            print(f"experience_embedding: {len(experience_embedding)}")
            # Append embeddings to list
            self.content_embeddings.append(content_embedding)
            self.experience_embeddings.append(experience_embedding)
            
            # Pre-compute weighted combined embeddings
            combined = np.array(content_embedding) * content_weight + np.array(experience_embedding) * experience_weight
            self.combined_embeddings.append(combined)
            
        # Convert to numpy arrays for efficient computation
        self.content_embeddings = np.array(self.content_embeddings)
        self.experience_embeddings = np.array(self.experience_embeddings)
        self.combined_embeddings = np.array(self.combined_embeddings)
        
        # print(f"Loaded {len(self.courses)} courses with embeddings")
    
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
        
        print(f"combined_embeddings shape: {self.combined_embeddings.shape}")
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
    
def recommend(user, courses, course_graph, method="preference", top_n=3):
    api_key = os.getenv('OPENAI_API_KEY')
    if not api_key:
        # print("Error: OPENAI_API_KEY not found in .env file")
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

    user_embedding = recommender.onboard_user(user_preference)
    user_recommendations = recommender.recommend_for_user(user_embedding, top_n=top_n)
    
    
    return user_recommendations

def rank(user, course):
    user_preferences = [user["radar"][s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
    course_attributes = [course["radar"][s] for s in ["liked", "difficulty", "practicality", "collaborative", "rewarding", "instruction"]]
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
        combined_scores[course["number"]] = max((combined_scores.get(course["number"], 0) + rank(user, course)), combined_scores.get(course["number"], 0))

    for course in by_preference:
        combined_scores[course["number"]] = max((combined_scores.get(course["number"], 0) + rank(user, course)), combined_scores.get(course["number"], 0))

    
    merged = sorted(combined_scores.keys(), key=lambda x: combined_scores.get(x), reverse=True)
    # print(f"Recommended Courses: {merged}")

    return [get_course(course, courses) for course in merged[:top_n]]

