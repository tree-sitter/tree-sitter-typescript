tree-sitter-typescript
===========================

[![Build Status](https://github.com/tree-sitter/tree-sitter-typescript/workflows/build/badge.svg)](https://github.com/tree-sitter/tree-sitter-typescript/actions?query=workflow%3Abuild)
[![Build status](https://ci.appveyor.com/api/projects/status/rn11gs5y3tm7tuy0/branch/master?svg=true)](https://ci.appveyor.com/project/maxbrunsfeld/tree-sitter-typescript/branch/master)

TypeScript and TSX grammars for [tree-sitter][].

Because TSX and TypeScript are actually two different dialects, this module defines two grammars. Require them as follows:

```js
require('tree-sitter-typescript').typescript; // TypeScript grammar
require('tree-sitter-typescript').tsx; // TSX grammar
```

[tree-sitter]: https://github.com/tree-sitter/tree-sitter

References

* [TypeScript Language Spec](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)

## Development

This repository contains the grammar definition in `common/define-grammar.js`, as well as query files in the `queries` directory.
The query files specify highlighting in `queries/highlights.scm`, and global and local names in `queries/tags.scm` and `queries/locals.scm`, respectively.
Name binding rules are defined using [stack-graphs][] in `queries/stack-graphs.tsg`.
Tests for the grammar and the stack graph rules can be found in `common/corpus` and `typescript/test/stack-graphs`, respectively.

Build the grammar as follows:

```
$ npm run build
```

Run the tests as follows (this requires the [cargo][] command to be installed):

```
$ npm run test
```

Contributors are expected to keep query files and stack graph up to date with the grammar.
Depending on the changes, updating the stack graph rules may not always be possible for contributors, as it requires knowledge of stack graphs.
This should not prevent development on the grammar and in such cases the @tree-sitter/semantic-code team should be pinged for support.
They will either help the contributor make the necessary changes, or approve a temporary disabling of stach graph tests in CI, so that the changes can be carried out at a later time.

[cargo]: https://doc.rust-lang.org/cargo
[stack-graphs]: https://github.com/github/stack-graphs
