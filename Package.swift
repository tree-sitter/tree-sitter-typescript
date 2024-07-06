// swift-tools-version:5.3
import PackageDescription

let package = Package(
    name: "TreeSitterTypeScript",
    products: [
        .library(name: "TreeSitterTypeScript", targets: ["TreeSitterTypeScript"])
    ],
    dependencies: [],
    targets: [
        .target(
            name: "TreeSitterTypeScript",
            path: ".",
            exclude: [
                "Cargo.toml",
                "Makefile",
                "binding.gyp",
                "bindings/go",
                "bindings/node",
                "bindings/python",
                "bindings/rust",
                "common/common.mak",
                "common/define-grammar.js",
                "package.json",
                "package-lock.json",
                "pyproject.toml",
                "setup.py",
                "test",
                ".editorconfig",
                ".github",
                ".gitignore",
                ".gitattributes",
            ],
            sources: [
                "typescript/src/parser.c",
                "typescript/src/scanner.c",
                "tsx/src/parser.c",
                "tsx/src/scanner.c",
            ],
            resources: [
                .copy("queries"),
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("typescript/src")]
        ),
    ]
)
