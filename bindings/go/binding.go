package tree_sitter_typescript

// #cgo CFLAGS: -std=c11 -fPIC
// #include "../../typescript/src/parser.c"
// #include "../../typescript/src/scanner.c"
// #include "../../tsx/src/parser.c"
// #include "../../tsx/src/scanner.c"
import "C"

import "unsafe"

// Get the TypeScript tree-sitter Language for this grammar.
func TypeScriptLanguage() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_typescript())
}

// Get the TSX tree-sitter Language for this grammar.
func TypeScriptLanguage() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_tsx())
}
