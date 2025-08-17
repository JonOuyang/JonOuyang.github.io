import json
import os

def load_data_from_file(filename):
    """Loads and validates the timeline data from a JSON file."""
    # Ensure the file has a .json extension
    if not filename.lower().endswith('.json'):
        print(f"Error: File '{filename}' is not a .json file.")
        return None

    # Ensure the file exists
    if not os.path.exists(filename):
        print(f"Error: File '{filename}' not found.")
        return None

    try:
        with open(filename, 'r') as f:
            data = json.load(f)
        
        # Basic validation of the loaded data structure
        if 'nodes' not in data or not isinstance(data['nodes'], list):
            print("Error: JSON file must contain a 'nodes' array.")
            return None
            
        return data

    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from '{filename}'. Please check its format.")
        return None
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        return None

def build_graph(nodes):
    """Builds a graph representation from the list of nodes."""
    return {node['id']: node for node in nodes}

def print_git_graph(nodes, nodes_map, branch_filter=None):
    """Prints a Git-style graph of the timeline."""
    if not nodes:
        print("No events to display.")
        return

    # Determine the set of nodes to display based on the filter
    if branch_filter and branch_filter != 'all':
        # Start with nodes that are directly of the filtered type
        node_ids_to_display = {node['id'] for node in nodes if branch_filter in node['type']}
        
        # Iteratively add all ancestors of these nodes to show their history
        nodes_to_trace = set(node_ids_to_display)
        while nodes_to_trace:
            current_id = nodes_to_trace.pop()
            # This check is needed in case a node ID from 'prev' isn't in our map
            if current_id in nodes_map:
                for prev_id in nodes_map[current_id].get('prev', []):
                    if prev_id not in node_ids_to_display:
                        node_ids_to_display.add(prev_id)
                        nodes_to_trace.add(prev_id)
        
        nodes_to_render = [node for node in nodes if node['id'] in node_ids_to_display]
    else:
        # If no filter, render all nodes
        nodes_to_render = nodes
    
    # Sort the final list of nodes to be rendered by date
    sorted_nodes = sorted(nodes_to_render, key=lambda x: x['date'])
    
    print("\n--- Timeline Graph ---\n")

    # This is a simplified rendering logic. A more complex one would track parallel branches.
    for i, node in enumerate(sorted_nodes):
        is_merge = len(node.get('prev', [])) > 1
        commit_char = '✳️' if is_merge else '*' # Use emoji for merge commits

        # Basic visualization of branching and timeline continuation
        if i > 0:
            # Check if this node follows directly from the previous one in the sorted list
            prev_node_id = sorted_nodes[i-1]['id']
            if node['id'] not in sorted_nodes[i-1].get('next', []):
                 print('|\\') # Indicates a divergence or a jump in the timeline
            else:
                 print('|')

        print(f'{commit_char} ({node["date"]}) {node["title"]} [{", ".join(node["type"])}]')

if __name__ == "__main__":
    # 2. Load and validate data
    data = load_data_from_file("/Users/jonathanouyang/Desktop/apple-iphone-website-clone/src/experience-components/experience.json")

    if data:
        nodes_list = data['nodes']
        nodes_map = build_graph(nodes_list)

        # 3. Get user input for branch filtering
        # Dynamically find all available branches from the data
        all_types = set(t for node in nodes_list for t in node['type'] if t != 'main')
        available_branches = f"all, main, {', '.join(sorted(list(all_types)))}"
        
        print(f"\nAvailable branches: {available_branches}")
        branch_choice = input("Enter branch to display (or 'all'): ").strip().lower()

        if branch_choice not in available_branches.split(', '):
            print(f"Invalid branch '{branch_choice}'. Defaulting to 'all'.")
            branch_choice = 'all'

        # 4. Render the graph
        print_git_graph(nodes_list, nodes_map, branch_choice)