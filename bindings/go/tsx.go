package tree_sitter_typescript

// #cgo CPPFLAGS: -I../../tsx/src
// #cgo CFLAGS: -std=c11 -fPIC
// #include "../../tsx/src/parser.c"
// #include "../../tsx/src/scanner.c"
import "C"

import "unsafe"

// Get the TSX tree-sitter Language for this grammar.
func TSXLanguage() unsafe.Pointer {
	return unsafe.Pointer(C.tree_sitter_tsx())
}
