package tree_sitter_typescript_test

import (
	"testing"

	tree_sitter "github.com/smacker/go-tree-sitter"
	"github.com/tree-sitter-grammars/tree-sitter-typescript"
)

func TestCanLoadTypescriptGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_typescript.LanguageTypescript())
	if language == nil {
		t.Errorf("Error loading TypeScript grammar")
	}
}

func TestCanLoadTSXGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_typescript.LanguageTSX())
	if language == nil {
		t.Errorf("Error loading TSX grammar")
	}
}
