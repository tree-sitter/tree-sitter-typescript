# tree-sitter-typescript

[![CI][ci]](https://github.com/tree-sitter/tree-sitter-typescript/actions/workflows/ci.yml)
[![discord][discord]](https://discord.gg/w7nTvsVJhm)
[![matrix][matrix]](https://matrix.to/#/#tree-sitter-chat:matrix.org)
[![crates][crates]](https://crates.io/crates/tree-sitter-typescript)
[![npm][npm]](https://www.npmjs.com/package/tree-sitter-typescript)
[![pypi][pypi]](https://pypi.org/project/tree-sitter-typescript)

TypeScript and TSX grammars for [tree-sitter][].

## Getting started
Install the package.
```
npm i tree-sitter-typescript
```


### Node
If you'd like to run [tree-sitter in Node.js](https://tree-sitter.github.io/node-tree-sitter/):
```
npm i tree-sitter
```
Create a parser using the Node runtime.
```ts
import Parser from 'tree-sitter'
import { typescript, tsx } from "tree-sitter-typescript" // choose your grammar

const parser = new Parser()
parser.setLanguage(typescript)
```

### WASM 
If you'd like to run [tree-sitter in the browser](https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md):
```
npm i web-tree-sitter
```

Add these script to `package.json`
```json
"copy-wasm": "cp node_modules/tree-sitter-typescript/tree-sitter-tsx.wasm public && cp node_modules/web-tree-sitter/tree-sitter.wasm public",
"postinstall": "copy-wasm",
```

Create a parser using the WASM runtime.
```ts
import { Language, Parser } from "web-tree-sitter"

await Parser.init({
  locateFile(scriptName: string) {
    return scriptName
  },
})

const parser = new Parser()

const language = await Language.load("/tree-sitter-tsx.wasm")
parser.setLanguage(language)
```

The above example uses the `tsx` grammar, change the `copy-wasm` script and `language.load` path if you'd like to use the `tree-sitter-typescript.wasm` grammar.
Getting the WASM bindings to work in the browser can be tricky. For more information, please read the tree-sitter web binding docs: https://github.com/tree-sitter/tree-sitter/blob/master/lib/binding_web/README.md

### Use your parser
```ts
const source = "let x = 1"
const tree = parser.parse(source)

if (tree?.rootNode.toString() === "(program (lexical_declaration (variable_declarator name: (identifier) value: (number))))") {
  console.log("Hello, tree-sitter!")
}
```

For Javascript files with [flow] type annotations you can use the `tsx` parser.

[tree-sitter]: https://github.com/tree-sitter/tree-sitter
[flow]: https://flow.org/en/

References:
- [TypeScript Language Spec](https://github.com/microsoft/TypeScript/blob/30cb20434a6b117e007a4959b2a7c16489f86069/doc/spec-ARCHIVED.md)

[ci]: https://img.shields.io/github/actions/workflow/status/tree-sitter/tree-sitter-typescript/ci.yml?logo=github&label=CI
[discord]: https://img.shields.io/discord/1063097320771698699?logo=discord&label=discord
[matrix]: https://img.shields.io/matrix/tree-sitter-chat%3Amatrix.org?logo=matrix&label=matrix
[npm]: https://img.shields.io/npm/v/tree-sitter-typescript?logo=npm
[crates]: https://img.shields.io/crates/v/tree-sitter-typescript?logo=rust
[pypi]: https://img.shields.io/pypi/v/tree-sitter-typescript?logo=pypi&logoColor=ffd242
