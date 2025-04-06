import networkx as nx
from models import course

def build_course_graph():
    from app import db
    G = nx.DiGraph()

    all_courses = course.Course.query.all()

    # Build a mapping from course number to Course object
    course_map = {course.number: course for course in all_courses}

    # Add each course as a node (the Course object itself)
    for course in all_courses:
        G.add_node(course)

    # Add edges based on prerequisites (u → v if u is a prerequisite of v)
    for course in all_courses:
        for prereq_number in course.prerequisites:
            prereq_course = course_map.get(prereq_number)
            if prereq_course:
                G.add_edge(prereq_course, course)

    return G

course_graph = build_course_graph()

