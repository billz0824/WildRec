import sys
import os


parent_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(parent_dir)


from backend import routes
import networkx as nx



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

def filter_taken(user, course_graph):
    taken_numbers = user['past_classes']
    taken = []
    for t in taken_numbers:
        taken.append(routes.courses.Course.query.filter_by(number=t).first())

    for course in taken:
        course_graph = remove_node_and_predecessors(course_graph, course)
    return list(course_graph.nodes)

#############################################################
# This defines a function that filters out courses by major #
#############################################################

def filter_major(major, courses):
    allowed = []
    for course in courses:
        course_major = course["course_number"].split(" ")[0].upper()
        if course_major == major:
            allowed.append(course)
    return allowed





