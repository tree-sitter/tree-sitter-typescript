// Run the prototype from source, never the npm package's downloaded release.
const {spawnSync} = require('node:child_process');
const path = require('node:path');

const core = process.env.TREE_SITTER_DIR ||
  path.resolve(__dirname, '../../tree-sitter');
const result = spawnSync('cargo', [
  'run', '--quiet', '--manifest-path', path.join(core, 'Cargo.toml'),
  '--package', 'tree-sitter-cli', '--bin', 'tree-sitter', '--',
  ...process.argv.slice(2),
], {stdio: 'inherit'});

if (result.error) {
  console.error(result.error.message);
}
process.exit(result.status ?? 1);
