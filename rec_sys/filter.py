import networkx as nx
from generate_preferences import get_course




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
    print(numbers)
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





