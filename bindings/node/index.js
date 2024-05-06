const root = require("path").join(__dirname, "..", "..");

module.exports = require("node-gyp-build")(root);

try {
  module.exports.typescript.nodeTypeInfo = require("../../typescript/src/node-types.json");
  module.exports.tsx.nodeTypeInfo = require("../../tsx/src/node-types.json");
} catch (_) { }
