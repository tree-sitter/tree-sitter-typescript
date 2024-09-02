import XCTest
import SwiftTreeSitter
import TreeSitterTypeScript

final class TreeSitterTypeScriptTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language_typescript = Language(language: tree_sitter_typescript())
        XCTAssertNoThrow(try parser.setLanguage(language_typescript),
                         "Error loading TypeScript grammar")
        let language_tsx = Language(language: tree_sitter_tsx())
        XCTAssertNoThrow(try parser.setLanguage(language_tsx),
                         "Error loading TSX grammar")
    }
}
