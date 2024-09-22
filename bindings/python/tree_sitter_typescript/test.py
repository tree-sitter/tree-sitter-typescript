import tree_sitter_typescript as tstypescript
from tree_sitter import Language, Parser

# Load TypeScript and TSX grammars
TYPESCRIPT_LANGUAGE = Language(tstypescript.language_typescript())
TSX_LANGUAGE = Language(tstypescript.language_tsx())

# Create a parser for TypeScript
typescript_parser = Parser()
typescript_parser.language = TYPESCRIPT_LANGUAGE

# Create a parser for TSX
tsx_parser = Parser()
tsx_parser.language = TSX_LANGUAGE

# Create a simple TypeScript code snippet
typescript_code = """
function add(a: number, b: number): number {
    return a + b;
}
"""

# Parse the TypeScript code
try:
    typescript_tree = typescript_parser.parse(bytes(typescript_code, "utf8"))
except Exception as e:
    print(f"Error parsing TypeScript code: {e}")

# Create a simple TSX code snippet
tsx_code = """
import React from 'react';

function App() {
    return (
        <div className="App">
            <header className="App-header">
                <p>
                    Hello, world!
                </p>
            </header>
        </div>
    );
}

export default App;
"""

# Parse the TSX code
try:
    tsx_tree = tsx_parser.parse(bytes(tsx_code, "utf8"))
except Exception as e:
    print(f"Error parsing TSX code: {e}")

# Print the root nodes of the syntax trees
print("\nTypeScript root node:", typescript_tree.root_node)
print("\nTSX root node:", tsx_tree.root_node)

# Check if the root nodes represent programs
assert typescript_tree.root_node.type == 'program', "TypeScript root node does not represent a program"
assert tsx_tree.root_node.type == 'program', "TSX root node does not represent a program"

# Check if the root nodes have children
assert typescript_tree.root_node.child_count > 0, "TypeScript root node has no children"
assert tsx_tree.root_node.child_count > 0, "TSX root node has no children"

# Function to recursively print the tree structure
def print_tree(node, indent="", last='updown'):
    markers = {
        'updown': '├── ',
        'up': '└── ',
        'down': '│   ',
        'empty': '    '
    }
    print(f"{indent}{markers[last]}{node.type}")
    indent += markers['down'] if last == 'updown' else markers['empty']
    for i, child in enumerate(node.children):
        last = 'up' if i == len(node.children) - 1 else 'updown'
        print_tree(child, indent, last)

# Print the tree structure of the TypeScript code
print("\nTypeScript tree structure:")
print_tree(typescript_tree.root_node)

# Print the tree structure of the TSX code
print("\nTSX tree structure:")
print_tree(tsx_tree.root_node)

print("\ntree_sitter_typescript package is working!")