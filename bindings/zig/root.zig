extern fn tree_sitter_typescript() callconv(.c) *const anyopaque;
extern fn tree_sitter_tsx() callconv(.c) *const anyopaque;

pub fn typescript() *const anyopaque {
    return tree_sitter_typescript();
}

pub fn tsx() *const anyopaque {
    return tree_sitter_tsx();
}
