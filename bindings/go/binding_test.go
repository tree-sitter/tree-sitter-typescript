package tree_sitter_typescript_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter/tree-sitter-typescript"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_typescript.Language())
	if language == nil {
		t.Errorf("Error loading Typescript grammar")
	}
}
