# tree-sitter-typescript

[![CI][ci]](https://github.com/tree-sitter/tree-sitter-typescript/actions/workflows/ci.yml)
[![discord][discord]](https://discord.gg/w7nTvsVJhm)
[![matrix][matrix]](https://matrix.to/#/#tree-sitter-chat:matrix.org)
[![crates][crates]](https://crates.io/crates/tree-sitter-typescript)
[![npm][npm]](https://www.npmjs.com/package/tree-sitter-typescript)
[![pypi][pypi]](https://pypi.org/project/tree-sitter-typescript)

TypeScript and TSX grammars for [tree-sitter][].

Because TSX and TypeScript are actually two different dialects, this module defines two grammars. Require them as follows:

```js
require("tree-sitter-typescript").typescript; // TypeScript grammar
require("tree-sitter-typescript").tsx; // TSX grammar
```

For Javascript files with [flow] type annotations you can use the `tsx` parser.

[tree-sitter]: https://github.com/tree-sitter/tree-sitter
[flow]: https://flow.org/en/

## Python usage

The `tree-sitter` library is required for this package. Ensure you have `pip` installed.

```console
pip install tree-sitter
```

First, install the package using pip:
```console
pip install .
```

This package allows you to load both TypeScript and TSX grammars as a Language object in Python. Here's how you can do it:

```python
import tree_sitter_typescript as tstypescript
from tree_sitter import Language, Parser

# Load TypeScript grammar
TYPESCRIPT_LANGUAGE = Language(tstypescript.language_typescript())

# Load TSX grammar
TSX_LANGUAGE = Language(tstypescript.language_tsx())
```

### Practical Example
For a practical example of how to use these grammars with `tree-sitter` python library, please refer to the test file located at [`bindings/python/tree_sitter_typescript/test.py`](bindings/python/tree_sitter_typescript/test.py).

You can test a successful installation by running the following command:

```console
python bindings/python/tree_sitter_typescript/test.py
```
This will execute the test script, which demonstrates how to parse TypeScript and TSX code using the tree-sitter library.

## References

- [TypeScript Language Spec](https://github.com/microsoft/TypeScript/blob/main/doc/spec-ARCHIVED.md)
- [tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter/tree-sitter-typescript/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/tree-sitter-typescript?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-typescript?logo=rust
[pypi]: https://img.shields.io/pypi/v/tree-sitter-typescript?logo=pypi&logoColor=ffd242
