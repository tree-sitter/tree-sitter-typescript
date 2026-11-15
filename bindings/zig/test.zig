const testing = @import("std").testing;

const ts = @import("tree-sitter");
const root = @import("tree-sitter-typescript");
const Parser = ts.Parser;

test "can load typescript grammar" {
    const parser = Parser.create();
    defer parser.destroy();

    const lang: *const ts.Language = @ptrCast(root.typescript());
    defer lang.destroy();

    try testing.expectEqual(void{}, parser.setLanguage(lang));
    try testing.expectEqual(lang, parser.getLanguage());
}

test "can load tsx grammar" {
    const parser = Parser.create();
    defer parser.destroy();

    const lang: *const ts.Language = @ptrCast(root.tsx());
    defer lang.destroy();

    try testing.expectEqual(void{}, parser.setLanguage(lang));
    try testing.expectEqual(lang, parser.getLanguage());
}
