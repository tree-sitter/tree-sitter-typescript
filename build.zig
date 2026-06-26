const std = @import("std");

const grammars = [_]struct { lib: []const u8, dir: []const u8 }{
    .{ .lib = "tree-sitter-typescript", .dir = "typescript" },
    .{ .lib = "tree-sitter-tsx", .dir = "tsx" },
};

pub fn build(b: *std.Build) void {
    const target = b.standardTargetOptions(.{});
    const optimize = b.standardOptimizeOption(.{});

    const shared = b.option(bool, "build-shared", "Build a shared library") orelse true;
    const reuse_alloc = b.option(bool, "reuse-allocator", "Reuse the library allocator") orelse false;

    const module = b.addModule("tree-sitter-typescript", .{
        .root_source_file = b.path("bindings/zig/root.zig"),
        .target = target,
        .optimize = optimize,
    });

    inline for (grammars) |g| {
        const grammar = b.createModule(.{
            .target = target,
            .optimize = optimize,
            .link_libc = true,
            .pic = if (shared) true else null,
        });
        const lib: *std.Build.Step.Compile = b.addLibrary(.{
            .name = g.lib,
            .linkage = if (shared) .dynamic else .static,
            .root_module = grammar,
        });

        grammar.addCSourceFiles(.{
            .files = &.{ g.dir ++ "/src/parser.c", g.dir ++ "/src/scanner.c" },
            .flags = &.{"-std=c11"},
        });

        if (reuse_alloc) {
            grammar.addCMacro("TREE_SITTER_REUSE_ALLOCATOR", "");
        }
        if (optimize == .Debug) {
            grammar.addCMacro("TREE_SITTER_DEBUG", "");
        }

        grammar.addIncludePath(b.path(g.dir ++ "/src"));
        grammar.addIncludePath(b.path("common"));

        b.installArtifact(lib);
        module.linkLibrary(lib);
    }

    b.installDirectory(.{
        .source_dir = b.path("queries"),
        .install_dir = .prefix,
        .install_subdir = "queries",
        .include_extensions = &.{"scm"},
    });

    const tests = b.addTest(.{
        .root_module = b.createModule(.{
            .root_source_file = b.path("bindings/zig/test.zig"),
            .target = target,
            .optimize = optimize,
        }),
    });
    tests.root_module.addImport("tree-sitter-typescript", module);

    const run_tests = b.addRunArtifact(tests);
    const test_step = b.step("test", "Run unit tests");
    test_step.dependOn(&run_tests.step);
}
