from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import json
import numpy as np
from course_recommender import CourseRecommender

app = Flask(__name__)
CORS(app)

# Initialize the recommender system
openai_api_key = os.environ.get('OPENAI_API_KEY')
recommender = CourseRecommender(openai_api_key)

# Dictionary to store user embeddings
user_embeddings = {}

# Load course data (in production, this would come from a database)
@app.route('/api/load-courses', methods=['POST'])
def load_courses():
    try:
        # Get data from request
        data = request.json
        courses = data.get('courses', [])
        content_weight = data.get('content_weight', 0.7)
        experience_weight = data.get('experience_weight', 0.3)
        
        # Load courses into recommender
        recommender.load_courses(courses, content_weight=content_weight, experience_weight=experience_weight)
        
        return jsonify({
            'success': True,
            'message': f'Successfully loaded {len(courses)} courses'
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# User onboarding API endpoint
@app.route('/api/user/onboard', methods=['POST'])
def onboard_user():
    try:
        # Get data from request
        data = request.json
        user_id = data.get('user_id')
        interests = data.get('interests')
        
        if not user_id or not interests:
            return jsonify({
                'success': False,
                'error': 'Missing user_id or interests'
            }), 400
        
        # Generate user embedding from interests
        embedding = recommender.onboard_user(interests)
        
        # Store the embedding for future use
        user_embeddings[user_id] = embedding.tolist()  # Convert to list for JSON serialization
        
        return jsonify({
            'success': True,
            'message': 'User onboarding successful',
            'user_id': user_id
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Get personalized recommendations API endpoint
@app.route('/api/user/recommend', methods=['POST'])
def user_recommend():
    try:
        # Get data from request
        data = request.json
        user_id = data.get('user_id')
        filters = data.get('filters')
        top_n = data.get('top_n', 5)
        
        if not user_id:
            return jsonify({
                'success': False,
                'error': 'Missing user_id'
            }), 400
        
        # Check if user embedding exists
        if user_id not in user_embeddings:
            return jsonify({
                'success': False,
                'error': 'User not found or not onboarded'
            }), 404
        
        # Get user embedding
        user_embedding = np.array(user_embeddings[user_id])
        
        # Get recommendations
        recommendations = recommender.recommend_for_user(
            user_embedding, 
            filters=filters, 
            top_n=top_n
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Query-based recommendations API endpoint (for direct queries without user profiling)
@app.route('/api/query/recommend', methods=['POST'])
def query_recommend():
    try:
        # Get data from request
        data = request.json
        query = data.get('query')
        content_weight = data.get('content_weight', 0.7)
        experience_weight = data.get('experience_weight', 0.3)
        filters = data.get('filters')
        top_n = data.get('top_n', 5)
        
        if not query:
            return jsonify({
                'success': False,
                'error': 'Missing query'
            }), 400
        
        # Get recommendations based on query
        recommendations = recommender.recommend(
            query, 
            content_weight=content_weight, 
            experience_weight=experience_weight,
            filters=filters, 
            top_n=top_n
        )
        
        return jsonify({
            'success': True,
            'recommendations': recommendations
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Get available filter options API endpoint
@app.route('/api/filter-options', methods=['GET'])
def get_filter_options():
    try:
        # Extract unique values for potential filters
        class_codes = set()
        professors = set()
        
        for course in recommender.courses:
            # Extract class code from course_name (assuming format like "CS101: ...")
            if ':' in course['course_name']:
                code = course['course_name'].split(':')[0].strip()
                class_codes.add(code)
            
            # Extract professor from course_name (assuming format like "... - Prof. Smith")
            if ' - Prof. ' in course['course_name']:
                prof = course['course_name'].split(' - Prof. ')[1].strip()
                professors.add(prof)
        
        return jsonify({
            'success': True,
            'classCodes': sorted(list(class_codes)),
            'professors': sorted(list(professors))
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    # Load initial sample data (in production, would load from database)
    with open('sample_courses.json', 'r') as f:
        sample_courses = json.load(f)
    
    recommender.load_courses(sample_courses)
    app.run(debug=True)