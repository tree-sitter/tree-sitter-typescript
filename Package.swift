// swift-tools-version: 5.6
import PackageDescription

let package = Package(
    name: "TreeSitterTypeScript",
    platforms: [.macOS(.v10_13), .iOS(.v11)],
    products: [
        .library(name: "TreeSitterTypeScript", targets: ["TreeSitterTypeScript"])
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
                .copy("queries"),
            ],
            publicHeadersPath: "bindings/swift",
            cSettings: [.headerSearchPath("typescript/src")]
        ),
    ],
    cLanguageStandard: .c11
)
