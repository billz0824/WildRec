import networkx as nx
from 



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

def filter(user, course_graph):
    taken = user['past_classes']
    for course in taken:
        course_graph = remove_node_and_predecessors(course_graph, course)
    return list(course_graph.nodes)

#########################################################################
# This defines 


