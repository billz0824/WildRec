import networkx as nx

def build_course_graph(courses):
    G = nx.DiGraph()

    # Add each course as a node (the Course object itself)
    for course in courses:
        G.add_node(course["number"])
        # print(f"Added {course['course_number']} to graph!")

    for course in courses:
        for prereq_number in course["prerequisites"]:
            G.add_edge(prereq_number, course["number"])

    return G

