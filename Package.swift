// swift-tools-version:5.3
import PackageDescription

let package = Package(
  name: "TreeSitterTypeScript",
  products: [
    .library(name: "TreeSitterTypeScript", targets: ["TreeSitterTypeScript"]),
  ],
  dependencies: [
    .package(url: "https://github.com/ChimeHQ/SwiftTreeSitter", from: "0.8.0"),
  ],
  targets: [
    .target(
      name: "TreeSitterTypeScript",
      path: ".",
      exclude: [
        "Cargo.toml",
        "Makefile",
        "binding.gyp",
        "bindings/c",
        "bindings/go",
        "bindings/node",
        "bindings/python",
        "bindings/rust",
        "prebuilds",
        "grammar.js",
        "package.json",
        "package-lock.json",
        "pyproject.toml",
        "setup.py",
        "test",
        "examples",
        ".editorconfig",
        ".github",
        ".gitignore",
        ".gitattributes",
        ".gitmodules",
      ],
      sources: [
        "typescript/src/parser.c",
        "typescript/src/scanner.c",
        "tsx/src/parser.c",
        "tsx/src/scanner.c",
      ],
      resources: [
        .copy("queries")
      ],
      publicHeadersPath: "bindings/swift",
      cSettings: [.headerSearchPath("typescript/src")]
    ),
    .testTarget(
      name: "TreeSitterTypeScriptTests",
      dependencies: [
        "SwiftTreeSitter",
        "TreeSitterTypeScript",
      ],
      path: "bindings/swift/TreeSitterTypeScriptTests"
    )
  ]
)
