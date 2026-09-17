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

## Developing the ESM prototype

Use matching prototype checkouts of `tree-sitter`, `tree-sitter-javascript`,
and `tree-sitter-typescript` as sibling directories. First install the JavaScript
checkout's dependencies as described in its README. Node.js, npm, Rust/Cargo,
and a C/C++ toolchain are required.

```sh
npm ci --ignore-scripts
npm rebuild node-addon-api node-gyp-build tree-sitter
npm run lint
npm run generate
npm rebuild tree-sitter-typescript
npm run test:corpus
npm test
```

`generate` builds **both** dialects from the repository root so the native
runtime can resolve the shared `node_modules` dependencies. `test:corpus` runs from the
repository root, where `test/corpus` and `tree-sitter.json` live; the CLI loads
both dialects and honors the corpus's `:language` directives. Untagged cases
use the default TypeScript grammar. Running tests inside a dialect directory
would not find the shared corpus.

Shared rules live in `common/grammar.mjs`, imported by `typescript/grammar.mjs` and
`tsx/grammar.mjs`. The root package and Node bindings remain CommonJS.
The local CLI package supplies `tree-sitter-cli/dsl.d.ts`.

This branch also updates the JavaScript base from the older npm dependency to
the matching prototype checkout. Its `using_declaration` rule replaces the old
TypeScript `using` assignment prefix. The decorator member rule explicitly
accepts `super`, preserving its existing tree shape under the base grammar's
new reserved-word configuration.

`npm run tree-sitter -- --help` builds and runs the core prototype using Cargo;
generation explicitly selects its native runtime, not the released npm CLI.
Set `TREE_SITTER_DIR` to an absolute core checkout path when it is not a sibling.
This changes the Cargo wrapper only: npm's local dependencies still require the
sibling layout. Keep the relative paths in `package.json` and `package-lock.json`
portable rather than replacing them with machine-specific paths.

Hosted workflows still use release setup actions. They need matching prototype
sibling checkouts and the Cargo wrapper before they can generate or install this
prototype; the local commands above are the validation path.

[tree-sitter]: https://github.com/tree-sitter/tree-sitter
[flow]: https://flow.org/en/

References

- [TypeScript Language Spec](https://github.com/microsoft/TypeScript/blob/30cb20434a6b117e007a4959b2a7c16489f86069/doc/spec-ARCHIVED.md)

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter/tree-sitter-typescript/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/tree-sitter-typescript?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-typescript?logo=rust
[pypi]: https://img.shields.io/pypi/v/tree-sitter-typescript?logo=pypi&logoColor=ffd242
