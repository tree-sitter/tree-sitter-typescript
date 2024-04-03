package tree_sitter_typescript_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-typescript"
)

func TestCanLoadTypeScriptGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_typescript.TypeScriptLanguage())
	if language == nil {
		t.Errorf("Error loading Typescript grammar")
	}
}

func TestCanLoadTSXGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_tsx.TSXLanguage())
	if language == nil {
		t.Errorf("Error loading TSX grammar")
	}
}
